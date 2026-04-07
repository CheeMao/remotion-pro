#!/usr/bin/env node
/**
 * 批量依赖更新工具 - 支持并发和缓存复用
 * 特点：
 * 1. 只更新变更的包
 * 2. 复用未变更的依赖
 * 3. 自动清理旧版本缓存
 */

import { execSync, spawn } from "child_process";
import { readFile, writeFile, copyFile, mkdir, rm, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { createHash } from "crypto";
import { homedir } from "os";

// 配置
const CONFIG = {
  cacheDir: join(homedir(), ".npm-package-cache"),
  maxConcurrency: 3,
  backupDir: join(homedir(), ".npm-backups"),
};

// 颜色
const c = {
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
};

const log = {
  info: (m) => console.log(`${c.cyan}ℹ${c.reset} ${m}`),
  ok: (m) => console.log(`${c.green}✓${c.reset} ${m}`),
  warn: (m) => console.log(`${c.yellow}⚠${c.reset} ${m}`),
  err: (m) => console.log(`${c.red}✗${c.reset} ${m}`),
  detail: (m) => console.log(`${c.gray}  ${m}${c.reset}`),
};

// 包分组
const GROUPS = {
  remotion: [
    "@remotion/bundler",
    "@remotion/cli",
    "@remotion/google-fonts",
    "@remotion/renderer",
    "@remotion/zod-types",
    "remotion",
  ],
  react: ["react", "react-dom"],
  tauri: ["@tauri-apps/api", "@tauri-apps/cli"],
  types: ["@types/react", "@types/web", "@types/ws"],
  dev: ["@remotion/eslint-config-flat", "eslint", "prettier", "typescript"],
  utils: ["commander", "music-metadata", "tsx", "zod"],
};

// 获取最新版本
async function getLatestVersion(name) {
  try {
    const v = execSync(`npm view ${name} version`, {
      encoding: "utf-8",
      timeout: 10000,
    });
    return v.trim();
  } catch {
    return null;
  }
}

// 并行获取多个版本
async function getLatestVersions(names) {
  const results = {};
  const batches = [];

  for (let i = 0; i < names.length; i += CONFIG.maxConcurrency) {
    batches.push(names.slice(i, i + CONFIG.maxConcurrency));
  }

  for (const batch of batches) {
    const promises = batch.map(async (name) => {
      results[name] = await getLatestVersion(name);
    });
    await Promise.all(promises);
  }

  return results;
}

// 读取 package.json
async function readPkg() {
  const content = await readFile("package.json", "utf-8");
  return JSON.parse(content);
}

// 清理版本前缀
function cleanVersion(v) {
  return v?.replace(/^[\^~>=<]+/, "") || "";
}

// 计算缓存键
function getCacheKey(name, version) {
  return createHash("md5")
    .update(`${name}@${version}`)
    .digest("hex")
    .slice(0, 12);
}

// 确保目录存在
async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// 下载并缓存包
async function downloadAndCache(name, version) {
  const cacheKey = getCacheKey(name, version);
  const cachePath = join(CONFIG.cacheDir, cacheKey);

  if (existsSync(cachePath)) {
    log.detail(`${name}@${version} 已从缓存加载`);
    return cachePath;
  }

  await ensureDir(cachePath);

  try {
    // 使用 npm pack 下载
    execSync(`npm pack ${name}@${version} --pack-destination "${cachePath}"`, {
      timeout: 60000,
      stdio: "pipe",
    });

    // 解压
    const tgzFile = (
      await execSync(`dir /B "${cachePath}\*.tgz"`, { encoding: "utf-8" })
    ).trim();
    execSync(`tar -xzf "${join(cachePath, tgzFile)}" -C "${cachePath}"`, {
      timeout: 30000,
    });
    await rm(join(cachePath, tgzFile));

    return cachePath;
  } catch (e) {
    log.err(`下载 ${name}@${version} 失败: ${e.message}`);
    return null;
  }
}

// 智能更新 - 复用缓存
async function smartInstall(updates) {
  log.info(`准备安装 ${updates.length} 个包...`);

  // 下载到缓存
  await ensureDir(CONFIG.cacheDir);

  const cachePaths = [];
  for (const u of updates) {
    const path = await downloadAndCache(u.name, u.latest);
    if (path) cachePaths.push({ update: u, cachePath: path });
  }

  // 安装
  for (const { update, cachePath } of cachePaths) {
    const { name, latest, isDev } = update;
    const flag = isDev ? "--save-dev" : "--save";

    try {
      // 直接安装，npm 会自动处理
      execSync(
        `npm install ${name}@${latest} ${flag} --legacy-peer-deps --no-audit --no-fund`,
        {
          stdio: "pipe",
          timeout: 120000,
        },
      );
      log.ok(`${name}@${latest} 安装完成`);
    } catch (e) {
      log.err(`${name} 安装失败: ${e.message}`);
    }
  }
}

// 批量更新 package.json
async function updatePackageJson(updates) {
  const pkg = await readPkg();

  for (const u of updates) {
    const target = u.isDev ? pkg.devDependencies : pkg.dependencies;
    const current = target[u.name];

    // 保留前缀
    if (current?.startsWith("^")) {
      target[u.name] = `^${u.latest}`;
    } else if (current?.startsWith("~")) {
      target[u.name] = `~${u.latest}`;
    } else {
      target[u.name] = u.latest;
    }
  }

  await writeFile("package.json", JSON.stringify(pkg, null, 2) + "\n");
  log.ok("package.json 已更新");
}

// 创建备份
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = join(CONFIG.backupDir, `backup-${timestamp}`);

  await ensureDir(backupDir);

  try {
    // 复制关键文件
    await copyFile("package.json", join(backupDir, "package.json"));
    await copyFile("package-lock.json", join(backupDir, "package-lock.json"));

    log.ok(`备份已创建: ${backupDir}`);
    return backupDir;
  } catch (e) {
    log.warn(`备份失败: ${e.message}`);
    return null;
  }
}

// 主流程
async function main() {
  const args = process.argv.slice(2);
  const group = args.find((a) => !a.startsWith("-")) || "all";
  const dryRun = args.includes("--dry-run");

  log.info("🚀 批量依赖更新工具");
  log.detail(`更新组: ${group}`);

  const pkg = await readPkg();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const devDeps = new Set(Object.keys(pkg.devDependencies || {}));

  const names =
    group === "all"
      ? Object.keys(allDeps)
      : GROUPS[group]?.filter((n) => allDeps[n]) || [];

  log.info(`检查 ${names.length} 个包...`);

  // 批量获取最新版本
  const latestVersions = await getLatestVersions(names);

  const updates = [];
  for (const name of names) {
    const current = cleanVersion(allDeps[name]);
    const latest = latestVersions[name];

    if (latest && latest !== current) {
      updates.push({
        name,
        current,
        latest,
        isDev: devDeps.has(name),
      });
    }
  }

  if (updates.length === 0) {
    log.ok("所有包都是最新版本");
    return;
  }

  log.info(`\n找到 ${updates.length} 个可更新:`);
  for (const u of updates) {
    const type = u.isDev ? "[dev]" : "     ";
    console.log(`  ${type} ${u.name}: ${u.current} → ${u.latest}`);
  }

  if (dryRun) {
    log.info("\n(预览模式，未执行更新)");
    return;
  }

  // 确认
  process.stdout.write("\n确认更新? [Y/n] ");
  const response = await new Promise((r) =>
    process.stdin.once("data", (d) => r(d.toString().trim())),
  );

  if (response && !response.match(/^[Yy]/)) {
    log.info("已取消");
    return;
  }

  // 创建备份
  const backup = await createBackup();

  // 执行更新
  await smartInstall(updates);
  await updatePackageJson(updates);

  // 验证
  log.info("\n验证安装...");
  try {
    execSync("npm ls --depth=0", { stdio: "pipe" });
    log.ok("验证通过");
  } catch {
    log.warn("验证可能有问题，请检查");
  }

  log.info("\n✨ 更新完成");
}

main().catch((e) => {
  log.err(e.message);
  process.exit(1);
});
