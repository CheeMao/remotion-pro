use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{Duration, Instant};
use base64::Engine;
use hmac::{Hmac, Mac};
use regex::Regex;
use reqwest::multipart::{Form, Part};
use sha1::Sha1;

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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PreviewProjectData {
    template: String,
    slides: Vec<Value>,
    soundtrack_file: Option<String>,
    soundtrack_data_url: Option<String>,
    soundtrack_duration: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DouyinParseResult {
    title: String,
    video_url: String,
    video_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TranscriptionResult {
    text: String,
    duration: f64,
}

#[derive(Debug, Clone)]
struct QiniuConfig {
    access_key: String,
    secret_key: String,
    bucket: String,
    domain: String,
    upload_url: String,
}

fn append_debug_log(message: &str) {
    let log_dir = std::env::temp_dir().join("ai-remotion-debug");
    let log_file = log_dir.join("ai-generate-slides.log");

    if !log_dir.exists() {
        let _ = fs::create_dir_all(&log_dir);
    }

    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file)
    {
        let _ = writeln!(file, "{}", message);
    }
}

fn extract_douyin_content_id(url: &str) -> Option<(String, String)> {
    let patterns = [
        ("video", r"/(?:share/)?video/(\d+)"),
        ("note", r"/(?:share/)?note/(\d+)"),
        ("note", r"/(?:share/)?slides/(\d+)"),
        ("video", r"[?&](?:modal_id|item_id|group_id)=(\d+)"),
    ];

    for (content_type, pattern) in patterns {
        let regex = Regex::new(pattern).ok()?;
        if let Some(captures) = regex.captures(url) {
            if let Some(matched) = captures.get(1) {
                return Some((content_type.to_string(), matched.as_str().to_string()));
            }
        }
    }

    None
}

fn find_first_douyin_item(value: &Value) -> Option<Value> {
    match value {
        Value::Object(map) => {
            if let Some(first_item) = map
                .get("item_list")
                .and_then(|items| items.as_array())
                .and_then(|items| items.first())
            {
                return Some(first_item.clone());
            }

            for nested in map.values() {
                if let Some(found) = find_first_douyin_item(nested) {
                    return Some(found);
                }
            }

            None
        }
        Value::Array(items) => {
            for item in items {
                if let Some(found) = find_first_douyin_item(item) {
                    return Some(found);
                }
            }

            None
        }
        _ => None,
    }
}

fn load_qiniu_config() -> Result<Option<QiniuConfig>, String> {
    let access_key = std::env::var("QINIU_ACCESS_KEY").unwrap_or_default();
    let secret_key = std::env::var("QINIU_SECRET_KEY").unwrap_or_default();
    let bucket = std::env::var("QINIU_BUCKET").unwrap_or_default();
    let domain = std::env::var("QINIU_DOMAIN").unwrap_or_default();
    let upload_url = std::env::var("QINIU_UPLOAD_URL")
        .unwrap_or_else(|_| "https://up.qiniup.com".to_string());

    if [access_key.as_str(), secret_key.as_str(), bucket.as_str(), domain.as_str()]
        .iter()
        .all(|value| value.trim().is_empty())
    {
        return Ok(None);
    }

    if access_key.trim().is_empty()
        || secret_key.trim().is_empty()
        || bucket.trim().is_empty()
        || domain.trim().is_empty()
    {
        return Err("涓冪墰浜戦厤缃笉瀹屾暣锛岃琛ュ叏 QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET / QINIU_DOMAIN".to_string());
    }

    let normalized_domain = if domain.starts_with("http://") || domain.starts_with("https://") {
        domain
    } else {
        format!("https://{}", domain)
    };

    Ok(Some(QiniuConfig {
        access_key,
        secret_key,
        bucket,
        domain: normalized_domain.trim_end_matches('/').to_string(),
        upload_url: upload_url.trim_end_matches('/').to_string(),
    }))
}

fn load_runtime_env() {
    let candidates = [
        PathBuf::from(".env"),
        PathBuf::from("../.env"),
        PathBuf::from("../../.env"),
    ];

    for candidate in candidates {
        if candidate.exists() {
            let _ = dotenvy::from_path_override(candidate);
            break;
        }
    }
}

fn create_douyin_temp_dir() -> Result<PathBuf, String> {
    let dir = std::env::temp_dir().join("ai-remotion-douyin");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create temp dir: {}", e))?;
    }
    Ok(dir)
}

fn sanitize_object_name(input: &str) -> String {
    input
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' || ch == '.' {
                ch
            } else {
                '_'
            }
        })
        .collect()
}

async fn download_file(url: &str, target_path: &Path) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15")
        .build()
        .map_err(|e| format!("Failed to create download client: {}", e))?;
    let bytes = client
        .get(url)
        .header("Referer", "https://www.douyin.com/")
        .send()
        .await
        .map_err(|e| format!("Failed to download file: {}", e))?
        .error_for_status()
        .map_err(|e| format!("Download request failed: {}", e))?
        .bytes()
        .await
        .map_err(|e| format!("Failed to read download response: {}", e))?;

    let mut file = fs::File::create(target_path)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;
    file.write_all(&bytes)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;
    Ok(())
}

fn extract_audio_with_ffmpeg(video_path: &Path, audio_path: &Path) -> Result<(), String> {
    let ffmpeg_path = std::env::var("FFMPEG_PATH").unwrap_or_else(|_| "F:\\ffmpeg\\bin\\ffmpeg.exe".to_string());
    let output = Command::new(ffmpeg_path)
        .args([
            "-y",
            "-i",
            &video_path.to_string_lossy(),
            "-vn",
            "-acodec",
            "libmp3lame",
            "-ar",
            "16000",
            "-ac",
            "1",
            "-b:a",
            "64k",
            &audio_path.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("Failed to run ffmpeg: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Failed to extract audio: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

fn validate_audio_with_ffprobe(audio_path: &Path) -> Result<(), String> {
    let ffprobe_path = std::env::var("FFPROBE_PATH").unwrap_or_else(|_| "F:\\ffmpeg\\bin\\ffprobe.exe".to_string());
    let output = Command::new(ffprobe_path)
        .args([
            "-v",
            "error",
            "-show_entries",
            "stream=codec_type:format=duration,size",
            "-of",
            "json",
            &audio_path.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("Failed to run ffprobe: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Failed to inspect extracted audio: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let probe_json: Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    let has_audio_stream = probe_json
        .get("streams")
        .and_then(|streams| streams.as_array())
        .map(|streams| {
            streams.iter().any(|stream| {
                stream
                    .get("codec_type")
                    .and_then(|codec| codec.as_str())
                    == Some("audio")
            })
        })
        .unwrap_or(false);

    let duration = probe_json
        .get("format")
        .and_then(|format| format.get("duration"))
        .and_then(|duration| duration.as_str())
        .and_then(|duration| duration.parse::<f64>().ok())
        .unwrap_or(0.0);

    if !has_audio_stream || duration < 0.3 {
        return Err("提取出的音频无有效内容，请检查抖音视频是否包含可识别的人声".to_string());
    }

    Ok(())
}

fn build_qiniu_upload_token(config: &QiniuConfig, _object_key: &str) -> Result<String, String> {
    let deadline = chrono::Utc::now().timestamp() + 3600;
    let put_policy = serde_json::json!({
        "scope": config.bucket,
        "deadline": deadline,
    });
    let encoded_policy = base64::engine::general_purpose::URL_SAFE
        .encode(put_policy.to_string());

    let mut mac = Hmac::<Sha1>::new_from_slice(config.secret_key.as_bytes())
        .map_err(|e| format!("Failed to build qiniu signature: {}", e))?;
    mac.update(encoded_policy.as_bytes());
    let signature = mac.finalize().into_bytes();
    let encoded_signature = base64::engine::general_purpose::URL_SAFE.encode(signature);

    Ok(format!(
        "{}:{}:{}",
        config.access_key, encoded_signature, encoded_policy
    ))
}

async fn upload_file_to_qiniu(
    file_path: &Path,
    object_key: &str,
    config: &QiniuConfig,
) -> Result<String, String> {
    let upload_token = build_qiniu_upload_token(config, object_key)?;
    let file_name = file_path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("audio.wav")
        .to_string();
    let file_bytes = fs::read(file_path).map_err(|e| format!("Failed to read upload file: {}", e))?;

    let form = Form::new()
        .text("token", upload_token)
        .text("key", object_key.to_string())
        .part(
            "file",
            Part::bytes(file_bytes)
                .file_name(file_name)
                .mime_str("audio/mpeg")
                .map_err(|e| format!("Failed to set upload mime: {}", e))?,
        );

    let response = reqwest::Client::new()
        .post(&config.upload_url)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to upload audio to Qiniu: {}", e))?
        .error_for_status()
        .map_err(|e| format!("Qiniu upload request failed: {}", e))?;

    let _upload_result: Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse qiniu upload response: {}", e))?;

    Ok(format!("{}/{}", config.domain, object_key))
}

async fn prepare_douyin_transcription_url(video_url: &str) -> Result<Option<String>, String> {
    let Some(config) = load_qiniu_config()? else {
        return Ok(None);
    };

    let temp_dir = create_douyin_temp_dir()?;
    let timestamp = chrono::Utc::now().format("%Y%m%d%H%M%S").to_string();
    let video_path = temp_dir.join(format!("douyin-{}.mp4", timestamp));
    let audio_path = temp_dir.join(format!("douyin-{}.mp3", timestamp));
    let object_key = format!(
        "temp/asr/{}-{}.mp3",
        timestamp,
        sanitize_object_name(
            video_path
                .file_stem()
                .and_then(|stem| stem.to_str())
                .unwrap_or("douyin-audio")
        )
    );

    let result = async {
        download_file(video_url, &video_path).await?;
        extract_audio_with_ffmpeg(&video_path, &audio_path)?;
        validate_audio_with_ffprobe(&audio_path)?;
        upload_file_to_qiniu(&audio_path, &object_key, &config).await
    }
    .await;

    let _ = fs::remove_file(&video_path);
    let _ = fs::remove_file(&audio_path);

    result.map(Some)
}

/// 鐟欙絾鐎介幎鏍叾閸掑棔闊╅柧鐐复閿涘矁骞忛崣鏍潒妫版垳淇婇幁?
#[tauri::command]
async fn parse_douyin_url(share_text: String) -> Result<DouyinParseResult, String> {
    // Step 1: 娴犲孩鏋冮張顑胯厬閹绘劕褰嘦RL
    let url_pattern = Regex::new(r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+")
        .map_err(|e| format!("Regex error: {}", e))?;

    let urls: Vec<&str> = url_pattern
        .find_iter(&share_text)
        .map(|m| m.as_str())
        .collect();

    if urls.is_empty() {
        return Err("未找到有效的分享链接".to_string());
    }

    let share_url = urls[0];

    // Step 2: 娴ｈ法鏁Phone User-Agent閼惧嘲褰囬柌宥呯暰閸氭垵鎮楅惃鍕埂鐎规拷RL
    let _headers = reqwest::header::HeaderMap::new();
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15")
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;

    // 閻參鎽奸幒銉ょ窗闁插秴鐣鹃崥鎴濆煂闂€鍧楁懠閹?
    let response = client
        .get(share_url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch share URL: {}", e))?;

    let final_url = response.url().as_str().to_string();
    let extracted_content = extract_douyin_content_id(&final_url)
        .or_else(|| extract_douyin_content_id(share_url));

    // Step 3: 娴犲抖RL娑擃厽褰侀崣鏍潒妫版厲D
    // URL閺嶇厧绱? https://www.iesdouyin.com/share/video/VIDEO_ID
    let video_id = final_url
        .split('/')
        .last()
        .unwrap_or("")
        .split('?')
        .next()
        .unwrap_or("")
        .to_string();
    let video_id = if video_id.is_empty() {
        extracted_content
            .as_ref()
            .map(|(_, id)| id.clone())
            .unwrap_or_default()
    } else {
        video_id
    };

    if video_id.is_empty() {
        return Err("閺冪姵纭舵禒宥禦L娑擃厽褰侀崣鏍潒妫版厲D".to_string());
    }

    // Step 4: 閺嬪嫬缂撻弽鍥у櫙閸掑棔闊╂い绀L
    let share_page_url = format!("https://www.iesdouyin.com/share/video/{}", video_id);
    let share_page_url = match extracted_content.as_ref().map(|(content_type, _)| content_type.as_str()) {
        Some("note") => format!("https://www.iesdouyin.com/share/note/{}", video_id),
        _ => share_page_url,
    };

    // Step 5: 閼惧嘲褰囨い鐢告桨HTML
    let html_text = client
        .get(&share_page_url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch video page: {}", e))?
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Step 6: 娴犲订TML娑擃厽褰侀崣鏍潒妫版垳淇婇幁?JSON)
    // 閹舵牠鐓剁亸鍡氼潒妫版垶鏆熼幑顔肩摠閸屻劌婀?window._ROUTER_DATA 閸欐﹢鍣烘稉?
    let pattern = Regex::new(r"window\._ROUTER_DATA\s*=\s*(.*?)</script>")
        .map_err(|e| format!("Regex error: {}", e))?;

    let match_data = pattern
        .captures(&html_text)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().trim())
        .ok_or_else(|| "无法从 HTML 中解析视频信息".to_string())?;

    let json_data: Value = serde_json::from_str(match_data)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // Step 7: 閹绘劕褰囩憴鍡涱暥閺佺増宓?
    let video_info_res = json_data
        .get("loaderData")
        .and_then(|l| {
            l.get(format!("video_{}/page", video_id))
                .or_else(|| l.get(format!("note_{}/page", video_id)))
        })
        .and_then(|v| v.get("videoInfoRes"))
        .cloned();

    let item_list = video_info_res
        .as_ref()
        .and_then(|info| info.get("item_list"))
        .and_then(|items| items.as_array())
        .and_then(|items| items.first())
        .cloned()
        .or_else(|| find_first_douyin_item(&json_data))
        .ok_or_else(|| "无法解析视频或图文信息".to_string())?;

    // Step 8: 閼惧嘲褰囬弮鐘虫寜閸楁媽顫嬫０鎱L
    let video_url = item_list
        .get("video")
        .and_then(|v| v.get("play_addr"))
        .and_then(|p| p.get("url_list"))
        .and_then(|u| u.as_array())
        .and_then(|arr| arr.first())
        .and_then(|url| url.as_str())
        .map(|url| url.replace("playwm", "play"))
        .ok_or_else(|| "閺冪姵纭堕懢宄板絿鐟欏棝顣禪RL".to_string())?;

    // 閹绘劕褰囩憴鍡涱暥閹诲繗鍫敍鍫熺垼妫版﹫绱?
    let desc = item_list
        .get("desc")
        .and_then(|d| d.as_str())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("douyin_{}", video_id));

    Ok(DouyinParseResult {
        title: desc,
        video_url,
        video_id,
    })
}

/// 娴ｈ法鏁ら梼鍧楀櫡娴滄厪ashScope鏉烆剙鍟撶憴鍡涱暥鐠囶參鐓?
#[tauri::command]
async fn transcribe_douyin_video(video_url: String, access_key: String) -> Result<TranscriptionResult, String> {
    if access_key.is_empty() {
        return Err("鐠囧嘲鍘涢柊宥囩枂闂冨潡鍣锋禍鎱廰shScope API Key".to_string());
    }

    let transcription_source_url = prepare_douyin_transcription_url(&video_url)
        .await?
        .unwrap_or(video_url.clone());

    // Step 1: 閹绘劒姘﹀鍌涱劄鏉烆剙鍟撴禒璇插
    let client = reqwest::Client::new();
    let task_response = client
        .post("https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription")
        .header("Authorization", format!("Bearer {}", access_key))
        .header("Content-Type", "application/json")
        .header("X-DashScope-Async", "enable")
        .json(&serde_json::json!({
            "model": "paraformer-v2",
            "input": {
                "file_urls": [transcription_source_url]
            },
            "parameters": {
                "channel_id": [0],
                "language_hints": ["zh", "en"]
            }
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to submit transcription task: {}", e))?;

    let task_json: Value = task_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse task response: {}", e))?;

    let task_id = task_json
        .get("output")
        .and_then(|o| o.get("task_id"))
        .and_then(|t| t.as_str())
        .ok_or_else(|| format!("閺冪姵纭堕懢宄板絿task_id: {:?}", task_json))?;

    // Step 2: 鏉烆喛顕楃粵澶婄窡娴犺濮熺€瑰本鍨?
    let mut attempts = 0;
    let max_attempts = 60; // 閺堚偓婢舵氨鐡戝?0缁?
    let mut transcription_url = String::new();

    while attempts < max_attempts {
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

        let query_response = client
            .get(format!(
                "https://dashscope.aliyuncs.com/api/v1/tasks/{}",
                task_id
            ))
            .header("Authorization", format!("Bearer {}", access_key))
            .send()
            .await
            .map_err(|e| format!("Failed to query task: {}", e))?;

        let query_json: Value = query_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse query response: {}", e))?;

        let status = query_json
            .get("output")
            .and_then(|o| o.get("task_status"))
            .and_then(|s| s.as_str())
            .unwrap_or("UNKNOWN");

        match status {
            "SUCCEEDED" => {
                transcription_url = query_json
                    .get("output")
                    .and_then(|o| o.get("results"))
                    .and_then(|r| r.as_array())
                    .and_then(|arr| arr.first())
                    .and_then(|item| item.get("transcription_url"))
                    .and_then(|u| u.as_str())
                    .map(|s| s.to_string())
                    .ok_or_else(|| "閺冪姵纭堕懢宄板絿鏉烆剙鍟撶紒鎾寸亯URL".to_string())?;
                break;
            }
            "FAILED" | "CANCELLED" => {
                return Err(format!("鏉烆剙鍟撴禒璇插婢惰精瑙? {:?}", query_json));
            }
            _ => {
                // PENDING or RUNNING, continue waiting
                attempts += 1;
            }
        }
    }

    if transcription_url.is_empty() {
        return Err("转写任务超时".to_string());
    }

    // Step 3: 娑撳娴囨潪顒€鍟撶紒鎾寸亯
    let result_response = client
        .get(&transcription_url)
        .send()
        .await
        .map_err(|e| format!("Failed to download transcription: {}", e))?;

    let result_json: Value = result_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse transcription JSON: {}", e))?;

    // Step 4: 閹绘劕褰囨潪顒€鍟撻弬鍥ㄦ拱
    let transcripts = result_json
        .get("transcripts")
        .and_then(|t| t.as_array())
        .ok_or_else(|| "鏉烆剙鍟撶紒鎾寸亯閺嶇厧绱￠柨娆掝嚖".to_string())?;

    if transcripts.is_empty() {
        return Err("转写结果为空".to_string());
    }

    let text = transcripts
        .iter()
        .filter_map(|t| t.get("text").and_then(|txt| txt.as_str()))
        .collect::<Vec<_>>()
        .join("\n");

    let duration = transcripts
        .last()
        .and_then(|t| t.get("end_time"))
        .and_then(|e| e.as_f64())
        .unwrap_or(0.0)
        / 1000.0; // 濮ｎ偆顫楁潪顒傤潡

    Ok(TranscriptionResult { text, duration })
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
    access_key: String,
    model: String,
    prompt: String,
) -> Result<String, String> {
    let started_at = Instant::now();

    if access_key.is_empty() {
        return Err("Please configure the AI API key first.".to_string());
    }

    if api_url.is_empty() {
        return Err("Please configure the AI API URL first.".to_string());
    }

    let trimmed_api_url = api_url.trim_end_matches('/');
    let url = if trimmed_api_url.ends_with("/chat/completions") {
        trimmed_api_url.to_string()
    } else {
        format!("{}/chat/completions", trimmed_api_url)
    };

    let model_name = if model.is_empty() {
        "qwen-plus".to_string()
    } else {
        model
    };

    append_debug_log(&format!(
        "generate_slides:start elapsed_ms=0 url={} model={} prompt_chars={}",
        url,
        model_name,
        prompt.chars().count()
    ));

    let client = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(10))
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| format!("Failed to create AI HTTP client: {}", e))?;

    let before_send = Instant::now();
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", access_key))
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
        .map_err(|e| {
            append_debug_log(&format!(
                "generate_slides:send_error elapsed_ms={} send_ms={} error={}",
                started_at.elapsed().as_millis(),
                before_send.elapsed().as_millis(),
                e
            ));
            format!("AI request failed: {}", e)
        })?;

    let status = response.status();
    let after_send_ms = started_at.elapsed().as_millis();
    let body_text = response
        .text()
        .await
        .map_err(|e| {
            append_debug_log(&format!(
                "generate_slides:body_error elapsed_ms={} status={} error={}",
                started_at.elapsed().as_millis(),
                status.as_u16(),
                e
            ));
            format!("Failed to read AI response body: {}", e)
        })?;

    append_debug_log(&format!(
        "generate_slides:response elapsed_ms={} send_ms={} status={} body_chars={}",
        started_at.elapsed().as_millis(),
        after_send_ms,
        status.as_u16(),
        body_text.chars().count()
    ));

    if !status.is_success() {
        return Err(format!(
            "AI request returned HTTP {}: {}",
            status.as_u16(),
            body_text
        ));
    }

    let json: serde_json::Value = serde_json::from_str(&body_text)
        .map_err(|e| format!("Failed to parse AI response JSON: {}. Body: {}", e, body_text))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| format!("Unexpected AI response: {}", json))?;

    let json_start = content.find('{').unwrap_or(0);
    let json_end = content
        .rfind('}')
        .map(|index| index + 1)
        .unwrap_or(content.len());

    let result = content[json_start..json_end].to_string();
    append_debug_log(&format!(
        "generate_slides:success elapsed_ms={} content_chars={}",
        started_at.elapsed().as_millis(),
        result.chars().count()
    ));
    Ok(result)
}

#[tauri::command(rename_all = "camelCase")]
async fn save_slides(
    template: String,
    voice_id: String,
    raw_text: String,
    slides: Vec<Value>,
    content_path: String,
    soundtrack_path: Option<String>,
    soundtrack_duration: Option<f64>,
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
            soundtrack_path: soundtrack_path.or_else(|| {
                existing_meta
                    .as_ref()
                    .and_then(|meta| meta.soundtrack_path.clone())
            }),
            soundtrack_duration: soundtrack_duration.or_else(|| {
                existing_meta
                    .as_ref()
                    .and_then(|meta| meta.soundtrack_duration)
            }),
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

#[tauri::command(rename_all = "camelCase")]
async fn generate_audio(
    voice_id: String,
    access_key: String,
    app_id: String,
    resource_id: String,
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
            "-k",
            &access_key,
            "--app-id",
            &app_id,
            "--resource-id",
            &resource_id,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
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
            "-k",
            &access_key,
            "--app-id",
            &app_id,
            "--resource-id",
            &resource_id,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
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
    access_key: String,
    app_id: String,
    resource_id: String,
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
            &access_key,
            "--app-id",
            &app_id,
            "--resource-id",
            &resource_id,
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
            &access_key,
            "--app-id",
            &app_id,
            "--resource-id",
            &resource_id,
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
async fn generate_storyboard_timeline(
    raw_text: String,
    voice_id: String,
    access_key: String,
    app_id: String,
    resource_id: String,
    speech_rate: Option<f64>,
    content_path: String,
) -> Result<String, String> {
    if raw_text.trim().is_empty() {
        return Err("Narration text is empty.".to_string());
    }

    let project_dir = get_project_dir()?;
    let (content_file, text_file, _audio_file, _audio_repo_relative, _) =
        derive_project_paths(&project_dir, &content_path)?;
    let content_dir = content_file
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "Failed to resolve content directory.".to_string())?;

    if !content_dir.exists() {
        fs::create_dir_all(&content_dir)
            .map_err(|e| format!("Failed to create content directory: {}", e))?;
    }

    let audio_dir = content_dir.join("audio");
    if !audio_dir.exists() {
        fs::create_dir_all(&audio_dir)
            .map_err(|e| format!("Failed to create audio directory: {}", e))?;
    }

    fs::write(&text_file, raw_text)
        .map_err(|e| format!("Failed to write narration text: {}", e))?;

    let text_repo_relative = repo_relative_path(&project_dir, &text_file)?;
    let audio_dir_repo_relative = repo_relative_path(&project_dir, &audio_dir)?;

    #[cfg(target_os = "windows")]
    let output = {
        let mut command = Command::new("cmd");
        command.args([
            "/C",
            "npx",
            "tsx",
            "src/cli/index.ts",
            "narrate-timeline",
            &text_repo_relative,
            "-v",
            &voice_id,
            "-o",
            &audio_dir_repo_relative,
            "-k",
            &access_key,
            "--app-id",
            &app_id,
            "--resource-id",
            &resource_id,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
            .output()
            .map_err(|e| format!("Failed to generate narration timeline: {}", e))?
    };

    #[cfg(not(target_os = "windows"))]
    let output = {
        let mut command = Command::new("npx");
        command.args([
            "tsx",
            "src/cli/index.ts",
            "narrate-timeline",
            &text_repo_relative,
            "-v",
            &voice_id,
            "-o",
            &audio_dir_repo_relative,
            "-k",
            &access_key,
            "--app-id",
            &app_id,
            "--resource-id",
            &resource_id,
        ]);

        if let Some(rate) = speech_rate {
            command.arg("--speech-rate").arg(rate.to_string());
        }

        command
            .current_dir(&project_dir)
            .output()
            .map_err(|e| format!("Failed to generate narration timeline: {}", e))?
    };

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() {
        return Err(format!(
            "Narration timeline generation failed:\n{}\n{}",
            stdout, stderr
        ));
    }

    Ok(stdout)
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

#[tauri::command(rename_all = "camelCase")]
async fn load_preview_project(content_path: String) -> Result<String, String> {
    let project_dir = get_project_dir()?;
    let (content_file, _, soundtrack_file, _, _) =
        derive_project_paths(&project_dir, &content_path)?;

    if !content_file.exists() {
        return Err("Content JSON does not exist. Save slides first.".to_string());
    }

    let file_content = fs::read_to_string(&content_file)
        .map_err(|e| format!("Failed to read content file: {}", e))?;
    let data: SlidesData = serde_json::from_str(&file_content)
        .map_err(|e| format!("Failed to parse content file: {}", e))?;

    let preview = PreviewProjectData {
        template: data.meta.template,
        slides: data.slides,
        soundtrack_file: if soundtrack_file.exists() {
            Some(soundtrack_file.to_string_lossy().to_string())
        } else {
            None
        },
        soundtrack_data_url: if soundtrack_file.exists() {
            let bytes = fs::read(&soundtrack_file)
                .map_err(|e| format!("Failed to read soundtrack file: {}", e))?;
            Some(format!(
                "data:audio/mpeg;base64,{}",
                base64::engine::general_purpose::STANDARD.encode(bytes)
            ))
        } else {
            None
        },
        soundtrack_duration: data.meta.soundtrack_duration,
    };

    serde_json::to_string(&preview)
        .map_err(|e| format!("Failed to serialize preview project: {}", e))
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
    load_runtime_env();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            generate_slides,
            save_slides,
            check_remotion_running,
            start_remotion,
            ensure_remotion_running,
            generate_narration,
            generate_storyboard_timeline,
            generate_audio,
            sync_timeline,
            load_preview_project,
            render_video,
            parse_douyin_url,
            transcribe_douyin_video,
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


