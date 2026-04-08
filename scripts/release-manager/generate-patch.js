#!/usr/bin/env node
/**
 * 生成增量更新补丁
 * 用法: node generate-patch.js --from 0.1.0 --to 0.2.0 --platform windows
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");
const zlib = require("zlib");
const archiver = require("archiver");

const args = process.argv.slice(2);
const fromVersion = getArg(args, "--from");
const toVersion = getArg(args, "--to");
const platform = getArg(args, "--platform") || "windows";
const arch = getArg(args, "--arch") || "x64";
const cumulative = args.includes("--cumulative");

function getArg(args, key) {
  const index = args.indexOf(key);
  return index !== -1 ? args[index + 1] : null;
}

if (!fromVersion || !toVersion) {
  console.error(
    "用法: node generate-patch.js --from 0.1.0 --to 0.2.0 [--platform windows] [--arch x64] [--cumulative]",
  );
  process.exit(1);
}

console.log(`🔨 生成补丁: ${fromVersion} → ${toVersion} (${platform}-${arch})`);
if (cumulative) console.log("📦 累计补丁模式");

// 目录配置
const RELEASES_DIR = path.join(__dirname, "..", "..", "releases");
const PATCHES_DIR = path.join(RELEASES_DIR, "patches", toVersion);
const OLD_DIR = path.join(RELEASES_DIR, "extracted", fromVersion);
const NEW_DIR = path.join(RELEASES_DIR, "extracted", toVersion);

// 确保目录存在
fs.mkdirSync(PATCHES_DIR, { recursive: true });

// 计算文件 hash
function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

// 扫描目录文件
function scanDir(dir, basePath = "") {
  const files = [];

  function walk(currentPath, relativePath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else {
        const stat = fs.statSync(fullPath);
        files.push({
          path: relPath,
          fullPath,
          hash: hashFile(fullPath),
          size: stat.size,
        });
      }
    }
  }

  walk(dir, basePath);
  return files;
}

// 对比文件差异
function compareFiles(oldFiles, newFiles) {
  const oldMap = new Map(oldFiles.map((f) => [f.path, f]));
  const newMap = new Map(newFiles.map((f) => [f.path, f]));

  const changes = {
    added: [],
    updated: [],
    deleted: [],
  };

  // 查找新增和修改
  for (const [path, newFile] of newMap) {
    const oldFile = oldMap.get(path);
    if (!oldFile) {
      changes.added.push(newFile);
    } else if (oldFile.hash !== newFile.hash) {
      changes.updated.push(newFile);
    }
  }

  // 查找删除
  for (const [path, oldFile] of oldMap) {
    if (!newMap.has(path)) {
      changes.deleted.push(oldFile);
    }
  }

  return changes;
}

// 创建补丁包
async function createPatch(changes, patchName) {
  const patchPath = path.join(PATCHES_DIR, patchName);

  const output = fs.createWriteStream(patchPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      const size = fs.statSync(patchPath).size;
      console.log(`✅ 补丁已生成: ${patchName} (${formatSize(size)})`);
      resolve(size);
    });

    archive.on("error", reject);
    archive.pipe(output);

    // 添加 manifest
    const manifest = {
      version: toVersion,
      from_version: fromVersion,
      platform,
      arch,
      cumulative,
      generated_at: new Date().toISOString(),
      files: [],
    };

    // 添加新增和更新的文件
    for (const file of [...changes.added, ...changes.updated]) {
      archive.file(file.fullPath, { name: file.path });
      manifest.files.push({
        path: file.path,
        hash: file.hash,
        size: file.size,
        action: changes.added.includes(file) ? "add" : "update",
      });
    }

    // 记录删除的文件
    for (const file of changes.deleted) {
      manifest.files.push({
        path: file.path,
        action: "delete",
      });
    }

    // 将 manifest 添加到压缩包
    archive.append(JSON.stringify(manifest, null, 2), {
      name: "manifest.json",
    });

    archive.finalize();
  });
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// 主流程
async function main() {
  console.log("📂 扫描文件...");

  if (!fs.existsSync(OLD_DIR)) {
    console.error(`❌ 找不到旧版本目录: ${OLD_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(NEW_DIR)) {
    console.error(`❌ 找不到新版本目录: ${NEW_DIR}`);
    process.exit(1);
  }

  const oldFiles = scanDir(OLD_DIR);
  const newFiles = scanDir(NEW_DIR);

  console.log(`  旧版本: ${oldFiles.length} 个文件`);
  console.log(`  新版本: ${newFiles.length} 个文件`);

  console.log("🔍 对比差异...");
  const changes = compareFiles(oldFiles, newFiles);

  console.log(`  新增: ${changes.added.length} 个文件`);
  console.log(`  更新: ${changes.updated.length} 个文件`);
  console.log(`  删除: ${changes.deleted.length} 个文件`);

  if (
    changes.added.length === 0 &&
    changes.updated.length === 0 &&
    changes.deleted.length === 0
  ) {
    console.log("ℹ️ 没有检测到变化");
    process.exit(0);
  }

  console.log("📦 生成补丁包...");
  const patchName = cumulative
    ? `patch-${fromVersion}-to-${toVersion}.zip`
    : `patch-from-${fromVersion}.zip`;

  const size = await createPatch(changes, patchName);

  // 生成统计
  const oldTotalSize = oldFiles.reduce((sum, f) => sum + f.size, 0);
  const newTotalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
  const patchSize = size;
  const fullSize = newTotalSize;

  console.log("\n📊 更新统计:");
  console.log(`  完整包大小: ${formatSize(fullSize)}`);
  console.log(`  补丁包大小: ${formatSize(patchSize)}`);
  console.log(`  节省流量: ${((1 - patchSize / fullSize) * 100).toFixed(1)}%`);

  // 保存统计信息
  const statsPath = path.join(
    PATCHES_DIR,
    `stats-${fromVersion}-to-${toVersion}.json`,
  );
  fs.writeFileSync(
    statsPath,
    JSON.stringify(
      {
        from_version: fromVersion,
        to_version: toVersion,
        platform,
        arch,
        cumulative,
        files_changed:
          changes.added.length +
          changes.updated.length +
          changes.deleted.length,
        files_added: changes.added.length,
        files_updated: changes.updated.length,
        files_deleted: changes.deleted.length,
        old_size: oldTotalSize,
        new_size: newTotalSize,
        patch_size: patchSize,
        full_size: fullSize,
        savings_percent: ((1 - patchSize / fullSize) * 100).toFixed(1),
        generated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch(console.error);
