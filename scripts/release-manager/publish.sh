#!/bin/bash
# 一键发布脚本
# 用法: ./publish.sh <version>

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ 请指定版本号"
  echo "用法: ./publish.sh 0.2.0"
  exit 1
fi

# 验证版本号格式
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ 版本号格式错误，应为 x.y.z"
  exit 1
fi

echo "🚀 开始发布 VideoMaker v$VERSION"
echo "================================"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 1. 更新版本号
echo ""
echo "📋 Step 1: 更新版本号"
node "$SCRIPT_DIR/bump-version.js" "$VERSION"

# 2. 构建应用
echo ""
echo "📦 Step 2: 构建应用"
cd "$PROJECT_ROOT"
echo "  构建前端..."
npm run build:app

echo "  构建 Tauri..."
npm run tauri:build

# 3. 提取构建产物
echo ""
echo "📂 Step 3: 提取构建产物"
BUILD_DIR="$PROJECT_ROOT/src-tauri/target/release/bundle"
RELEASE_DIR="$PROJECT_ROOT/releases"
EXTRACT_DIR="$RELEASE_DIR/extracted/$VERSION"

mkdir -p "$EXTRACT_DIR"

# Windows: 解压 MSI/NSIS 安装包
if [ -f "$BUILD_DIR/msi/*.msi" ]; then
  echo "  提取 Windows 安装包..."
  # 使用 7z 提取 MSI 内容
  7z x "$BUILD_DIR/msi/"*.msi -o"$EXTRACT_DIR" -y || true
fi

# macOS: 挂载 DMG
if [ -f "$BUILD_DIR/dmg/*.dmg" ]; then
  echo "  提取 macOS 安装包..."
  hdiutil attach "$BUILD_DIR/dmg/"*.dmg -mountpoint /tmp/videomaker-dmg
  cp -R /tmp/videomaker-dmg/*.app/Contents/ "$EXTRACT_DIR/"
  hdiutil detach /tmp/videomaker-dmg
fi

# 4. 生成增量补丁
echo ""
echo "🔨 Step 4: 生成增量补丁"

# 获取上一个版本
PREV_VERSION=$(git tag --sort=-v:refname | grep "^v[0-9]" | head -1 | sed 's/^v//')

if [ -n "$PREV_VERSION" ] && [ "$PREV_VERSION" != "$VERSION" ]; then
  echo "  生成补丁: $PREV_VERSION → $VERSION"
  
  # Windows
  node "$SCRIPT_DIR/generate-patch.js" \
    --from "$PREV_VERSION" \
    --to "$VERSION" \
    --platform windows \
    --arch x64
  
  # macOS ARM
  node "$SCRIPT_DIR/generate-patch.js" \
    --from "$PREV_VERSION" \
    --to "$VERSION" \
    --platform macos \
    --arch arm64
  
  # 生成累计补丁（可选，用于跨版本更新）
  # 检查是否需要累计补丁（差距超过 3 个版本）
  PREV_PREV=$(git tag --sort=-v:refname | grep "^v[0-9]" | sed -n '2p' | sed 's/^v//')
  if [ -n "$PREV_PREV" ]; then
    node "$SCRIPT_DIR/generate-patch.js" \
      --from "$PREV_PREV" \
      --to "$VERSION" \
      --platform windows \
      --arch x64 \
      --cumulative
  fi
else
  echo "  这是第一个版本，跳过补丁生成"
fi

# 5. 更新版本索引
echo ""
echo "📝 Step 5: 更新版本索引"
node "$SCRIPT_DIR/update-versions-index.js" "$VERSION"

# 6. 上传到 CDN (可选)
echo ""
echo "☁️ Step 6: 上传到 CDN"
read -p "是否上传到 CDN? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # 配置你的 CDN
  # aws s3 sync "$RELEASE_DIR/patches/$VERSION" s3://your-bucket/updates/$VERSION/
  # aws s3 sync "$BUILD_DIR" s3://your-bucket/releases/$VERSION/
  # aws s3 cp "$RELEASE_DIR/versions.json" s3://your-bucket/updates/versions.json
  echo "  上传到 S3..."
  echo "  (请配置你的 CDN 命令)"
fi

# 7. 创建 Git 标签
echo ""
echo "🏷️ Step 7: 创建 Git 标签"
cd "$PROJECT_ROOT"
git add .
git commit -m "release: v$VERSION" || true
git tag -a "v$VERSION" -m "Release version $VERSION"

echo ""
echo "✅ 发布完成!"
echo ""
echo "📋 后续操作:"
echo "  1. 推送标签: git push origin v$VERSION"
echo "  2. 测试更新流程"
echo "  3. 发布 Release Notes"
echo ""
echo "📦 发布文件:"
echo "  - 完整安装包: $BUILD_DIR"
echo "  - 增量补丁: $RELEASE_DIR/patches/$VERSION"
echo "  - 版本索引: $RELEASE_DIR/versions.json"
