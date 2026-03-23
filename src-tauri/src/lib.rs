use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[derive(Debug, Serialize, Deserialize)]
struct SlidesData {
    meta: Meta,
    slides: Vec<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Meta {
    title: String,
    template: String,
    voice_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    full_narration: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    soundtrack_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    soundtrack_duration: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct NarrationInfo {
    #[serde(rename = "audioPath")]
    audio_path: String,
    duration: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RemotionStartupResult {
    port: u16,
    was_running: bool,
    message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CurrentProjectData {
    template: String,
    content_path: String,
}

const REMOTION_PORT: u16 = 32123;

fn normalize_repo_relative_path(path: &str) -> String {
    path.replace('\\', "/").trim_start_matches('/').to_string()
}

fn resolve_project_path(project_dir: &Path, repo_relative_path: &str) -> PathBuf {
    project_dir.join(normalize_repo_relative_path(repo_relative_path))
}

fn repo_relative_path(project_dir: &Path, absolute_path: &Path) -> Result<String, String> {
    absolute_path
        .strip_prefix(project_dir)
        .map(|path| path.to_string_lossy().replace('\\', "/"))
        .map_err(|e| format!("Failed to resolve relative path: {}", e))
}

fn static_asset_path_from_repo_path(repo_relative_path: &str) -> String {
    normalize_repo_relative_path(repo_relative_path)
        .trim_start_matches("public/")
        .to_string()
}

fn derive_project_paths(
    project_dir: &Path,
    content_path: &str,
) -> Result<(PathBuf, PathBuf, PathBuf, String, String), String> {
    let content_file = resolve_project_path(project_dir, content_path);
    let project_folder = content_file
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "Failed to resolve project content folder".to_string())?;
    let audio_file = project_folder.join("audio").join("narration.mp3");
    let raw_text_file = project_folder.join("raw-narration.txt");
    let audio_repo_relative = repo_relative_path(project_dir, &audio_file)?;
    let audio_static_path = static_asset_path_from_repo_path(&audio_repo_relative);

    Ok((
        content_file,
        raw_text_file,
        audio_file,
        audio_repo_relative,
        audio_static_path,
    ))
}

fn get_project_dir() -> Result<std::path::PathBuf, String> {
    let tauri_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;

    tauri_dir
        .parent()
        .map(|path| path.to_path_buf())
        .ok_or_else(|| "Failed to resolve project root".to_string())
}

fn spawn_remotion_process(project_dir: &std::path::Path) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "npm", "run", "dev"])
            .current_dir(project_dir)
            .creation_flags(0x08000000)
            .spawn()
            .map_err(|error| format!("Failed to start Remotion: {}", error))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("npm")
            .args(["run", "dev"])
            .current_dir(project_dir)
            .spawn()
            .map_err(|e| format!("Failed to start Remotion: {}", e))?;
    }

    Ok(())
}

async fn find_remotion_port() -> Result<Option<u16>, String> {
    let timeout = std::time::Duration::from_millis(500);
    let candidates = [
        SocketAddr::from(([127, 0, 0, 1], REMOTION_PORT)),
        SocketAddr::from(([0, 0, 0, 0, 0, 0, 0, 1], REMOTION_PORT)),
    ];

    for addr in candidates {
        if TcpStream::connect_timeout(&addr, timeout).is_ok() {
            return Ok(Some(REMOTION_PORT));
        }
    }

    Ok(None)
}

async fn wait_for_remotion_port(max_attempts: usize) -> Result<Option<u16>, String> {
    for _ in 0..max_attempts {
        std::thread::sleep(std::time::Duration::from_secs(1));

        if let Some(port) = find_remotion_port().await? {
            return Ok(Some(port));
        }
    }

    Ok(None)
}

#[tauri::command(rename_all = "camelCase")]
async fn generate_slides(
    api_url: String,
    api_key: String,
    model: String,
    prompt: String,
) -> Result<String, String> {
    if api_key.is_empty() {
        return Err("Please configure the AI API key first.".to_string());
    }

    if api_url.is_empty() {
        return Err("Please configure the AI API URL first.".to_string());
    }

    let url = if api_url.ends_with('/') {
        format!("{}chat/completions", api_url)
    } else {
        format!("{}/chat/completions", api_url)
    };

    let model_name = if model.is_empty() {
        "qwen-plus".to_string()
    } else {
        model
    };

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .header("User-Agent", "codex-desktop/1.0.0")
        .json(&serde_json::json!({
            "model": model_name,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }))
        .send()
        .await
        .map_err(|e| format!("AI request failed: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse AI response: {}", e))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| format!("Unexpected AI response: {}", json))?;

    let json_start = content.find('{').unwrap_or(0);
    let json_end = content
        .rfind('}')
        .map(|index| index + 1)
        .unwrap_or(content.len());

    Ok(content[json_start..json_end].to_string())
}

#[tauri::command(rename_all = "camelCase")]
async fn save_slides(
    template: String,
    voice_id: String,
    raw_text: String,
    slides: Vec<Value>,
    content_path: String,
) -> Result<String, String> {
    let project_dir = get_project_dir()?;
    let content_file = resolve_project_path(&project_dir, &content_path);
    let content_dir = content_file
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "Failed to resolve content directory.".to_string())?;

    if !content_dir.exists() {
        fs::create_dir_all(&content_dir)
            .map_err(|e| format!("Failed to create content directory: {}", e))?;
    }

    let existing_meta = if content_file.exists() {
        fs::read_to_string(&content_file)
            .ok()
            .and_then(|content| serde_json::from_str::<SlidesData>(&content).ok())
            .map(|data| data.meta)
    } else {
        None
    };

    let data = SlidesData {
        meta: Meta {
            title: "Generated Video".to_string(),
            template,
            voice_id,
            full_narration: if raw_text.trim().is_empty() {
                None
            } else {
                Some(raw_text)
            },
            soundtrack_path: existing_meta
                .as_ref()
                .and_then(|meta| meta.soundtrack_path.clone()),
            soundtrack_duration: existing_meta
                .as_ref()
                .and_then(|meta| meta.soundtrack_duration),
        },
        slides,
    };

    let json_str = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize slides: {}", e))?;

    fs::write(&content_file, json_str)
        .map_err(|e| format!("Failed to write content file: {}", e))?;

    let current_project_path = project_dir
        .join("public")
        .join("projects")
        .join("current-project.json");
    if let Some(parent) = current_project_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create current project directory: {}", e))?;
        }
    }

    let current_project = CurrentProjectData {
        template: data.meta.template.clone(),
        content_path: normalize_repo_relative_path(&content_path),
    };
    let current_project_json = serde_json::to_string_pretty(&current_project)
        .map_err(|e| format!("Failed to serialize current project: {}", e))?;
    fs::write(&current_project_path, current_project_json)
        .map_err(|e| format!("Failed to write current project file: {}", e))?;

    Ok(content_file.to_string_lossy().to_string())
}

#[tauri::command]
async fn check_remotion_running() -> Result<bool, String> {
    Ok(find_remotion_port().await?.is_some())
}

#[tauri::command(rename_all = "camelCase")]
async fn start_remotion() -> Result<String, String> {
    if let Some(port) = find_remotion_port().await? {
        return Ok(format!("Remotion is already running on port {}.", port));
    }

    let project_dir = get_project_dir()?;
    spawn_remotion_process(&project_dir)?;

    if let Some(port) = wait_for_remotion_port(45).await? {
        return Ok(format!("Remotion started on port {}.", port));
    }

    Err(
        "Timed out while waiting for Remotion to start. Try running `npm run dev` in the project root to inspect the startup error.".to_string(),
    )
}

#[tauri::command(rename_all = "camelCase")]
async fn ensure_remotion_running() -> Result<RemotionStartupResult, String> {
    if let Some(port) = find_remotion_port().await? {
        return Ok(RemotionStartupResult {
            port,
            was_running: true,
            message: format!("Remotion Studio is already running on port {}.", port),
        });
    }

    let project_dir = get_project_dir()?;
    spawn_remotion_process(&project_dir)?;

    if let Some(port) = wait_for_remotion_port(45).await? {
        return Ok(RemotionStartupResult {
            port,
            was_running: false,
            message: format!("Remotion Studio started on port {}.", port),
        });
    }

    Err(
        "Timed out while waiting for Remotion Studio. Try running `npm run dev` in the project root to inspect the startup error.".to_string(),
    )
}

#[tauri::command]
async fn synthesize_voice(
    text: String,
    voice_id: String,
    output_path: String,
) -> Result<String, String> {
    let project_dir = get_project_dir()?;
    let script_path = project_dir.join("scripts").join("tts_synthesize.py");
    let api_key = std::env::var("DASHSCOPE_API_KEY").unwrap_or_default();

    let output = Command::new("python")
        .arg(&script_path)
        .arg("--voice")
        .arg(&voice_id)
        .arg("--text")
        .arg(&text)
        .arg("--output")
        .arg(&output_path)
        .env("DASHSCOPE_API_KEY", &api_key)
        .output()
        .map_err(|e| format!("Failed to execute TTS script: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command(rename_all = "camelCase")]
async fn generate_audio(
    voice_id: String,
    api_key: String,
    speech_rate: Option<f64>,
    content_path: String,
) -> Result<String, String> {
    let project_dir = get_project_dir()?;
    let (content_file, _, audio_file, _, _) =
        derive_project_paths(&project_dir, &content_path)?;

    if !content_file.exists() {
        return Err("Content JSON does not exist. Generate slides first.".to_string());
    }

    if let Some(parent) = audio_file.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create audio directory: {}", e))?;
        }
    }

    let content_repo_relative = repo_relative_path(&project_dir, &content_file)?;
    let audio_dir_repo_relative = audio_file
        .parent()
        .map(|path| repo_relative_path(&project_dir, path))
        .transpose()?
        .unwrap_or_else(|| "public/audio".to_string());

    #[cfg(target_os = "windows")]
    let output = {
        let mut command = Command::new("cmd");
        command.args([
            "/C",
            "npx",
            "tsx",
            "src/cli/index.ts",
            "audio",
            &content_repo_relative,
            "-v",
            &voice_id,
            "-o",
            &audio_dir_repo_relative,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
            .env("DASHSCOPE_API_KEY", &api_key)
            .output()
            .map_err(|e| format!("Failed to generate audio: {}", e))?
    };

    #[cfg(not(target_os = "windows"))]
    let output = {
        let mut command = Command::new("npx");
        command.args([
            "tsx",
            "src/cli/index.ts",
            "audio",
            &content_repo_relative,
            "-v",
            &voice_id,
            "-o",
            &audio_dir_repo_relative,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
            .env("DASHSCOPE_API_KEY", &api_key)
            .output()
            .map_err(|e| format!("Failed to generate audio: {}", e))?
    };

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(format!("Audio generation failed:\n{}\n{}", stdout, stderr))
    }
}

#[tauri::command(rename_all = "camelCase")]
async fn generate_narration(
    raw_text: String,
    voice_id: String,
    api_key: String,
    speech_rate: Option<f64>,
    content_path: String,
) -> Result<String, String> {
    if raw_text.trim().is_empty() {
        return Err("Narration text is empty.".to_string());
    }

    let project_dir = get_project_dir()?;
    let (content_file, text_file, audio_file, audio_repo_relative, _) =
        derive_project_paths(&project_dir, &content_path)?;
    let content_dir = content_file
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "Failed to resolve content directory.".to_string())?;

    if !content_dir.exists() {
        fs::create_dir_all(&content_dir)
            .map_err(|e| format!("Failed to create content directory: {}", e))?;
    }

    if let Some(audio_dir) = audio_file.parent() {
        if !audio_dir.exists() {
            fs::create_dir_all(audio_dir)
                .map_err(|e| format!("Failed to create audio directory: {}", e))?;
        }
    }

    fs::write(&text_file, raw_text)
        .map_err(|e| format!("Failed to write narration text: {}", e))?;

    let text_repo_relative = repo_relative_path(&project_dir, &text_file)?;

    #[cfg(target_os = "windows")]
    let output = {
        let mut command = Command::new("cmd");
        command.args([
            "/C",
            "npx",
            "tsx",
            "src/cli/index.ts",
            "narrate",
            &text_repo_relative,
            "-v",
            &voice_id,
            "-o",
            &audio_repo_relative,
            "-k",
            &api_key,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
            .output()
            .map_err(|e| format!("Failed to generate narration: {}", e))?
    };

    #[cfg(not(target_os = "windows"))]
    let output = {
        let mut command = Command::new("npx");
        command.args([
            "tsx",
            "src/cli/index.ts",
            "narrate",
            &text_repo_relative,
            "-v",
            &voice_id,
            "-o",
            &audio_repo_relative,
            "-k",
            &api_key,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
            .output()
            .map_err(|e| format!("Failed to generate narration: {}", e))?
    };

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() {
        return Err(format!("Narration generation failed:\n{}\n{}", stdout, stderr));
    }

    let parsed: NarrationInfo = serde_json::from_str(stdout.trim())
        .map_err(|e| format!("Failed to parse narration result: {}\n{}", e, stdout))?;

    serde_json::to_string(&parsed)
        .map_err(|e| format!("Failed to serialize narration result: {}", e))
}

#[tauri::command(rename_all = "camelCase")]
async fn sync_timeline(voice_id: String, content_path: String) -> Result<String, String> {
    let project_dir = get_project_dir()?;
    let (content_file, _, soundtrack_file, soundtrack_repo_relative, soundtrack_static_path) =
        derive_project_paths(&project_dir, &content_path)?;
    let content_repo_relative = repo_relative_path(&project_dir, &content_file)?;

    if !content_file.exists() {
        return Err("Content JSON does not exist. Generate slides first.".to_string());
    }

    if !soundtrack_file.exists() {
        return Err("narration.mp3 does not exist. Generate narration first.".to_string());
    }

    #[cfg(target_os = "windows")]
    let output = Command::new("cmd")
        .args([
            "/C",
            "npx",
            "tsx",
            "src/cli/index.ts",
            "timeline",
            &content_repo_relative,
            "-s",
            &soundtrack_repo_relative,
            "-p",
            &soundtrack_static_path,
            "-v",
            &voice_id,
        ])
        .current_dir(&project_dir)
        .output()
        .map_err(|e| format!("Failed to sync timeline: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("npx")
        .args([
            "tsx",
            "src/cli/index.ts",
            "timeline",
            &content_repo_relative,
            "-s",
            &soundtrack_repo_relative,
            "-p",
            &soundtrack_static_path,
            "-v",
            &voice_id,
        ])
        .current_dir(&project_dir)
        .output()
        .map_err(|e| format!("Failed to sync timeline: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(format!("Timeline sync failed:\n{}\n{}", stdout, stderr))
    }
}

#[tauri::command]
async fn render_video(template: String, content_path: String) -> Result<String, String> {
    let project_dir = get_project_dir()?;
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let output_file = format!("out/video_{}.mp4", timestamp);
    let content_repo_relative = normalize_repo_relative_path(&content_path);
    let out_dir = project_dir.join("out");

    if !out_dir.exists() {
        fs::create_dir_all(&out_dir)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    let output = Command::new("cmd")
        .args([
            "/C",
            "npx",
            "tsx",
            "src/cli/index.ts",
            "render",
            &content_repo_relative,
            "-t",
            &template,
            "-o",
            &output_file,
        ])
        .current_dir(&project_dir)
        .output()
        .map_err(|e| format!("Failed to render video: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("npx")
        .args([
            "tsx",
            "src/cli/index.ts",
            "render",
            &content_repo_relative,
            "-t",
            &template,
            "-o",
            &output_file,
        ])
        .current_dir(&project_dir)
        .output()
        .map_err(|e| format!("Failed to render video: {}", e))?;

    if output.status.success() {
        Ok(output_file)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            generate_slides,
            save_slides,
            check_remotion_running,
            start_remotion,
            ensure_remotion_running,
            synthesize_voice,
            generate_narration,
            generate_audio,
            sync_timeline,
            render_video,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
