# 依赖更新工具说明

本项目提供多种依赖更新方式，支持**增量更新**（只更新变更的包，复用未变更的依赖）。

## 三种更新方式对比

| 方式                 | 命令                                 | 特点                     | 适用场景     |
| -------------------- | ------------------------------------ | ------------------------ | ------------ |
| **npm update**       | `npm update`                         | npm 原生，自动处理依赖树 | 常规更新     |
| **update-check.mjs** | `node scripts/update-check.mjs`      | 分组更新，自动备份       | 精细控制     |
| **batch-update.mjs** | `node scripts/batch-update.mjs`      | 批量并发，缓存复用       | 大量更新     |
| **update-deps.ps1**  | `powershell scripts/update-deps.ps1` | PowerShell 完整功能      | Windows 用户 |

## 快速开始

### 1. 检查可更新的包（预览模式）

```bash
# 查看所有可更新的包
node scripts/update-check.mjs --dry-run

# 只查看 remotion 相关包
node scripts/update-check.mjs remotion --dry-run
```

### 2. 执行更新

```bash
# 更新所有包
node scripts/update-check.mjs

# 只更新 remotion 相关
node scripts/update-check.mjs remotion

# 只更新 react
node scripts/update-check.mjs react

# 只更新类型定义
node scripts/update-check.mjs types
```

### 3. 使用 PowerShell 版本（Windows 推荐）

```powershell
# 检查可更新
powershell scripts/update-deps.ps1 -Group remotion -DryRun

# 实际更新
powershell scripts/update-deps.ps1 -Group remotion

# 跳过备份（更快）
powershell scripts/update-deps.ps1 -Group remotion -Force
```

## 增量更新原理

### 与传统 `npm install` 的区别

| 传统方式              | 增量更新              |
| --------------------- | --------------------- |
| 删除整个 node_modules | 保留现有依赖          |
| 重新下载所有包        | 只下载变更的包        |
| 时间长（~5-10分钟）   | 时间短（~30秒-2分钟） |
| 流量消耗大            | 流量消耗小            |

### 技术实现

```
检查 package.json 中的版本
    ↓
对比 registry 最新版本
    ↓
只安装版本变化的包
    ↓
自动更新 package.json 和 package-lock.json
    ↓
验证安装完整性
```

## 分组说明

```
remotion:   @remotion/* 和 remotion 核心包
react:      react, react-dom
tauri:      @tauri-apps/*
types:      @types/* 类型定义
dev:        eslint, prettier, typescript
utils:      commander, music-metadata, tsx, zod
all:        以上所有
```

## 缓存机制

### 自动缓存

- 缓存位置：`~/.npm-package-cache/`
- 每次更新前自动备份到：`~/.npm-backups/`
- 保留最近 3 个备份，自动清理旧备份

### 手动清理缓存

```bash
# 清理 npm 缓存
npm cache clean --force

# 清理本项目缓存
rm -rf ~/.npm-package-cache
rm -rf ~/.npm-backups
```

## 故障恢复

如果更新后出现问题：

```bash
# 方法1: 使用备份恢复
# 找到最近的备份目录
cd ~/.npm-backups/backup-xxx
cp package.json package-lock.json /your/project/
cd /your/project
npm install

# 方法2: 重新安装
rm -rf node_modules package-lock.json
npm install
```

## 最佳实践

1. **更新前检查**

   ```bash
   node scripts/update-check.mjs --dry-run
   ```

2. **分组更新**
   - 先更新 remotion 核心包
   - 再更新其他依赖
   - 最后更新类型定义

3. **验证更新**

   ```bash
   npm run lint
   npm run build
   ```

4. **定期清理**
   ```bash
   npm cache verify
   ```

## 常见问题

**Q: 为什么比 `npm install` 快？**  
A: 增量更新只下载版本变化的包，未变化的包完全保留。

**Q: 更新后 package-lock.json 冲突？**  
A: 建议更新前提交当前代码，更新后再提交一次。

**Q: 可以自动更新吗？**  
A: 可以配合 CI/CD 使用，但建议先在本地验证：

```bash
node scripts/update-check.mjs --dry-run && node scripts/update-check.mjs
```
