#!/usr/bin/env node
/**
 * 构建CLI可执行文件脚本
 * 将Remotion CLI打包成独立可执行文件，供Tauri调用
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "src-tauri", "binaries");
const cliEntry = path.join(__dirname, "..", "src", "cli", "index.ts");

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 构建配置
const targets = [
  { platform: "win32", arch: "x64", output: "cli-x64.exe" },
  { platform: "darwin", arch: "x64", output: "cli-mac-x64" },
  { platform: "darwin", arch: "arm64", output: "cli-mac-arm64" },
  { platform: "linux", arch: "x64", output: "cli-linux-x64" },
];

console.log("🔨 Building CLI executables...\n");

// 检测当前平台
const currentPlatform = process.platform;
const currentArch = process.arch;

// 只构建当前平台的版本
const target = targets.find(
  (t) => t.platform === currentPlatform && t.arch === currentArch,
);

if (!target) {
  console.error(`❌ Unsupported platform: ${currentPlatform}-${currentArch}`);
  console.log(
    "Supported platforms:",
    targets.map((t) => `${t.platform}-${t.arch}`).join(", "),
  );
  process.exit(1);
}

const outputPath = path.join(outputDir, target.output);

console.log(`Building for ${currentPlatform}-${currentArch}...`);
console.log(`Output: ${outputPath}\n`);

try {
  // 使用 pkg 打包
  const cmd =
    `npx pkg ${cliEntry} ` +
    `--targets node18-${currentPlatform}-${currentArch} ` +
    `--output ${outputPath} ` +
    `--config ${path.join(__dirname, "..", "pkg.config.json")}`;

  console.log(`Running: ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd: path.join(__dirname, "..") });

  console.log(`\n✅ Successfully built: ${outputPath}`);

  // 同时复制到Tauri资源目录
  const tauriBinDir = path.join(__dirname, "..", "src-tauri", "binaries");
  if (!fs.existsSync(tauriBinDir)) {
    fs.mkdirSync(tauriBinDir, { recursive: true });
  }

  // 创建平台特定的文件名（Tauri约定）
  const tauriBinaryName = getTauriBinaryName(currentPlatform, currentArch);
  const tauriBinaryPath = path.join(tauriBinDir, tauriBinaryName);

  fs.copyFileSync(outputPath, tauriBinaryPath);
  console.log(`✅ Copied to Tauri binaries: ${tauriBinaryPath}`);
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

function getTauriBinaryName(platform, arch) {
  // Tauri约定的外部二进制文件名格式
  const extension = platform === "win32" ? ".exe" : "";
  const platformName =
    platform === "win32"
      ? "windows"
      : platform === "darwin"
        ? "macos"
        : "linux";
  const archName = arch === "x64" ? "x86_64" : "aarch64";

  return `cli-${platformName}-${archName}${extension}`;
}
