#!/usr/bin/env pwsh
# 依赖增量更新脚本
# 支持选择性更新、缓存复用、版本锁定

param(
    [Parameter()]
    [ValidateSet("all", "remotion", "react", "dev", "types", "utils")]
    [string]$Group = "all",

    [Parameter()]
    [switch]$DryRun,

    [Parameter()]
    [switch]$Force,

    [Parameter()]
    [string]$CacheDir = "$env:LOCALAPPDATA\npm-cache-update"
)

# 颜色输出
function Write-Color($Text, $Color) {
    Write-Host $Text -ForegroundColor $Color
}

# 读取 package.json
$packageJsonPath = Join-Path $PSScriptRoot ".." "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

# 定义包分组
$packageGroups = @{
    remotion = @(
        "@remotion/bundler",
        "@remotion/cli",
        "@remotion/google-fonts",
        "@remotion/renderer",
        "@remotion/zod-types",
        "remotion"
    )
    react = @(
        "react",
        "react-dom"
    )
    types = @(
        "@types/react",
        "@types/web",
        "@types/ws"
    )
    dev = @(
        "@remotion/eslint-config-flat",
        "eslint",
        "prettier",
        "typescript"
    )
    utils = @(
        "commander",
        "music-metadata",
        "tsx",
        "zod"
    )
}

# 获取可更新的包
function Get-UpgradablePackages($group) {
    $packages = @()
    $toCheck = if ($group -eq "all") {
        $packageGroups.Values | ForEach-Object { $_ }
    } else {
        $packageGroups[$group]
    }

    foreach ($pkg in $toCheck | Select-Object -Unique) {
        $current = $packageJson.dependencies.$pkg
        if (-not $current) {
            $current = $packageJson.devDependencies.$pkg
        }

        if ($current) {
            try {
                $latest = npm view $pkg version 2>$null
                $currentClean = $current -replace '^[\^~>=<]+', ''
                if ($latest -and ($latest -ne $currentClean)) {
                    $packages += @{
                        name = $pkg
                        current = $current
                        latest = $latest
                        isDev = [bool]($packageJson.devDependencies.$pkg)
                    }
                }
            } catch {
                Write-Color "⚠️  无法检查 $pkg: $_" "Yellow"
            }
        }
    }

    return $packages
}

# 创建缓存备份
function Backup-NodeModules {
    $backupDir = Join-Path $CacheDir "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    if (-not (Test-Path $CacheDir)) {
        New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null
    }

    Write-Color "📦 正在创建依赖缓存备份..." "Cyan"
    Copy-Item -Path "node_modules" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Color "✅ 备份已创建: $backupDir" "Green"
    return $backupDir
}

# 智能更新
function Update-PackagesSmart($packages) {
    $total = $packages.Count
    $current = 0

    foreach ($pkg in $packages) {
        $current++
        $name = $pkg.name
        $latest = $pkg.latest
        $isDev = $pkg.isDev

        Write-Color "[$current/$total] 更新 $name@$latest" "Cyan"

        try {
            # 使用 npm update 进行增量更新
            $flag = if ($isDev) { "--save-dev" } else { "--save" }
            npm install "$name@$latest" $flag --legacy-peer-deps 2>&1 | Out-Null

            if ($LASTEXITCODE -eq 0) {
                Write-Color "  ✅ 更新成功" "Green"
            } else {
                Write-Color "  ❌ 更新失败" "Red"
            }
        } catch {
            Write-Color "  ❌ 错误: $_" "Red"
        }
    }
}

# 清理旧缓存
function Clear-OldCache($keepCount = 3) {
    if (Test-Path $CacheDir) {
        Get-ChildItem $CacheDir -Directory |
            Sort-Object CreationTime -Descending |
            Select-Object -Skip $keepCount |
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# 主逻辑
Write-Color "🚀 依赖增量更新工具" "Cyan"
Write-Color "====================" "Cyan"

if ($DryRun) {
    Write-Color "🔍 预览模式 - 不会实际执行更新" "Yellow"
}

# 检查可更新的包
Write-Color "`n📋 检查可更新的包 ($Group 分组)..." "Cyan"
$upgradable = Get-UpgradablePackages $Group

if ($upgradable.Count -eq 0) {
    Write-Color "✅ 所有包都是最新版本" "Green"
    exit 0
}

Write-Color "`n找到 $($upgradable.Count) 个可更新的包:" "Cyan"
foreach ($pkg in $upgradable) {
    $type = if ($pkg.isDev) { "[dev]" } else { "     " }
    Write-Color "  $type $($pkg.name): $($pkg.current) → $($pkg.latest)" "White"
}

if ($DryRun) {
    exit 0
}

# 确认
Write-Host "`n"
$confirm = Read-Host "确认更新? [Y/n]"
if ($confirm -and $confirm -notmatch '^[Yy]') {
    Write-Color "已取消" "Yellow"
    exit 0
}

# 创建备份
if (-not $Force) {
    $backup = Backup-NodeModules
}

# 执行更新
Write-Color "`n🔄 开始更新..." "Cyan"
Update-PackagesSmart $upgradable

# 更新 package.json 中的版本号
Write-Color "`n📝 更新 package.json..." "Cyan"
foreach ($pkg in $upgradable) {
    $name = $pkg.name
    $latest = $pkg.latest

    if ($pkg.isDev) {
        if ($packageJson.devDependencies.$name -match '^[\^~]') {
            $packageJson.devDependencies.$name = "^$latest"
        } else {
            $packageJson.devDependencies.$name = $latest
        }
    } else {
        if ($packageJson.dependencies.$name -match '^[\^~]') {
            $packageJson.dependencies.$name = "^$latest"
        } else {
            $packageJson.dependencies.$name = $latest
        }
    }
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
Write-Color "✅ package.json 已更新" "Green"

# 验证安装
Write-Color "`n🔧 验证安装..." "Cyan"
npm ls --depth=0 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Color "✅ 依赖验证通过" "Green"

    # 清理旧备份
    Clear-OldCache
    Write-Color "🧹 旧缓存已清理" "Green"
} else {
    Write-Color "⚠️ 依赖验证失败，考虑恢复备份" "Yellow"
    Write-Color "备份位置: $backup" "Yellow"
}

Write-Color "`n✨ 更新完成!" "Green"
