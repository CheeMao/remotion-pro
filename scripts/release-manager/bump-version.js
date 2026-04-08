#!/usr/bin/env node
/**
 * 统一更新项目版本号
 * 用法: node bump-version.js 0.2.0
 */

const fs = require("fs");
const path = require("path");

const newVersion = process.argv[2];

if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error("用法: node bump-version.js x.y.z");
  process.exit(1);
}

console.log(`📝 更新版本号到 ${newVersion}`);

// 1. 更新根目录 package.json
const rootPkgPath = path.join(__dirname, "..", "..", "package.json");
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
rootPkg.version = newVersion;
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n");
console.log("✅ package.json (root)");

// 2. 更新 app/package.json
const appPkgPath = path.join(__dirname, "..", "..", "app", "package.json");
const appPkg = JSON.parse(fs.readFileSync(appPkgPath, "utf8"));
appPkg.version = newVersion;
fs.writeFileSync(appPkgPath, JSON.stringify(appPkg, null, 2) + "\n");
console.log("✅ package.json (app)");

// 3. 更新 Cargo.toml
const cargoPath = path.join(__dirname, "..", "..", "src-tauri", "Cargo.toml");
let cargoContent = fs.readFileSync(cargoPath, "utf8");
cargoContent = cargoContent.replace(
  /version = "[\d.]+"/,
  `version = "${newVersion}"`,
);
fs.writeFileSync(cargoPath, cargoContent);
console.log("✅ Cargo.toml");

// 4. 更新 tauri.conf.json
const tauriConfPath = path.join(
  __dirname,
  "..",
  "..",
  "src-tauri",
  "tauri.conf.json",
);
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
tauriConf.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log("✅ tauri.conf.json");

console.log(`\n✨ 版本号已更新为 ${newVersion}`);
console.log("记得提交更改并打标签:");
console.log(`  git add .`);
console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
console.log(`  git tag -a v${newVersion} -m "Version ${newVersion}"`);
