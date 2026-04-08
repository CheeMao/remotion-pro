# 增量更新策略详解

## 问题2：跨版本更新的解决方案

### 场景分析

```
用户A (新用户)        用户B (老用户)         用户C (很久没更新)
    │                      │                       │
    ▼                      ▼                       ▼
 当前版本                0.1.0                  0.0.5
    │                      │                       │
    │                  中间版本                  中间版本
    │                      │                       │
    │                   0.1.1                   0.0.6
    │                      │                       │
    │                   0.1.2                   0.0.7
    │                      │                       │
    │                      │                       │
    └──────────┬───────────┴──────────┬────────────┘
               │                      │
               ▼                      ▼
         下载完整包              下载增量补丁
         (50MB)                 (5-10MB)
```

### 解决方案：智能更新策略

#### 策略1：就近增量更新（推荐）

```
用户版本: 0.0.5
最新版本: 0.2.0

更新路径:
0.0.5 ──(增量)──▶ 0.0.6 ──(增量)──▶ 0.0.7 ──...──▶ 0.2.0

总下载: 5个增量包 = 8MB (vs 完整包 50MB)
```

**实现方式：**

```rust
// 后端逻辑
async fn calculate_update_path(current: &str, target: &str) -> UpdatePath {
    let current_ver = parse_version(current);
    let target_ver = parse_version(target);

    // 如果跨版本太多，提供累计补丁
    if target_ver.minor - current_ver.minor > 2 {
        // 提供直接从 0.0.5 到 0.2.0 的累计补丁
        return UpdatePath::CumulativePatch {
            from: current.to_string(),
            to: target.to_string(),
            size: 15_000_000, // 15MB，比 50MB 完整包小
        };
    }

    // 否则按步更新
    UpdatePath::Incremental {
        steps: vec!["0.0.6", "0.0.7", "0.1.0", "0.1.1", "0.2.0"],
        total_size: 8_000_000,
    }
}
```

#### 策略2：累计补丁（跨版本优化）

```
补丁类型对比:

增量补丁 (0.1.0 → 0.1.1):    2MB
增量补丁 (0.1.1 → 0.1.2):    1MB
增量补丁 (0.1.2 → 0.2.0):    5MB
                          ─────────
累计更新总计:                  8MB

累计补丁 (0.1.0 → 0.2.0):     6MB  ✓ 更优
完整包:                       50MB
```

**服务器存储结构：**

```
updates/
├── 0.1.0/
│   └── manifest.json           # 基础版本
├── 0.1.1/
│   ├── manifest.json
│   ├── patch-from-0.1.0.zip    # 增量 0.1.0 → 0.1.1
│   └── full-package.zip        # 完整包（给新用户）
├── 0.2.0/
│   ├── manifest.json
│   ├── patch-from-0.1.0.zip    # 累计补丁 0.1.0 → 0.2.0
│   ├── patch-from-0.1.1.zip    # 增量 0.1.1 → 0.2.0
│   ├── patch-from-0.1.2.zip    # 增量 0.1.2 → 0.2.0
│   └── full-package.zip        # 完整包
└── cumulative/
    ├── 0.1.0-to-0.2.0.zip      # 大跨版本累计补丁
    └── 0.0.x-to-0.2.0.zip      # 超大跨版本补丁
```

#### 策略3：智能选择算法

```rust
pub async fn get_optimal_update_path(
    current_version: &str,
    target_version: &str,
) -> UpdateStrategy {
    let current = parse_version(current_version);
    let target = parse_version(target_version);

    // 计算版本差距
    let version_gap = (target.major - current.major) * 100
                    + (target.minor - current.minor) * 10
                    + (target.patch - current.patch);

    match version_gap {
        0 => UpdateStrategy::NoUpdate,

        // 差距 1-2 个小版本：直接增量更新
        1..=2 => UpdateStrategy::Incremental {
            patches: vec![target_version.to_string()],
        },

        // 差距 3-5 个版本：累计补丁
        3..=5 => UpdateStrategy::Cumulative {
            patch: format!("patch-from-{}-to-{}.zip", current_version, target_version),
            estimated_size: version_gap as u64 * 3_000_000, // 约每版本 3MB
        },

        // 差距太大：建议下载完整包
        _ => UpdateStrategy::FullPackage {
            url: get_full_package_url(target_version),
            size: 50_000_000,
            reason: "跨版本太多，建议重新下载",
        },
    }
}
```

### 更新决策流程图

```
用户点击"检查更新"
        │
        ▼
获取当前版本 ──▶ 获取服务器最新版本
        │
        ▼
   版本对比
        │
   ┌────┴────┐
   │         │
无需更新    需要更新
   │         │
   │         ▼
   │    用户是新用户?
   │         │
   │    ┌────┴────┐
   │    是        否
   │    │         │
   │    ▼         ▼
   │  下载      计算更新
   │  完整包    路径
   │    │         │
   │    │    ┌────┴────┐
   │    │   差距小   差距大
   │    │    │         │
   │    │    ▼         ▼
   │    │  增量     累计/完整
   │    │  补丁       包
   │    │    │         │
   │    └────┴────┬────┘
   │              │
   │              ▼
   │         下载更新文件
   │              │
   │              ▼
   │         验证文件完整性
   │              │
   └──────────────┘
                  │
                  ▼
            应用更新
                  │
                  ▼
            重启应用
```

### 实现代码

```rust
// updater.rs - 更新策略实现

#[derive(Debug, Clone)]
pub enum UpdateStrategy {
    NoUpdate,
    Incremental { patches: Vec<String> },
    Cumulative { patch: String, size: u64 },
    FullPackage { url: String, size: u64, reason: String },
}

#[tauri::command]
pub async fn get_update_strategy(
    current_version: String,
) -> Result<UpdateStrategy, String> {
    // 获取最新版本
    let latest = fetch_latest_version().await?;

    if current_version == latest {
        return Ok(UpdateStrategy::NoUpdate);
    }

    // 解析版本
    let current = Version::parse(&current_version)?;
    let target = Version::parse(&latest)?;

    // 计算差距
    let gap = calculate_version_gap(&current, &target);

    let strategy = match gap {
        0 => UpdateStrategy::NoUpdate,

        1..=3 => {
            // 小差距：逐步增量更新
            let patches = fetch_incremental_patches(&current_version, &latest).await?;
            UpdateStrategy::Incremental { patches }
        }

        4..=10 => {
            // 中等差距：累计补丁
            let patch_file = format!("cumulative/{}-to-{}.patch", current_version, latest);
            let size = get_patch_size(&patch_file).await?;
            UpdateStrategy::Cumulative {
                patch: patch_file,
                size
            }
        }

        _ => {
            // 大差距：建议完整包
            UpdateStrategy::FullPackage {
                url: get_full_package_url(&latest),
                size: get_full_package_size(&latest).await?,
                reason: "您的版本较旧，建议下载完整安装包以获得最佳体验".to_string(),
            }
        }
    };

    Ok(strategy)
}
```

### 前端展示

```tsx
// UpdateDialog.tsx
function UpdateDialog({ strategy }: { strategy: UpdateStrategy }) {
  switch (strategy.type) {
    case "incremental":
      return (
        <div>
          <h3>发现新版本</h3>
          <p>需要下载 {strategy.totalSize} MB 的更新文件</p>
          <p>预计用时 2 分钟</p>
          <Button onClick={startUpdate}>立即更新</Button>
        </div>
      );

    case "cumulative":
      return (
        <div>
          <h3>发现重大更新</h3>
          <p>您的版本与最新版相差 {strategy.gap} 个版本</p>
          <p>下载累计更新包: {strategy.size} MB</p>
          <Button onClick={startUpdate}>下载更新</Button>
        </div>
      );

    case "full":
      return (
        <div>
          <h3>建议重新下载</h3>
          <p>{strategy.reason}</p>
          <p>完整安装包大小: {strategy.size} MB</p>
          <Button onClick={() => openExternal(strategy.url)}>
            前往下载页面
          </Button>
        </div>
      );
  }
}
```

### 最佳实践

1. **定期清理旧补丁** - 只保留最近 5-10 个版本的补丁
2. **优先使用增量** - 小版本更新用增量，大版本用累计
3. **阈值设置** - 超过 10 个版本差异建议重新下载
4. **用户提示** - 明确告知用户下载大小和预计时间
