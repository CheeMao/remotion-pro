#!/usr/bin/env node
/**
 * 依赖更新检查工具
 * 支持选择性更新和智能缓存
 */

import { readFile, writeFile } from "fs/promises";
import { execSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CACHE_DIR = join(homedir(), ".npm-update-cache");

// 包分组定义
const PACKAGE_GROUPS = {
  remotion: [
    "@remotion/bundler",
    "@remotion/cli",
    "@remotion/google-fonts",
    "@remotion/renderer",
    "@remotion/zod-types",
    "remotion",
  ],
  react: ["react", "react-dom"],
  types: ["@types/react", "@types/web", "@types/ws"],
  dev: ["@remotion/eslint-config-flat", "eslint", "prettier", "typescript"],
  utils: ["commander", "music-metadata", "tsx", "zod"],
  tauri: ["@tauri-apps/api", "@tauri-apps/cli"],
};

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
};

// 获取包信息
async function getPackageInfo(name) {
  try {
    const result = execSync(`npm view ${name} version --json`, {
      encoding: "utf-8",
      timeout: 30000,
    });
    return result.trim();
  } catch {
    return null;
  }
}

// 读取 package.json
async function readPackageJson() {
  const content = await readFile("package.json", "utf-8");
  return JSON.parse(content);
}

// 解析版本号
function parseVersion(version) {
  return version?.replace(/^[\^~>=<]+/, "") || "";
}

// 检查更新
async function checkUpdates(group = "all") {
  const pkg = await readPackageJson();
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const devDeps = new Set(Object.keys(pkg.devDependencies || {}));

  const packagesToCheck =
    group === "all"
      ? Object.keys(deps)
      : PACKAGE_GROUPS[group]?.filter((p) => deps[p]) || [];

  const updates = [];

  log.info(`检查 ${packagesToCheck.length} 个包的更新...`);

  for (const name of packagesToCheck) {
    const current = parseVersion(deps[name]);
    const latest = await getPackageInfo(name);

    if (latest && latest !== current) {
      updates.push({
        name,
        current,
        latest,
        isDev: devDeps.has(name),
      });
      log.detail(`${name}: ${current} → ${latest}`);
    }
  }

  return updates;
}

// 智能更新 - 仅下载变更的部分
async function smartUpdate(packages) {
  if (packages.length === 0) {
    log.success("所有包都是最新版本");
    return;
  }

  log.info(`准备更新 ${packages.length} 个包...`);

  // 使用 npm ci 风格的方式，但只更新指定包
  for (const pkg of packages) {
    try {
      const flag = pkg.isDev ? "--save-dev" : "--save";
      execSync(
        `npm install ${pkg.name}@${pkg.latest} ${flag} --legacy-peer-deps`,
        {
          stdio: "inherit",
          timeout: 120000,
        },
      );
      log.success(`${pkg.name}@${pkg.latest} 更新成功`);
    } catch (error) {
      log.error(`${pkg.name} 更新失败: ${error.message}`);
    }
  }
}

// 备份 node_modules
function backupNodeModules() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(CACHE_DIR, `backup-${timestamp}`);

  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }

  try {
    execSync(`xcopy node_modules "${backupDir}" /E /I /H /Y`, {
      timeout: 300000,
    });
    log.success(`依赖已备份到: ${backupDir}`);
    return backupDir;
  } catch {
    log.warn("备份失败，继续更新");
    return null;
  }
}

// 清理旧备份
function cleanupOldBackups(keep = 3) {
  try {
    const backups = execSync(`dir /B /AD "${CACHE_DIR}\backup-*"`, {
      encoding: "utf-8",
    })
      .split("\n")
      .filter(Boolean)
      .map((name) => ({
        name: name.trim(),
        path: join(CACHE_DIR, name.trim()),
        time: statSync(join(CACHE_DIR, name.trim())).mtime,
      }))
      .sort((a, b) => b.time - a.time);

    for (const backup of backups.slice(keep)) {
      try {
        execSync(`rmdir /S /Q "${backup.path}"`);
      } catch {}
    }
  } catch {}
}

// 验证安装
function verifyInstall() {
  try {
    execSync("npm ls --depth=0", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const group = args.find((a) => !a.startsWith("-")) || "all";
  const dryRun = args.includes("--dry-run");
  const skipBackup = args.includes("--no-backup");

  log.info("🔍 依赖更新检查工具");
  log.detail(`检查组: ${group}`);

  const updates = await checkUpdates(group);

  if (updates.length === 0) {
    log.success("无需更新");
    return;
  }

  log.info(`\n找到 ${updates.length} 个可更新:`);
  for (const u of updates) {
    const type = u.isDev ? "[dev]" : "     ";
    console.log(`  ${type} ${u.name}: ${u.current} → ${u.latest}`);
  }

  if (dryRun) {
    log.info("\n(预览模式，未实际更新)");
    return;
  }

  // 确认
  process.stdout.write("\n确认更新? [Y/n] ");
  const response = await new Promise((resolve) => {
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });

  if (response && !response.match(/^[Yy]/)) {
    log.info("已取消");
    return;
  }

  // 备份
  let backup = null;
  if (!skipBackup) {
    backup = backupNodeModules();
  }

  // 执行更新
  await smartUpdate(updates);

  // 验证
  log.info("\n验证安装...");
  if (verifyInstall()) {
    log.success("安装验证通过");
    cleanupOldBackups();
  } else {
    log.error("安装验证失败");
    if (backup) {
      log.warn(`可恢复备份: ${backup}`);
    }
  }
}

main().catch(console.error);
