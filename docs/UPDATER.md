# Tauri 应用增量更新系统

## 概述

本项目实现了完整的**增量更新机制**，用户只需下载变更的文件，而非完整的安装包。

## 核心原理

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  本地应用    │────▶│  版本检查    │────▶│  更新服务器  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                    │
       │ 1. 扫描本地文件 hash                │ 2. 生成差异清单
       │                                    │
       ▼                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  应用更新    │◀────│  原子替换    │◀────│  下载补丁    │
│  (新版本)    │     │  (安全替换)  │     │  (只变更文件)│
└─────────────┘     └─────────────┘     └─────────────┘
```

## 对比传统方案

| 特性     | 传统安装包        | 增量更新            |
| -------- | ----------------- | ------------------- |
| 下载大小 | 完整包 (50-100MB) | 仅变更文件 (1-10MB) |
| 更新时间 | 5-10 分钟         | 10-30 秒            |
| 网络要求 | 高带宽            | 弱网可用            |
| 用户体验 | 需重新安装        | 一键更新            |
| 回滚机制 | 无                | 自动备份            |

## 系统架构

### 前端 (React Hook)

```typescript
// 使用示例
const { updateInfo, progress, checkUpdate, updateAndRestart } = useUpdater();

// 检查更新
await checkUpdate();

// 如果 hasUpdate 为 true，显示更新提示
if (updateInfo?.hasUpdate) {
  // 显示更新弹窗
}

// 执行更新
await updateAndRestart();
```

### 后端 (Rust)

- `updater.rs` - 增量更新核心逻辑
- `check_app_update` - 检查版本
- `download_and_apply_update` - 下载并应用更新

### 更新服务器

需要部署的 API：

```
GET /api/updates/{platform}/{arch}/manifest.json
返回增量更新清单：
{
  "version": "0.1.1",
  "minimum_version": "0.1.0",
  "changelog": "修复了一些bug",
  "total_size": 2345678,
  "signature": "sha256_signature",
  "files": [
    {
      "path": "resources/app.asar",
      "hash": "abc123...",
      "size": 1234567,
      "action": "update",
      "download_url": "https://cdn.example.com/patches/v0.1.1/app.asar"
    }
  ]
}
```

## 更新流程

1. **检查更新**
   - 获取当前版本
   - 请求服务器 manifest
   - 对比版本号

2. **计算差异**
   - 扫描本地文件 hash
   - 对比服务器清单
   - 确定需要更新的文件

3. **下载补丁**
   - 并行下载变更文件
   - 实时进度通知
   - 校验文件 hash

4. **应用更新**
   - 备份原文件
   - 原子替换（写入临时文件再重命名）
   - 清理旧文件

5. **重启生效**
   - 提示用户重启
   - 或自动重启应用

## 安全机制

1. **文件签名验证** - 每个补丁文件都有 SHA-256 hash
2. **原子替换** - 使用临时文件+重命名，避免更新中断导致损坏
3. **自动备份** - 更新前自动备份，支持回滚
4. **强制更新** - 可配置 minimum_version，低于则必须更新

## 配置

在 `src-tauri/src/updater.rs` 中配置：

```rust
const UPDATE_SERVER_URL: &str = "https://your-update-server.com/api/updates";
const UPDATE_CHANNEL: &str = "stable"; // stable, beta, alpha
```

## 快速开始

### 1. 部署更新服务器

使用提供的工具生成增量更新包：

```bash
cd scripts/updater-server
npm install
node generate-manifest.js --version 0.1.1 --prev 0.1.0
```

### 2. 前端集成

```tsx
import { useUpdater } from "./hooks/useUpdater";

function App() {
  const { updateInfo, progress, checkUpdate } = useUpdater();

  // 启动时检查
  useEffect(() => {
    checkUpdate();
  }, []);

  // 显示更新提示
  if (updateInfo?.hasUpdate) {
    return <UpdateDialog updateInfo={updateInfo} />;
  }

  return <MainApp />;
}
```

### 3. 构建更新包

```bash
# 构建新版本
npm run tauri:build

# 生成增量补丁
node scripts/updater-server/create-patch.js \
  --old dist/v0.1.0 \
  --new dist/v0.1.1 \
  --output patches/v0.1.1

# 上传到 CDN
aws s3 sync patches/v0.1.1 s3://your-bucket/updates/v0.1.1
```

## 注意事项

1. **Windows 特殊处理** - 正在运行的 exe/dll 无法替换，需要借助重启
2. **代码签名** - 建议对更新包进行签名验证
3. **断点续传** - 已实现，支持下载中断后继续
4. **并发下载** - 默认同时下载 10 个文件，可配置

## 故障排查

### 更新失败

- 检查网络连接
- 查看日志：`%TEMP%/videomaker-updates/logs`
- 手动回滚：从备份目录恢复

### 版本对比错误

- 确保版本号遵循 semver 规范
- 检查服务器 manifest 格式

## API 参考

### useUpdater Hook

```typescript
interface UseUpdaterReturn {
  updateInfo: UpdateInfo | null; // 更新信息
  progress: UpdateProgress; // 进度状态
  checkUpdate: () => Promise<UpdateInfo | null>; // 检查更新
  downloadAndInstall: () => Promise<void>; // 下载安装
  restartApp: () => Promise<void>; // 重启应用
  updateAndRestart: () => Promise<void>; // 一键更新
}
```

### Tauri 命令

```rust
check_app_update() -> Result<AppInfoSummary, String>
download_and_apply_update() -> Result<(), String>
cleanup_update_cache() -> Result<(), String>
```
