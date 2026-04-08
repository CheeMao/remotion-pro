# 版本发布管理指南

## 每次发布新版本的完整流程

### 1. 更新版本号

```bash
# 1.1 更新 Tauri 版本 (Cargo.toml)
# 修改 src-tauri/Cargo.toml 中的 version 字段
version = "0.2.0"  # 旧版本是 0.1.0

# 1.2 更新前端版本 (package.json)
# 修改 app/package.json 中的 version 字段
"version": "0.2.0"

# 1.3 更新主项目版本
# 修改根目录 package.json 中的 version 字段
"version": "0.2.0"
```

### 2. 构建应用

```bash
# 2.1 构建前端
npm run build:app

# 2.2 构建 Tauri 应用
npm run tauri:build

# 构建输出位置:
# src-tauri/target/release/bundle/
#   ├── msi/          # Windows 安装包
#   ├── nsis/         # Windows 便携版
#   ├── dmg/          # macOS 安装包
#   └── appimage/     # Linux 安装包
```

### 3. 生成增量补丁

```bash
# 使用发布管理工具
cd scripts/release-manager

# 3.1 准备目录结构
node prepare-release.js --version 0.2.0

# 3.2 生成增量更新补丁
# 针对上一个版本
node generate-patch.js \
  --current 0.1.0 \
  --target 0.2.0 \
  --platform windows \
  --arch x64

# 针对更早版本（生成累计补丁）
node generate-patch.js \
  --current 0.0.9 \
  --target 0.2.0 \
  --platform windows \
  --arch x64 \
  --cumulative
```

### 4. 上传到更新服务器

```bash
# 4.1 上传完整安装包（给新用户使用）
aws s3 cp \
  src-tauri/target/release/bundle/msi/*.msi \
  s3://your-bucket/releases/0.2.0/

# 4.2 上传增量补丁（给老用户更新）
aws s3 sync \
  releases/patches/0.2.0/ \
  s3://your-bucket/updates/0.2.0/

# 4.3 更新版本索引
aws s3 cp \
  releases/versions.json \
  s3://your-bucket/updates/versions.json
```

### 5. 更新版本清单 (versions.json)

```json
{
  "latest": {
    "version": "0.2.0",
    "date": "2024-01-15",
    "force_update": false,
    "minimum_version": "0.1.0",
    "changelog": [
      "✨ 新增 AI 配音功能",
      "🐛 修复视频导出崩溃问题",
      "⚡ 优化渲染性能"
    ]
  },
  "versions": {
    "0.2.0": {
      "date": "2024-01-15",
      "platforms": {
        "windows-x64": {
          "full": "https://cdn.example.com/releases/0.2.0/videomaker-0.2.0-x64.msi",
          "size": 52345678
        },
        "macos-arm64": {
          "full": "https://cdn.example.com/releases/0.2.0/videomaker-0.2.0-arm64.dmg",
          "size": 48923456
        }
      }
    },
    "0.1.0": {
      "date": "2024-01-01",
      "deprecated": false
    }
  }
}
```

### 6. 测试更新流程

```bash
# 6.1 安装旧版本（模拟老用户）
# 安装 0.1.0 版本

# 6.2 启动应用，触发更新检查
npm run tauri:dev

# 6.3 验证更新是否成功
# - 版本号变为 0.2.0
# - 新功能可用
# - 数据未丢失
```

### 7. 发布公告

```markdown
## VideoMaker v0.2.0 发布

### 更新内容

- ✨ 新增 AI 配音功能
- 🐛 修复视频导出崩溃问题
- ⚡ 优化渲染性能

### 下载

- [Windows 安装包](https://cdn.example.com/releases/0.2.0/videomaker-0.2.0-x64.msi)
- [macOS 安装包](https://cdn.example.com/releases/0.2.0/videomaker-0.2.0-arm64.dmg)

### 自动更新

已安装用户重启应用即可自动更新
```

## 自动化脚本

### 一键发布脚本

```bash
#!/bin/bash
# scripts/release.sh

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  exit 1
fi

echo "🚀 开始发布 v$VERSION"

# 1. 验证版本号格式
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ 版本号格式错误，应为 x.y.z"
  exit 1
fi

# 2. 更新版本号
node scripts/release-manager/bump-version.js $VERSION

# 3. 构建
echo "📦 构建应用..."
npm run build:app
npm run tauri:build

# 4. 生成补丁
echo "🔨 生成增量补丁..."
node scripts/release-manager/generate-all-patches.js $VERSION

# 5. 上传
echo "☁️ 上传到服务器..."
node scripts/release-manager/upload-release.js $VERSION

# 6. 打标签
git add .
git commit -m "release: v$VERSION"
git tag -a "v$VERSION" -m "Release version $VERSION"
git push origin v$VERSION

echo "✅ 发布完成!"
```

## 版本策略

### 语义化版本 (Semver)

```
主版本.次版本.修订号
  x.y.z

- x: 主版本 - 重大更新，可能不兼容
- y: 次版本 - 新功能，向下兼容
- z: 修订号 - Bug 修复，向下兼容
```

### 更新类型

| 版本变化            | 用户看到的提示 | 处理方式     |
| ------------------- | -------------- | ------------ |
| z+1 (0.1.0 → 0.1.1) | "发现小更新"   | 后台静默更新 |
| y+1 (0.1.0 → 0.2.0) | "发现新功能"   | 显示更新弹窗 |
| x+1 (0.1.0 → 1.0.0) | "重大更新"     | 强制更新     |

## 常见问题

### Q: 忘记更新版本号怎么办？

A: 版本号不匹配会导致更新循环，务必在构建前检查

### Q: 构建失败了怎么处理？

A:

1. 检查错误日志
2. 修复问题
3. 递增修订号重新发布 (如 0.2.0 → 0.2.1)

### Q: 如何撤销已发布的版本？

A:

1. 在 versions.json 中标记为 deprecated
2. 更新 latest 指向上一个稳定版本
3. 通知用户重新安装
