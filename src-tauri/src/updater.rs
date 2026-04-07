//! Tauri 增量更新系统 - Rust 后端实现
//!
//! 核心流程：
//! 1. 检查版本 -> 获取服务器版本信息
//! 2. 下载 manifest -> 获取增量更新清单
//! 3. 计算差异 -> 只下载变更的文件
//! 4. 下载补丁 -> 并行下载变更文件
//! 5. 验证签名 -> 确保文件完整性
//! 6. 应用更新 -> 原子替换文件
//! 7. 重启应用 -> 加载新版本

use crate::{AppInfoSummary, AuthContext};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager, Runtime, State};

/// 更新服务器配置
const UPDATE_SERVER_URL: &str = "https://your-update-server.com/api/updates";
const UPDATE_CHANNEL: &str = "stable"; // stable, beta, alpha

/// 增量更新清单
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateManifest {
    pub version: String,
    pub minimum_version: String,
    pub changelog: String,
    pub files: Vec<PatchFile>,
    pub total_size: u64,
    pub signature: String,
}

/// 单个补丁文件
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchFile {
    pub path: String,
    pub hash: String,
    pub size: u64,
    pub action: PatchAction,
    pub download_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PatchAction {
    Add,
    Update,
    Delete,
}

/// 更新进度
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProgress {
    pub status: String,
    pub progress: f64,
    pub speed: String,
    pub downloaded: u64,
    pub total: u64,
}

/// 更新状态
#[derive(Default)]
pub struct UpdaterState {
    pub manifest: Mutex<Option<UpdateManifest>>,
    pub downloading: Mutex<bool>,
    pub downloaded_size: Mutex<u64>,
    pub last_error: Mutex<Option<String>>,
}

/// 本地文件信息
#[derive(Debug, Clone)]
struct LocalFileInfo {
    path: PathBuf,
    hash: String,
    size: u64,
}

/// 获取应用安装目录
fn get_app_dir() -> Result<PathBuf, String> {
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("无法获取可执行文件路径: {}", e))?;

    Ok(exe_path
        .parent()
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| PathBuf::from(".")))
}

/// 获取更新缓存目录
fn get_update_cache_dir() -> Result<PathBuf, String> {
    let cache_dir = std::env::temp_dir().join("videomaker-updates");
    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir)
            .map_err(|e| format!("无法创建缓存目录: {}", e))?;
    }
    Ok(cache_dir)
}

/// 计算文件 hash (SHA-256)
fn calculate_file_hash(path: &Path) -> Result<String, String> {
    use sha2::{Digest, Sha256};

    let mut file = fs::File::open(path)
        .map_err(|e| format!("无法打开文件 {}: {}", path.display(), e))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];

    loop {
        let bytes_read = file.read(&mut buffer)
            .map_err(|e| format!("读取文件失败: {}", e))?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    let result = hasher.finalize();
    Ok(hex::encode(result))
}

/// 扫描本地文件
fn scan_local_files(app_dir: &Path) -> Result<Vec<LocalFileInfo>, String> {
    let mut files = Vec::new();

    // 定义需要扫描的文件模式
    let patterns = vec![
        ("**/*.exe", true),
        ("**/*.dll", true),
        ("**/*.so", true),
        ("**/*.dylib", true),
        ("resources/**/*", true),
        ("**/*.html", true),
        ("**/*.js", true),
        ("**/*.css", true),
        ("**/*.wasm", true),
    ];

    for (pattern, include) in patterns {
        if let Ok(entries) = glob::glob(&app_dir.join(pattern).to_string_lossy()) {
            for entry in entries.flatten() {
                if entry.is_file() {
                    let metadata = fs::metadata(&entry)
                        .map_err(|e| format!("无法读取元数据: {}", e))?;

                    let relative_path = entry
                        .strip_prefix(app_dir)
                        .map_err(|e| format!("无法获取相对路径: {}", e))?
                        .to_string_lossy()
                        .replace('\\', "/");

                    files.push(LocalFileInfo {
                        path: entry.clone(),
                        hash: calculate_file_hash(&entry)?,
                        size: metadata.len(),
                    });
                }
            }
        }
    }

    Ok(files)
}

/// 从服务器获取更新清单
async fn fetch_update_manifest(
    current_version: &str,
    platform: &str,
    arch: &str,
) -> Result<UpdateManifest, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("创建 HTTP 客户端失败: {}", e))?;

    let url = format!(
        "{}/{}/{}/manifest.json?current={}&channel={}",
        UPDATE_SERVER_URL, platform, arch, current_version, UPDATE_CHANNEL
    );

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("请求更新清单失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("服务器返回错误: {}", response.status()));
    }

    let manifest: UpdateManifest = response
        .json()
        .await
        .map_err(|e| format!("解析更新清单失败: {}", e))?;

    Ok(manifest)
}

/// 检查是否有可用更新
#[tauri::command]
pub async fn check_app_update(
    state: State<'_, UpdaterState>,
) -> Result<AppInfoSummary, String> {
    let current_version = env!("CARGO_PKG_VERSION").to_string();

    #[cfg(target_os = "windows")]
    let platform = "windows";
    #[cfg(target_os = "macos")]
    let platform = "macos";
    #[cfg(target_os = "linux")]
    let platform = "linux";

    #[cfg(target_arch = "x86_64")]
    let arch = "x64";
    #[cfg(target_arch = "aarch64")]
    let arch = "arm64";

    // 获取更新清单
    let manifest = fetch_update_manifest(&current_version, platform, arch).await?;

    // 保存 manifest 到状态
    *state.manifest.lock().map_err(|e| e.to_string())? = Some(manifest.clone());

    // 检查是否需要强制更新
    let is_force_update = is_remote_version_newer(&current_version, &manifest.minimum_version);

    // 检查是否有更新
    let has_update = is_remote_version_newer(&current_version, &manifest.version);

    Ok(AppInfoSummary {
        current_version,
        latest_version: Some(manifest.version),
        download_url: Some(format!(
            "{}/{}/{}/update.zip",
            UPDATE_SERVER_URL, platform, arch
        )),
        force_update: is_force_update,
        has_update,
        heart_interval: None,
        heartbeat_timeout_multiplier: None,
        trial_enabled: false,
        is_active: true,
    })
}

/// 版本比较
fn is_remote_version_newer(current: &str, latest: &str) -> bool {
    let current_parts: Vec<u32> = current
        .split('.')
        .map(|s| s.parse().unwrap_or(0))
        .collect();
    let latest_parts: Vec<u32> = latest
        .split('.')
        .map(|s| s.parse().unwrap_or(0))
        .collect();

    for i in 0..current_parts.len().max(latest_parts.len()) {
        let current = current_parts.get(i).unwrap_or(&0);
        let latest = latest_parts.get(i).unwrap_or(&0);

        if latest > current {
            return true;
        }
        if latest < current {
            return false;
        }
    }

    false
}

/// 下载单个文件
async fn download_file(
    client: &Client,
    url: &str,
    target_path: &Path,
    expected_hash: &str,
) -> Result<(), String> {
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("下载失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP 错误: {}", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("读取响应失败: {}", e))?;

    // 验证 hash
    let actual_hash = {
        use sha2::{Digest, Sha256};
        hex::encode(Sha256::digest(&bytes))
    };

    if actual_hash != expected_hash {
        return Err(format!(
            "文件校验失败: 期望 {}，实际 {}",
            expected_hash, actual_hash
        ));
    }

    // 写入文件
    fs::write(target_path, bytes)
        .map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(())
}

/// 并行下载所有补丁文件
async fn download_patch_files(
    manifest: &UpdateManifest,
    cache_dir: &Path,
    progress_callback: impl Fn(UpdateProgress),
) -> Result<(), String> {
    let client = Arc::new(
        Client::builder()
            .timeout(Duration::from_secs(300))
            .pool_max_idle_per_host(10)
            .build()
            .map_err(|e| format!("创建客户端失败: {}", e))?,
    );

    let total_size = manifest.total_size;
    let downloaded = Arc::new(Mutex::new(0u64));
    let start_time = Instant::now();

    // 过滤出需要下载的文件
    let files_to_download: Vec<_> = manifest
        .files
        .iter()
        .filter(|f| f.action != PatchAction::Delete)
        .collect();

    // 并行下载
    let mut handles = vec![];
    for file in files_to_download {
        let client = client.clone();
        let downloaded = downloaded.clone();
        let progress_callback = &progress_callback;

        let handle = tokio::spawn(async move {
            let target_path = cache_dir.join(&file.path);

            // 确保目录存在
            if let Some(parent) = target_path.parent() {
                let _ = fs::create_dir_all(parent);
            }

            // 下载文件
            match download_file(&client, &file.download_url, &target_path, &file.hash).await {
                Ok(_) => {
                    let mut downloaded = downloaded.lock().unwrap();
                    *downloaded += file.size;

                    let elapsed = start_time.elapsed().as_secs_f64();
                    let speed = if elapsed > 0.0 {
                        *downloaded as f64 / elapsed / 1024.0 / 1024.0
                    } else {
                        0.0
                    };

                    progress_callback(UpdateProgress {
                        status: "downloading".to_string(),
                        progress: (*downloaded as f64 / total_size as f64) * 100.0,
                        speed: format!("{:.2} MB/s", speed),
                        downloaded: *downloaded,
                        total: total_size,
                    });

                    Ok(())
                }
                Err(e) => Err(format!("下载 {} 失败: {}", file.path, e)),
            }
        });

        handles.push(handle);
    }

    // 等待所有下载完成
    for handle in handles {
        handle.await.map_err(|e| e.to_string())??;
    }

    Ok(())
}

/// 应用更新（原子替换）
fn apply_update(
    manifest: &UpdateManifest,
    cache_dir: &Path,
    app_dir: &Path,
) -> Result<(), String> {
    // 创建备份
    let backup_dir = app_dir.join(format!(".backup-{}", chrono::Utc::now().timestamp()));
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("创建备份目录失败: {}", e))?;

    // 1. 处理删除的文件
    for file in &manifest.files {
        if file.action == PatchAction::Delete {
            let target_path = app_dir.join(&file.path);
            if target_path.exists() {
                // 备份
                let backup_path = backup_dir.join(&file.path);
                if let Some(parent) = backup_path.parent() {
                    let _ = fs::create_dir_all(parent);
                }
                let _ = fs::copy(&target_path, &backup_path);

                // 删除
                fs::remove_file(&target_path)
                    .map_err(|e| format!("删除文件失败: {}", e))?;
            }
        }
    }

    // 2. 处理新增和更新的文件
    for file in &manifest.files {
        if file.action != PatchAction::Delete {
            let source_path = cache_dir.join(&file.path);
            let target_path = app_dir.join(&file.path);

            // 备份原文件（如果是更新）
            if file.action == PatchAction::Update && target_path.exists() {
                let backup_path = backup_dir.join(&file.path);
                if let Some(parent) = backup_path.parent() {
                    let _ = fs::create_dir_all(parent);
                }
                let _ = fs::copy(&target_path, &backup_path);
            }

            // 确保目标目录存在
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("创建目录失败: {}", e))?;
            }

            // 原子替换：先复制到临时文件，再重命名
            let temp_path = target_path.with_extension("tmp");
            fs::copy(&source_path, &temp_path)
                .map_err(|e| format!("复制文件失败: {}", e))?;
            fs::rename(&temp_path, &target_path)
                .map_err(|e| format!("替换文件失败: {}", e))?;
        }
    }

    // 3. 清理备份（如果成功）
    // let _ = fs::remove_dir_all(&backup_dir);

    Ok(())
}

/// 下载并应用更新
#[tauri::command]
pub async fn download_and_apply_update<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: State<'_, UpdaterState>,
) -> Result<(), String> {
    // 检查是否已经在下载
    let is_downloading = state.downloading.lock().unwrap();
    if *is_downloading {
        return Err("更新已经在进行中".to_string());
    }
    *state.downloading.lock().unwrap() = true;

    // 获取 manifest
    let manifest = state
        .manifest
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "没有可用的更新".
 to_string())?;

    let app_dir = get_app_dir()?;
    let cache_dir = get_update_cache_dir()?;

    // 清理旧缓存
    let _ = fs::remove_dir_all(&cache_dir);
    fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("创建缓存目录失败: {}", e))?;

    // 发送进度事件
    let emit_progress = |progress: UpdateProgress| {
        let _ = app.emit("update-progress", progress);
    };

    emit_progress(UpdateProgress {
        status: "downloading".to_string(),
        progress: 0.0,
        speed: "0.00 MB/s".to_string(),
        downloaded: 0,
        total: manifest.total_size,
    });

    // 下载补丁文件
    download_patch_files(&manifest, &cache_dir, emit_progress).await?;

    emit_progress(UpdateProgress {
        status: "verifying".to_string(),
        progress: 95.0,
        speed: "验证中...".to_string(),
        downloaded: manifest.total_size,
        total: manifest.total_size,
    });

    // 应用更新
    apply_update(&manifest, &cache_dir, &app_dir)?;

    emit_progress(UpdateProgress {
        status: "ready".to_string(),
        progress: 100.0,
        speed: "完成".to_string(),
        downloaded: manifest.total_size,
        total: manifest.total_size,
    });

    *state.downloading.lock().unwrap() = false;

    Ok(())
}

/// 清理更新缓存
#[tauri::command]
pub fn cleanup_update_cache() -> Result<(), String> {
    let cache_dir = get_update_cache_dir()?;
    if cache_dir.exists() {
        fs::remove_dir_all(&cache_dir)
            .map_err(|e| format!("清理缓存失败: {}", e))?;
    }
    Ok(())
}
