use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use aes::Aes256;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use base64::Engine;
use cbc::Decryptor;
use hmac::{Hmac, Mac};
use regex::Regex;
use reqwest::multipart::{Form, Part};
use rsa::pkcs1::DecodeRsaPrivateKey;
use rsa::pkcs8::DecodePrivateKey;
use rsa::{Oaep, RsaPrivateKey};
use sha1::Sha1;
use sha2::{Digest, Sha256};
use tauri::Manager;

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
    generation_mode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    director_style: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    soundtrack_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    soundtrack_duration: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AiReferenceImage {
    data_url: String,
    mime_type: Option<String>,
    name: Option<String>,
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
    generation_mode: Option<String>,
    director_style: Option<Value>,
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

const NETVERIFY_DEFAULT_BASE_URL: &str = "http://yz.ledougc.com/api";
const NETVERIFY_DEFAULT_APP_ID: i64 = 1;
const NETVERIFY_DEFAULT_RSA_PRIVATE_KEY: &str = r#"-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZKG7Hzm+dxl3h
VRFM0T85SdrEbGIj1AcKhOFY5tWQVAOngXSvBcKwty+27YnHChT5JUJTCfVieVmS
rQCxigTzSI9jPMxaDsBYO75RBBjdHRm4udemXgBHYjNQ64yyyjy/EyYbsZsdt7ov
aBisY87bjgX05fuDKZmJDW+iDPikM1FeH46O6+7V3HgnGS1wAORtmDkwbgvf397B
wcbjwcVtuN2fai3BfoIHdzvDUVjlOPS9Ri1ZMdWXm+g7v608zjzMaEpEvQrAOv50
W70wQoon7y9PUiU9o285/ZyJDHnTebaEkMVpdP1yUQo0JkNjxXuS1Nw75Wiz/Rnq
YpXbhugVAgMBAAECggEAQY2bQNz8TBDz7La+1Vy4TVptjuX+6WveaaOvWiBO51v2
RnMz0JfMGVwGyaqI7o7DpFHMvgMEqtXav1tZ8SNsc/6qFKUYqDEpJXrIvh9dTwKe
GEE+6n/Qab0/zpJLIdlKv9O/21mc1U7mm1TYPqznhHSY2xW2nZCoHQ+JqNgZchm1
ZmQvA1vv3AxXZQJhBrO3vQcKdeKTUvUci6anYzMwFQENWh2imZh7LMtSjL2s7VN1
OiT6gArVg1J1SUxElytotv9EwB7CqZPy3pHytzWxQYbt+JAhpWB+lXFb7w7Y/FA5
FYXV8C2LKMIWKBjbvUtA0WDILzM0Y4HuksQ2pSkJ3wKBgQDH6CmCYPIRkQcrWlpN
LPBco6qGmBfaCjSivL3ap6AwxmE9h78xL2cCyxnngfn6E+62NW5oSholcjfJWhF/
VpS6fJbQjFiNy9uR7ht4ppcrbQmobpS3iXeEnThQAJVPrWq5vHWi0bWFlIZuSwGS
oFIDby5DOSsPGn4MkNYO0z6EgwKBgQDEIivAswe9MJId1jK0D+Ur5JIKlVVy7tS5
GC756YEw2HyZA24kvQfewmBpI/Kas0wS2KC6Je2kas6GONPugNzBAtB/JskLc3hy
8KqfyDROsDw6R7Uk+Iy/dXM8SxxXyKOLFTAy/1GqXCc+I87DK4dPHpWvmBZFL7yX
OHC4W2wthwKBgQCDd680y0TnQJWScU1Jy/AXPJt9ALFO97899xp0niC/cveoW4nl
cuMv9xoGInifelRXCDSf6XvgfIkrpkwzjmEpc55LcMEcH6E7C3iNlCF+sarUVkT/
nyw2zp6mHnwTdlzl4YcLmRbjzpXKGxHhuAW3tHqcQxCKUkXrRaVBArPuuQKBgEAZ
1ujc2jun4yljNyEITOMCigRxeALfMaDo2XmOKk33gwlTSK0zJp5UMsRKHmEXFlbW
e/k6qidhTOwrKIC7lupx7AiSeYSHkacnJuyftxC8ooJ9qyNRJFbyoN3kwneiOGkd
XKpeLaebBKxXcZzx3gAqw8smzqiACIf3x0dJgdqDAoGBAICU2Ddk2lkNOIL1L1X6
ZxDKcHV/OCNCuQwRuN782Vb0+UR3hz9XgUoG+qwPYDYrbJOrqrPeGy+qq4U1+GwG
MmT1AK2KztMFXkHrpzYBZAd7rEmzF/L1upS3oXwgfmRMxv/55XjF529Ww9S1ALKT
dJIr1CZ7+2oj45JaXSAxiBpf
-----END PRIVATE KEY-----"#;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuthContext {
    hwid: String,
    device_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuthSession {
    token: String,
    username: String,
    hwid: String,
    device_name: String,
    is_valid: bool,
    expire_time: Option<String>,
    valid_message: String,
    heart_interval: u64,
    heartbeat_timeout: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LicenseStatus {
    username: String,
    is_valid: bool,
    is_active: bool,
    expire_time: Option<String>,
    expire_timestamp: Option<i64>,
    remaining_seconds: i64,
    valid_message: String,
    hwid: String,
    device_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HeartbeatStatus {
    username: String,
    is_valid: bool,
    is_active: bool,
    expire_time: Option<String>,
    valid_message: String,
    hwid: String,
    device_name: String,
    interval: u64,
    heartbeat_timeout: u64,
    max_devices: i64,
    bound_devices: i64,
    commands: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct RegisterResult {
    id: i64,
    username: String,
    app_id: i64,
    created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TrialResult {
    success: bool,
    message: Option<String>,
    added_seconds: Option<i64>,
    expire_time: Option<String>,
    max_devices: Option<i64>,
    is_trial: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
struct RechargeResult {
    success: bool,
    message: Option<String>,
    added_seconds: Option<i64>,
    new_expire_time: Option<String>,
    card_type: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyEnvelope<T> {
    code: i64,
    msg: Option<String>,
    data: Option<T>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyEncryptedEnvelope {
    #[serde(rename = "encrypted")]
    _encrypted: bool,
    algorithm: Option<String>,
    data: String,
    key: String,
    signature: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyLoginUser {
    username: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyLoginData {
    access_token: String,
    user: Option<NetVerifyLoginUser>,
    heart_interval: Option<u64>,
    heartbeat_timeout: Option<u64>,
    is_valid: Option<bool>,
    expire_time: Option<String>,
    valid_message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyExpireData {
    username: Option<String>,
    is_valid: Option<bool>,
    is_active: Option<bool>,
    expire_time: Option<String>,
    expire_timestamp: Option<i64>,
    remaining_seconds: Option<i64>,
    valid_message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyHeartbeatData {
    is_active: Option<bool>,
    expire_time: Option<String>,
    username: Option<String>,
    max_devices: Option<i64>,
    bound_devices: Option<i64>,
    interval: Option<u64>,
    heartbeat_timeout: Option<u64>,
    commands: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct NetVerifyAppInfoData {
    version: Option<String>,
    download_url: Option<String>,
    force_update: Option<bool>,
    heart_interval: Option<u64>,
    heartbeat_timeout_multiplier: Option<u64>,
    trial_enabled: Option<bool>,
    is_active: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct AppInfoSummary {
    current_version: String,
    latest_version: Option<String>,
    download_url: Option<String>,
    force_update: bool,
    has_update: bool,
    heart_interval: Option<u64>,
    heartbeat_timeout_multiplier: Option<u64>,
    trial_enabled: bool,
    is_active: bool,
}

#[derive(Default)]
struct AuthState {
    session: Mutex<Option<AuthSession>>,
}

#[derive(Debug, Clone)]
struct QiniuConfig {
    access_key: String,
    secret_key: String,
    bucket: String,
    domain: String,
    upload_url: String,
}

/// Create a Command that never shows a console window on Windows.
fn silent_command(program: impl AsRef<std::ffi::OsStr>) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    cmd
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

fn netverify_base_url() -> String {
    std::env::var("NETVERIFY_BASE_URL")
        .unwrap_or_else(|_| NETVERIFY_DEFAULT_BASE_URL.to_string())
        .trim()
        .trim_end_matches('/')
        .to_string()
}

fn netverify_app_id() -> i64 {
    std::env::var("NETVERIFY_APP_ID")
        .ok()
        .and_then(|value| value.parse::<i64>().ok())
        .unwrap_or(NETVERIFY_DEFAULT_APP_ID)
}

fn netverify_private_key_pem() -> Result<String, String> {
    if let Ok(path) = std::env::var("NETVERIFY_RSA_PRIVATE_KEY_PATH")
        .or_else(|_| std::env::var("NETVERIFY_PRIVATE_KEY_PATH"))
    {
        let trimmed = path.trim();
        if !trimmed.is_empty() {
            return fs::read_to_string(trimmed)
                .map_err(|e| format!("Failed to read NetVerify private key from {}: {}", trimmed, e));
        }
    }

    if let Ok(pem) = std::env::var("NETVERIFY_RSA_PRIVATE_KEY")
        .or_else(|_| std::env::var("NETVERIFY_PRIVATE_KEY"))
    {
        let normalized = pem.trim().replace("\\n", "\n");
        if !normalized.is_empty() {
            return Ok(normalized);
        }
    }

    Ok(NETVERIFY_DEFAULT_RSA_PRIVATE_KEY.to_string())
}

fn load_netverify_private_key() -> Result<RsaPrivateKey, String> {
    let pem = netverify_private_key_pem()?;
    RsaPrivateKey::from_pkcs8_pem(&pem)
        .or_else(|_| RsaPrivateKey::from_pkcs1_pem(&pem))
        .map_err(|e| format!("Failed to load NetVerify RSA private key: {}", e))
}

fn hex_encode(bytes: &[u8]) -> String {
    let mut output = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        output.push_str(&format!("{:02x}", byte));
    }
    output
}

fn decrypt_netverify_response_body(text: &str) -> Result<String, String> {
    let value: Value =
        serde_json::from_str(text).map_err(|e| format!("Failed to parse NetVerify JSON body: {}", e))?;

    if !value
        .get("encrypted")
        .and_then(Value::as_bool)
        .unwrap_or(false)
    {
        return Ok(text.to_string());
    }

    let encrypted: NetVerifyEncryptedEnvelope = serde_json::from_value(value)
        .map_err(|e| format!("Failed to parse encrypted NetVerify envelope: {}", e))?;

    if encrypted.algorithm.as_deref() != Some("AES-256-CBC") {
        return Err(
            encrypted
                .algorithm
                .map(|value| format!("Unsupported NetVerify encryption algorithm: {}", value))
                .unwrap_or_else(|| "NetVerify encrypted response missing algorithm".to_string()),
        );
    }

    let private_key = load_netverify_private_key()?;
    let encrypted_key = base64::engine::general_purpose::STANDARD
        .decode(encrypted.key.as_bytes())
        .map_err(|e| format!("Failed to decode NetVerify encrypted key: {}", e))?;
    let key_material = private_key
        .decrypt(Oaep::new::<Sha256>(), &encrypted_key)
        .map_err(|e| format!("Failed to decrypt NetVerify AES key: {}", e))?;

    if key_material.len() < 48 {
        return Err(format!(
            "NetVerify AES key payload is too short: expected at least 48 bytes, got {}",
            key_material.len()
        ));
    }

    let aes_key = &key_material[..32];
    let iv = &key_material[32..48];

    if let Some(signature) = encrypted.signature.as_deref() {
        let mut mac =
            Hmac::<Sha256>::new_from_slice(aes_key).map_err(|e| format!("Failed to build NetVerify HMAC: {}", e))?;
        mac.update(encrypted.data.as_bytes());
        let expected_signature = hex_encode(&mac.finalize().into_bytes());
        if !expected_signature.eq_ignore_ascii_case(signature.trim()) {
            return Err("NetVerify response signature verification failed".to_string());
        }
    }

    let ciphertext = base64::engine::general_purpose::STANDARD
        .decode(encrypted.data.as_bytes())
        .map_err(|e| format!("Failed to decode NetVerify encrypted data: {}", e))?;
    let mut buffer = ciphertext.clone();
    let decrypted = Decryptor::<Aes256>::new_from_slices(aes_key, iv)
        .map_err(|e| format!("Failed to initialize NetVerify AES decryptor: {}", e))?
        .decrypt_padded_mut::<Pkcs7>(&mut buffer)
        .map_err(|e| format!("Failed to decrypt NetVerify payload: {}", e))?;

    String::from_utf8(decrypted.to_vec())
        .map_err(|e| format!("Failed to decode decrypted NetVerify payload as UTF-8: {}", e))
}

fn current_device_name() -> String {
    std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "Unknown Device".to_string())
}

fn read_windows_machine_guid() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        let output = silent_command("reg")
            .args(["query", r"HKLM\SOFTWARE\Microsoft\Cryptography", "/v", "MachineGuid"])
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            if line.contains("MachineGuid") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if let Some(value) = parts.last() {
                    let trimmed = value.trim();
                    if !trimmed.is_empty() {
                        return Some(trimmed.to_string());
                    }
                }
            }
        }
    }

    None
}

fn read_mac_decimal() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        let output = silent_command("getmac")
            .args(["/fo", "csv", "/nh"])
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            let first = line
                .split(',')
                .next()
                .map(|value| value.trim_matches('"').trim())
                .unwrap_or("");

            if first.is_empty() || first.eq_ignore_ascii_case("N/A") {
                continue;
            }

            let hex = first.replace('-', "").replace(':', "");
            if hex.len() == 12 {
                if let Ok(value) = u64::from_str_radix(&hex, 16) {
                    return Some(value.to_string());
                }
            }
        }
    }

    None
}

fn get_stable_hwid() -> String {
    let hardware_id = read_windows_machine_guid().unwrap_or_else(|| "UNKNOWN".to_string());
    let mac = read_mac_decimal().unwrap_or_else(|| current_device_name());
    let final_raw = format!("{}|{}", hardware_id, mac);
    let digest = Sha256::digest(final_raw.as_bytes());
    let mut hex = String::with_capacity(digest.len() * 2);
    for byte in digest {
        hex.push_str(&format!("{:02x}", byte));
    }
    hex.chars().take(32).collect()
}

async fn send_netverify_request<T: DeserializeOwned>(
    method: reqwest::Method,
    endpoint: &str,
    token: Option<&str>,
    body: Option<serde_json::Value>,
) -> Result<T, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create NetVerify client: {}", e))?;

    let url = format!("{}{}", netverify_base_url(), endpoint);
    let mut request = client
        .request(method, &url)
        .header("Accept", "application/json")
        .header("Content-Type", "application/json");

    if let Some(token) = token {
        request = request.bearer_auth(token);
    }

    if let Some(body) = body {
        request = request.json(&body);
    }

    let response = request
        .send()
        .await
        .map_err(|e| format!("NetVerify request failed: {}", e))?;
    let status = response.status();
    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read NetVerify response: {}", e))?;
    let normalized_text = decrypt_netverify_response_body(&text).map_err(|e| {
        if status.is_success() {
            format!("Failed to decrypt NetVerify response: {}. Body: {}", e, text)
        } else {
            format!("NetVerify returned HTTP {}: {}", status.as_u16(), text)
        }
    })?;

    let envelope: NetVerifyEnvelope<T> = serde_json::from_str(&normalized_text).map_err(|e| {
        if status.is_success() {
            format!(
                "Failed to parse NetVerify response: {}. Body: {}",
                e, normalized_text
            )
        } else {
            format!("NetVerify returned HTTP {}: {}", status.as_u16(), normalized_text)
        }
    })?;

    if envelope.code != 20000 {
        return Err(
            envelope
                .msg
                .unwrap_or_else(|| format!("NetVerify error {}", envelope.code)),
        );
    }

    envelope
        .data
        .ok_or_else(|| "NetVerify response missing data field".to_string())
}

fn update_auth_session(state: &tauri::State<'_, AuthState>, session: Option<AuthSession>) -> Result<(), String> {
    let mut guard = state
        .session
        .lock()
        .map_err(|_| "Failed to access auth session".to_string())?;
    *guard = session;
    Ok(())
}

fn read_auth_session(state: &tauri::State<'_, AuthState>) -> Result<AuthSession, String> {
    state
        .session
        .lock()
        .map_err(|_| "Failed to access auth session".to_string())?
        .clone()
        .ok_or_else(|| "请先登录后再使用此功能".to_string())
}

fn build_auth_context() -> AuthContext {
    AuthContext {
        hwid: get_stable_hwid(),
        device_name: current_device_name(),
    }
}

fn build_auth_session(context: &AuthContext, data: NetVerifyLoginData) -> AuthSession {
    AuthSession {
        token: data.access_token,
        username: data
            .user
            .and_then(|user| user.username)
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| "未知用户".to_string()),
        hwid: context.hwid.clone(),
        device_name: context.device_name.clone(),
        is_valid: data.is_valid.unwrap_or(false),
        expire_time: data.expire_time,
        valid_message: data.valid_message.unwrap_or_default(),
        heart_interval: data.heart_interval.unwrap_or(60),
        heartbeat_timeout: data.heartbeat_timeout.unwrap_or(180),
    }
}

fn build_license_status(context: &AuthContext, data: NetVerifyExpireData) -> LicenseStatus {
    LicenseStatus {
        username: data.username.unwrap_or_else(|| "未知用户".to_string()),
        is_valid: data.is_valid.unwrap_or(false),
        is_active: data.is_active.unwrap_or(false),
        expire_time: data.expire_time,
        expire_timestamp: data.expire_timestamp,
        remaining_seconds: data.remaining_seconds.unwrap_or(0),
        valid_message: data.valid_message.unwrap_or_default(),
        hwid: context.hwid.clone(),
        device_name: context.device_name.clone(),
    }
}

fn build_heartbeat_status(context: &AuthContext, data: NetVerifyHeartbeatData) -> HeartbeatStatus {
    let is_active = data.is_active.unwrap_or(false);
    let commands = data.commands.unwrap_or_default();
    HeartbeatStatus {
        username: data.username.unwrap_or_else(|| "未知用户".to_string()),
        is_valid: is_active && !commands.iter().any(|cmd| cmd == "force_logout"),
        is_active,
        expire_time: data.expire_time,
        valid_message: if is_active {
            String::new()
        } else {
            "账号已失效".to_string()
        },
        hwid: context.hwid.clone(),
        device_name: context.device_name.clone(),
        interval: data.interval.unwrap_or(60),
        heartbeat_timeout: data.heartbeat_timeout.unwrap_or(180),
        max_devices: data.max_devices.unwrap_or(0),
        bound_devices: data.bound_devices.unwrap_or(0),
        commands,
    }
}

fn parse_version_segments(version: &str) -> Vec<u64> {
    version
        .trim()
        .trim_start_matches(['v', 'V'])
        .split('.')
        .map(|segment| {
            let digits: String = segment
                .chars()
                .take_while(|ch| ch.is_ascii_digit())
                .collect();
            digits.parse::<u64>().unwrap_or(0)
        })
        .collect()
}

fn is_remote_version_newer(current_version: &str, latest_version: &str) -> bool {
    let current_segments = parse_version_segments(current_version);
    let latest_segments = parse_version_segments(latest_version);
    let max_len = current_segments.len().max(latest_segments.len());

    for index in 0..max_len {
        let current = *current_segments.get(index).unwrap_or(&0);
        let latest = *latest_segments.get(index).unwrap_or(&0);

        if latest > current {
            return true;
        }

        if latest < current {
            return false;
        }
    }

    false
}

async fn fetch_license_status_from_token(token: &str, context: &AuthContext) -> Result<LicenseStatus, String> {
    let data: NetVerifyExpireData =
        send_netverify_request(reqwest::Method::GET, "/client/expire-time", Some(token), None).await?;
    Ok(build_license_status(context, data))
}

async fn require_valid_license(state: &tauri::State<'_, AuthState>) -> Result<AuthSession, String> {
    let session = read_auth_session(state)?;
    let context = AuthContext {
        hwid: session.hwid.clone(),
        device_name: session.device_name.clone(),
    };
    let status = fetch_license_status_from_token(&session.token, &context).await?;

    let mut next_session = session.clone();
    next_session.username = status.username.clone();
    next_session.expire_time = status.expire_time.clone();
    next_session.is_valid = status.is_valid;
    next_session.valid_message = status.valid_message.clone();
    update_auth_session(state, Some(next_session.clone()))?;

    if !status.is_valid {
        return Err(if status.valid_message.trim().is_empty() {
            "当前授权无效，请先续费或重新登录".to_string()
        } else {
            status.valid_message
        });
    }

    Ok(next_session)
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(alias = "dashscopeApiKey")]
    pub volcengine_access_key: String,
    pub default_voice_id: String,
    pub default_tts_model: String,
    pub qiniu_access_key: String,
    pub qiniu_secret_key: String,
    pub qiniu_bucket: String,
    pub qiniu_domain: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            volcengine_access_key: std::env::var("VOLCENGINE_ACCESS_KEY")
                .or_else(|_| std::env::var("DASHSCOPE_API_KEY"))
                .unwrap_or_default(),
            default_voice_id: std::env::var("DEFAULT_VOICE_ID").unwrap_or_default(),
            default_tts_model: std::env::var("DEFAULT_TTS_MODEL").unwrap_or_default(),
            qiniu_access_key: std::env::var("QINIU_ACCESS_KEY").unwrap_or_default(),
            qiniu_secret_key: std::env::var("QINIU_SECRET_KEY").unwrap_or_default(),
            qiniu_bucket: std::env::var("QINIU_BUCKET").unwrap_or_default(),
            qiniu_domain: std::env::var("QINIU_DOMAIN").unwrap_or_default(),
        }
    }
}

#[tauri::command]
fn get_app_settings() -> AppSettings {
    AppSettings::default()
}

#[tauri::command]
async fn auth_get_context() -> Result<AuthContext, String> {
    Ok(build_auth_context())
}

#[tauri::command]
async fn auth_get_app_info() -> Result<AppInfoSummary, String> {
    let data: NetVerifyAppInfoData = send_netverify_request(
        reqwest::Method::GET,
        &format!("/apps/{}", netverify_app_id()),
        None,
        None,
    )
    .await?;

    let current_version = env!("CARGO_PKG_VERSION").to_string();
    let latest_version = data
        .version
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());
    let has_update = latest_version
        .as_deref()
        .map(|latest| is_remote_version_newer(&current_version, latest))
        .unwrap_or(false);

    Ok(AppInfoSummary {
        current_version,
        latest_version,
        download_url: data
            .download_url
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty()),
        force_update: has_update && data.force_update.unwrap_or(false),
        has_update,
        heart_interval: data.heart_interval,
        heartbeat_timeout_multiplier: data.heartbeat_timeout_multiplier,
        trial_enabled: data.trial_enabled.unwrap_or(false),
        is_active: data.is_active.unwrap_or(true),
    })
}

#[tauri::command(rename_all = "camelCase")]
async fn auth_register(username: String, password: String) -> Result<RegisterResult, String> {
    let context = build_auth_context();
    send_netverify_request(
        reqwest::Method::POST,
        "/client/register",
        None,
        Some(serde_json::json!({
            "username": username,
            "password": password,
            "app_id": netverify_app_id(),
            "hwid": context.hwid,
            "device_name": context.device_name,
        })),
    )
    .await
}

#[tauri::command(rename_all = "camelCase")]
async fn auth_login(
    username: String,
    password: String,
    state: tauri::State<'_, AuthState>,
) -> Result<AuthSession, String> {
    let context = build_auth_context();
    let data: NetVerifyLoginData = send_netverify_request(
        reqwest::Method::POST,
        "/client/login",
        None,
        Some(serde_json::json!({
            "username": username,
            "password": password,
            "app_id": netverify_app_id(),
            "hwid": context.hwid,
            "device_name": context.device_name,
        })),
    )
    .await?;

    let session = build_auth_session(&context, data);
    update_auth_session(&state, Some(session.clone()))?;
    Ok(session)
}

#[tauri::command(rename_all = "camelCase")]
async fn auth_restore_session(
    token: String,
    state: tauri::State<'_, AuthState>,
) -> Result<AuthSession, String> {
    if token.trim().is_empty() {
        return Err("缺少登录 token".to_string());
    }

    let context = build_auth_context();
    let status = fetch_license_status_from_token(&token, &context).await?;
    let session = AuthSession {
        token,
        username: status.username.clone(),
        hwid: context.hwid.clone(),
        device_name: context.device_name.clone(),
        is_valid: status.is_valid,
        expire_time: status.expire_time.clone(),
        valid_message: status.valid_message.clone(),
        heart_interval: 60,
        heartbeat_timeout: 180,
    };
    update_auth_session(&state, Some(session.clone()))?;
    Ok(session)
}

#[tauri::command]
async fn auth_get_status(state: tauri::State<'_, AuthState>) -> Result<LicenseStatus, String> {
    let session = read_auth_session(&state)?;
    let context = AuthContext {
        hwid: session.hwid.clone(),
        device_name: session.device_name.clone(),
    };
    let status = fetch_license_status_from_token(&session.token, &context).await?;

    let mut next_session = session.clone();
    next_session.username = status.username.clone();
    next_session.expire_time = status.expire_time.clone();
    next_session.is_valid = status.is_valid;
    next_session.valid_message = status.valid_message.clone();
    update_auth_session(&state, Some(next_session))?;

    Ok(status)
}

#[tauri::command]
async fn auth_trial() -> Result<TrialResult, String> {
    let context = build_auth_context();
    send_netverify_request(
        reqwest::Method::POST,
        "/cards/trial",
        None,
        Some(serde_json::json!({
            "app_id": netverify_app_id(),
            "hwid": context.hwid,
        })),
    )
    .await
}

#[tauri::command(rename_all = "camelCase")]
async fn auth_recharge(code: String, state: tauri::State<'_, AuthState>) -> Result<RechargeResult, String> {
    let session = read_auth_session(&state)?;
    send_netverify_request(
        reqwest::Method::POST,
        "/cards/redeem",
        Some(&session.token),
        Some(serde_json::json!({
            "code": code,
            "hwid": session.hwid,
        })),
    )
    .await
}

#[tauri::command]
async fn auth_heartbeat(state: tauri::State<'_, AuthState>) -> Result<HeartbeatStatus, String> {
    let session = read_auth_session(&state)?;
    let context = AuthContext {
        hwid: session.hwid.clone(),
        device_name: session.device_name.clone(),
    };
    let data: NetVerifyHeartbeatData = send_netverify_request(
        reqwest::Method::PUT,
        "/client/heartbeat",
        Some(&session.token),
        Some(serde_json::json!({
            "hwid": session.hwid,
            "device_name": session.device_name,
        })),
    )
    .await?;

    let heartbeat = build_heartbeat_status(&context, data);
    let mut next_session = session.clone();
    next_session.username = heartbeat.username.clone();
    next_session.expire_time = heartbeat.expire_time.clone();
    next_session.is_valid = heartbeat.is_valid;
    next_session.valid_message = heartbeat.valid_message.clone();
    next_session.heart_interval = heartbeat.interval;
    next_session.heartbeat_timeout = heartbeat.heartbeat_timeout;
    update_auth_session(&state, Some(next_session))?;

    Ok(heartbeat)
}

#[tauri::command]
async fn auth_logout(state: tauri::State<'_, AuthState>) -> Result<(), String> {
    update_auth_session(&state, None)
}

#[tauri::command(rename_all = "camelCase")]
async fn open_external_url(url: String) -> Result<(), String> {
    let parsed = reqwest::Url::parse(url.trim())
        .map_err(|e| format!("Invalid external URL: {}", e))?;

    match parsed.scheme() {
        "http" | "https" => {}
        other => {
            return Err(format!("Unsupported URL scheme: {}", other));
        }
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(parsed.as_str())
            .creation_flags(0x08000000)
            .spawn()
            .map_err(|e| format!("Failed to open external URL: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(parsed.as_str())
            .spawn()
            .map_err(|e| format!("Failed to open external URL: {}", e))?;
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        Command::new("xdg-open")
            .arg(parsed.as_str())
            .spawn()
            .map_err(|e| format!("Failed to open external URL: {}", e))?;
    }

    Ok(())
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
    let access_key = std::env::var("QINIU_ACCESS_KEY")
        .unwrap_or_else(|_| option_env!("COMPILED_QINIU_ACCESS_KEY").unwrap_or_default().to_string());
    let secret_key = std::env::var("QINIU_SECRET_KEY")
        .unwrap_or_else(|_| option_env!("COMPILED_QINIU_SECRET_KEY").unwrap_or_default().to_string());
    let bucket = std::env::var("QINIU_BUCKET")
        .unwrap_or_else(|_| option_env!("COMPILED_QINIU_BUCKET").unwrap_or_default().to_string());
    let domain = std::env::var("QINIU_DOMAIN")
        .unwrap_or_else(|_| option_env!("COMPILED_QINIU_DOMAIN").unwrap_or_default().to_string());
    let upload_url = std::env::var("QINIU_UPLOAD_URL")
        .unwrap_or_else(|_| option_env!("COMPILED_QINIU_UPLOAD_URL").unwrap_or_else(|| "https://up.qiniup.com").to_string());

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

    if std::env::var_os("FFMPEG_PATH").is_none() {
        if let Some(path) = resolve_packaged_runtime_binary("ffmpeg") {
            std::env::set_var("FFMPEG_PATH", path);
        }
    }

    if std::env::var_os("FFPROBE_PATH").is_none() {
        if let Some(path) = resolve_packaged_runtime_binary("ffprobe") {
            std::env::set_var("FFPROBE_PATH", path);
        }
    }
}

fn resolve_packaged_runtime_root_from_exe() -> Option<PathBuf> {
    let exe_dir = std::env::current_exe()
        .ok()?
        .parent()
        .map(Path::to_path_buf)?;

    let cli_check = |root: &PathBuf| {
        root.join("app").join("src").join("cli").join("index.js").exists()
            && root.join("remotion-bundle").exists()
    };

    [
        exe_dir.join("resources").join("runtime"),
        exe_dir.join("runtime"),
    ]
    .into_iter()
    .find(cli_check)
}

fn resolve_packaged_runtime_binary(tool_name: &str) -> Option<PathBuf> {
    let runtime_root = resolve_packaged_runtime_root_from_exe()?;

    #[cfg(target_os = "windows")]
    let file_name = format!("{}.exe", tool_name);

    #[cfg(not(target_os = "windows"))]
    let file_name = tool_name.to_string();

    let candidate = runtime_root.join("ffmpeg").join(file_name);
    if candidate.exists() {
        Some(candidate)
    } else {
        None
    }
}

fn resolve_runtime_command_path(env_var: &str, tool_name: &str) -> PathBuf {
    if let Some(value) = std::env::var_os(env_var) {
        let path = PathBuf::from(value);
        if path.exists() {
            return path;
        }
    }

    if let Some(path) = resolve_packaged_runtime_binary(tool_name) {
        return path;
    }

    #[cfg(target_os = "windows")]
    {
        PathBuf::from(format!("{}.exe", tool_name))
    }

    #[cfg(not(target_os = "windows"))]
    {
        PathBuf::from(tool_name)
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
    let ffmpeg_path = resolve_runtime_command_path("FFMPEG_PATH", "ffmpeg");
    let output = silent_command(&ffmpeg_path)
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
        .map_err(|e| format!("Failed to run ffmpeg ({}): {}", ffmpeg_path.display(), e))?;

    if !output.status.success() {
        return Err(format!(
            "Failed to extract audio: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

fn validate_audio_with_ffprobe(audio_path: &Path) -> Result<(), String> {
    let ffprobe_path = resolve_runtime_command_path("FFPROBE_PATH", "ffprobe");
    let output = silent_command(&ffprobe_path)
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
        .map_err(|e| format!("Failed to run ffprobe ({}): {}", ffprobe_path.display(), e))?;

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
async fn parse_douyin_url(
    share_text: String,
    state: tauri::State<'_, AuthState>,
) -> Result<DouyinParseResult, String> {
    let _session = require_valid_license(&state).await?;
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

/// 本地下载视频 → 提取音频 → 返回 base64 字符串
/// 用于没有外部存储时直接将音频数据内嵌到 ASR 请求中
async fn extract_audio_as_base64(video_url: &str) -> Result<String, String> {
    let temp_dir = create_douyin_temp_dir()?;
    let timestamp = chrono::Utc::now().timestamp_millis();
    let video_path = temp_dir.join(format!("asr-{}.mp4", timestamp));
    let audio_path = temp_dir.join(format!("asr-{}.mp3", timestamp));

    let result = async {
        download_file(video_url, &video_path).await?;
        extract_audio_with_ffmpeg(&video_path, &audio_path)?;
        validate_audio_with_ffprobe(&audio_path)?;
        let bytes = fs::read(&audio_path)
            .map_err(|e| format!("读取音频文件失败: {}", e))?;
        Ok(base64::engine::general_purpose::STANDARD.encode(&bytes))
    }
    .await;

    let _ = fs::remove_file(&video_path);
    let _ = fs::remove_file(&audio_path);

    result
}

/// 使用火山引擎豆包语音识别服务转写抖音视频
#[tauri::command]
async fn transcribe_douyin_video(
    video_url: String,
    access_key: String,
    app_id: Option<String>,
    state: tauri::State<'_, AuthState>,
) -> Result<TranscriptionResult, String> {
    let _session = require_valid_license(&state).await?;
    if access_key.is_empty() {
        return Err("请先配置火山引擎 Access Key（在设置页面）".to_string());
    }

    // 火山引擎 ASR 异步接口只支持公开 URL，需要先将音频上传到可公开访问的存储。
    // 优先使用七牛云；若未配置则返回明确错误提示。
    let public_url = match prepare_douyin_transcription_url(&video_url).await? {
        Some(url) => url,
        None => {
            return Err(
                "转写抖音视频需要配置七牛云存储（火山引擎 ASR 服务无法访问抖音 CDN 链接）。\n\
                 请在设置页面填写七牛云 Access Key / Secret Key / Bucket / 域名后重试。"
                    .to_string(),
            );
        }
    };

    let audio_field = serde_json::json!({ "format": "mp3", "url": public_url });

    let task_id = uuid::Uuid::new_v4().to_string();
    let client = reqwest::Client::new();

    // Step 1: 提交转写任务
    let mut submit_headers = reqwest::header::HeaderMap::new();
    submit_headers.insert("Content-Type", "application/json".parse().unwrap());

    // 判断使用新版还是旧版认证方式
    if let Some(ref app_id_value) = app_id {
        if !app_id_value.is_empty() {
            // 旧版控制台：使用 App ID + Access Key
            submit_headers.insert("X-Api-App-Key", app_id_value.parse().unwrap());
            submit_headers.insert("X-Api-Access-Key", access_key.parse().unwrap());
        } else {
            // 新版控制台：只使用 API Key
            submit_headers.insert("X-Api-Key", access_key.parse().unwrap());
        }
    } else {
        // 新版控制台：只使用 API Key
        submit_headers.insert("X-Api-Key", access_key.parse().unwrap());
    }

    submit_headers.insert("X-Api-Resource-Id", "volc.seedasr.auc".parse().unwrap());
    submit_headers.insert("X-Api-Request-Id", task_id.parse().unwrap());
    submit_headers.insert("X-Api-Sequence", "-1".parse().unwrap());

    let submit_body = serde_json::json!({
        "user": {
            "uid": "ai-remotion-user"
        },
        "audio": audio_field,
        "request": {
            "model_name": "bigmodel",
            "enable_itn": true,
            "enable_punc": true,
            "show_utterances": true
        }
    });

    let submit_response = client
        .post("https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit")
        .headers(submit_headers)
        .json(&submit_body)
        .send()
        .await
        .map_err(|e| format!("提交转写任务失败: {}", e))?;

    let submit_status = submit_response.status();
    if !submit_status.is_success() {
        let error_text = submit_response.text().await.unwrap_or_default();
        return Err(format!("提交转写任务失败 (HTTP {}): {}", submit_status, error_text));
    }

    // Step 2: 轮询查询结果
    let mut attempts = 0;
    let max_attempts = 120; // 最长等待120秒
    let mut result_text = String::new();
    let mut result_duration = 0.0;

    while attempts < max_attempts {
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

        let mut query_headers = reqwest::header::HeaderMap::new();
        query_headers.insert("Content-Type", "application/json".parse().unwrap());
        
        if let Some(ref app_id_value) = app_id {
            if !app_id_value.is_empty() {
                query_headers.insert("X-Api-App-Key", app_id_value.parse().unwrap());
                query_headers.insert("X-Api-Access-Key", access_key.parse().unwrap());
            } else {
                query_headers.insert("X-Api-Key", access_key.parse().unwrap());
            }
        } else {
            query_headers.insert("X-Api-Key", access_key.parse().unwrap());
        }
        
        query_headers.insert("X-Api-Resource-Id", "volc.seedasr.auc".parse().unwrap());
        query_headers.insert("X-Api-Request-Id", task_id.parse().unwrap());

        let query_response = client
            .post("https://openspeech.bytedance.com/api/v3/auc/bigmodel/query")
            .headers(query_headers)
            .json(&serde_json::json!({}))
            .send()
            .await
            .map_err(|e| format!("查询转写任务失败: {}", e))?;

        // 先获取 headers，再解析 body
        let status_code = query_response
            .headers()
            .get("X-Api-Status-Code")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();
        
        let status_message = query_response
            .headers()
            .get("X-Api-Message")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("未知错误")
            .to_string();

        let query_json: Value = query_response
            .json()
            .await
            .map_err(|e| format!("解析查询响应失败: {}", e))?;

        match status_code.as_str() {
            "20000000" => {
                // 成功
                if let Some(result) = query_json.get("result") {
                    result_text = result
                        .get("text")
                        .and_then(|t| t.as_str())
                        .unwrap_or("")
                        .to_string();

                    // 尝试从 utterances 获取时长
                    if let Some(utterances) = result.get("utterances").and_then(|u| u.as_array()) {
                        if let Some(last) = utterances.last() {
                            result_duration = last
                                .get("end_time")
                                .and_then(|e| e.as_f64())
                                .unwrap_or(0.0)
                                / 1000.0;
                        }
                    }

                    // 如果没有 utterances，尝试从 audio_info 获取时长
                    if result_duration == 0.0 {
                        if let Some(audio_info) = query_json.get("audio_info") {
                            result_duration = audio_info
                                .get("duration")
                                .and_then(|d| d.as_f64())
                                .unwrap_or(0.0)
                                / 1000.0;
                        }
                    }
                }
                break;
            }
            "20000001" => {
                // 处理中
                attempts += 1;
            }
            _ => {
                // 其他错误
                return Err(format!("转写任务失败: {} ({})", status_message, status_code));
            }
        }
    }

    if result_text.is_empty() {
        return Err("转写任务超时或结果为空".to_string());
    }

Ok(TranscriptionResult {
        text: result_text,
        duration: result_duration,
    })
}

const REMOTION_PORT: u16 = 32123;
const PACKAGED_WORKSPACE_DIR: &str = "workspace";

#[derive(Debug, Clone)]
struct PackagedRuntime {
    runtime_root: PathBuf,
    sidecar_binary: PathBuf,
    workspace_root: PathBuf,
}

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

fn ensure_directory(path: &Path) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(path)
            .map_err(|e| format!("Failed to create directory {}: {}", path.display(), e))?;
    }

    Ok(())
}

fn packaged_sidecar_filename() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        "cli.exe"
    }

    #[cfg(target_os = "macos")]
    {
        "cli"
    }

    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    {
        "cli"
    }
}

fn find_packaged_sidecar_binary(exe_dir: &Path) -> Option<PathBuf> {
    let direct_path = exe_dir.join(packaged_sidecar_filename());
    if direct_path.exists() {
        return Some(direct_path);
    }

    let entries = fs::read_dir(exe_dir).ok()?;
    for entry in entries {
        let path = entry.ok()?.path();
        let Some(file_name) = path.file_name().and_then(|name| name.to_str()) else {
            continue;
        };
        let normalized = file_name.to_ascii_lowercase();

        #[cfg(target_os = "windows")]
        let matches = normalized.starts_with("cli") && normalized.ends_with(".exe");

        #[cfg(not(target_os = "windows"))]
        let matches = normalized == "cli" || normalized.starts_with("cli-");

        if matches {
            return Some(path);
        }
    }

    None
}

fn detect_packaged_runtime(app: &tauri::AppHandle) -> Option<PackagedRuntime> {
    // `tauri dev` can still have a copied sidecar in `target/debug`, and this
    // repo may already contain `src-tauri/resources/runtime` after packaging.
    // Without this guard, development builds get misclassified as packaged and
    // preview/save/render stop using the repo workspace.
    if cfg!(debug_assertions) {
        return None;
    }

    // Derive runtime_root from the exe directory — this is always reliable.
    // NSIS places resources at {exe_dir}/resources/runtime/
    // (Tauri resource_dir() may return exe_dir itself or exe_dir/resources,
    //  so we try both and use whichever actually exists.)
    let exe_dir = std::env::current_exe()
        .ok()?
        .parent()
        .map(Path::to_path_buf)?;

    let sidecar_binary = find_packaged_sidecar_binary(&exe_dir)?;

    let cli_check = |root: &PathBuf| {
        root.join("app").join("src").join("cli").join("index.js").exists()
            && root.join("remotion-bundle").exists()
    };

    let runtime_root = [
        exe_dir.join("resources").join("runtime"), // NSIS default
        exe_dir.join("runtime"),                   // fallback / other layouts
        app.path().resource_dir().ok()?.join("runtime"),
    ]
    .into_iter()
    .find(cli_check)?;

    let workspace_root = app
        .path()
        .app_data_dir()
        .ok()?
        .join(PACKAGED_WORKSPACE_DIR);

    Some(PackagedRuntime {
        runtime_root,
        sidecar_binary,
        workspace_root,
    })
}

fn get_storage_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if let Some(runtime) = detect_packaged_runtime(app) {
        ensure_directory(&runtime.workspace_root)?;
        ensure_directory(&runtime.workspace_root.join("public"))?;
        ensure_directory(&runtime.workspace_root.join("public").join("projects"))?;
        ensure_directory(&runtime.workspace_root.join("out"))?;
        return Ok(runtime.workspace_root);
    }

    get_project_dir()
}

fn run_cli_command(
    app: &tauri::AppHandle,
    working_dir: &Path,
    args: &[String],
    extra_envs: &[(String, String)],
) -> Result<std::process::Output, String> {
    if let Some(runtime) = detect_packaged_runtime(app) {
        let cli_script = runtime
            .runtime_root
            .join("app")
            .join("src")
            .join("cli")
            .join("index.js");

        let mut command = Command::new(&runtime.sidecar_binary);
        command.arg(&cli_script);
        command.current_dir(&runtime.runtime_root);
        command.env(
            "REMOTION_BUNDLE_DIR",
            runtime.runtime_root.join("remotion-bundle"),
        );
        command.env("REMOTION_FORCE_FILE_URLS", "1");
        command.env("NODE_ENV", "production");

        let ffmpeg_binary = runtime.runtime_root.join("ffmpeg").join(if cfg!(target_os = "windows") {
            "ffmpeg.exe"
        } else {
            "ffmpeg"
        });
        if ffmpeg_binary.exists() {
            command.env("FFMPEG_PATH", ffmpeg_binary);
        }

        let ffprobe_binary = runtime.runtime_root.join("ffmpeg").join(if cfg!(target_os = "windows") {
            "ffprobe.exe"
        } else {
            "ffprobe"
        });
        if ffprobe_binary.exists() {
            command.env("FFPROBE_PATH", ffprobe_binary);
        }

        for (key, value) in extra_envs {
            command.env(key, value);
        }

        for arg in args {
            command.arg(arg);
        }

        #[cfg(target_os = "windows")]
        {
            command.creation_flags(0x08000000);
        }

        return command
            .output()
            .map_err(|e| format!("Failed to run packaged runtime command: {}", e));
    }

    if !cfg!(debug_assertions) {
        return Err(
            "Packaged runtime is missing or incomplete. The app could not find its built-in CLI/Node runtime. Please reinstall the app.".to_string(),
        );
    }

    #[cfg(target_os = "windows")]
    let mut command = {
        let mut command = Command::new("cmd");
        command.args(["/C", "npx", "tsx", "src/cli/index.ts"]);
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
        command
    };

    #[cfg(not(target_os = "windows"))]
    let mut command = {
        let mut command = Command::new("npx");
        command.args(["tsx", "src/cli/index.ts"]);
        command
    };

    for (key, value) in extra_envs {
        command.env(key, value);
    }

    for arg in args {
        command.arg(arg);
    }

    command
        .current_dir(working_dir)
        .output()
        .map_err(|e| format!("Failed to run development runtime command: {}", e))
}

fn looks_like_repo_root(path: &Path) -> bool {
    path.join("package.json").exists() && path.join("src-tauri").exists()
}

fn find_repo_root_from(start: &Path) -> Option<PathBuf> {
    for candidate in start.ancestors() {
        if looks_like_repo_root(candidate) {
            return Some(candidate.to_path_buf());
        }
    }
    None
}

fn get_project_dir() -> Result<std::path::PathBuf, String> {
    if let Ok(current_dir) = std::env::current_dir() {
        if let Some(root) = find_repo_root_from(&current_dir) {
            return Ok(root);
        }
    }

    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(exe_dir) = current_exe.parent() {
            if let Some(root) = find_repo_root_from(exe_dir) {
                return Ok(root);
            }
        }
    }

    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    if let Some(root) = manifest_dir.parent() {
        if looks_like_repo_root(root) {
            return Ok(root.to_path_buf());
        }
    }

    Err("Failed to resolve project root".to_string())
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
    reference_images: Option<Vec<AiReferenceImage>>,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
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
    let content_payload = if let Some(images) = reference_images.as_ref() {
        let mut items = vec![serde_json::json!({
            "type": "text",
            "text": prompt
        })];

        for image in images.iter().take(5) {
            if image.data_url.trim().is_empty() {
                continue;
            }

            items.push(serde_json::json!({
                "type": "image_url",
                "image_url": {
                    "url": image.data_url
                }
            }));
        }

        if items.len() > 1 {
            serde_json::Value::Array(items)
        } else {
            serde_json::Value::String(prompt.clone())
        }
    } else {
        serde_json::Value::String(prompt.clone())
    };

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
                    "content": content_payload
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

    let content_value = &json["choices"][0]["message"]["content"];
    let content = if let Some(text) = content_value.as_str() {
        text.to_string()
    } else if let Some(items) = content_value.as_array() {
        items
            .iter()
            .filter_map(|item| {
                item.get("text")
                    .and_then(|value| value.as_str())
                    .map(|value| value.to_string())
            })
            .collect::<Vec<String>>()
            .join("\n")
    } else {
        return Err(format!("Unexpected AI response: {}", json));
    };

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
    app: tauri::AppHandle,
    template: String,
    voice_id: String,
    raw_text: String,
    slides: Vec<Value>,
    content_path: String,
    generation_mode: Option<String>,
    director_style: Option<Value>,
    soundtrack_path: Option<String>,
    soundtrack_duration: Option<f64>,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    let project_dir = get_storage_root(&app)?;
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
            generation_mode: generation_mode.or_else(|| {
                existing_meta
                    .as_ref()
                    .and_then(|meta| meta.generation_mode.clone())
            }),
            director_style: director_style.or_else(|| {
                existing_meta
                    .as_ref()
                    .and_then(|meta| meta.director_style.clone())
            }),
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
async fn check_remotion_running(state: tauri::State<'_, AuthState>) -> Result<bool, String> {
    let _session = require_valid_license(&state).await?;
    Ok(find_remotion_port().await?.is_some())
}

#[tauri::command(rename_all = "camelCase")]
async fn start_remotion(
    app: tauri::AppHandle,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    if detect_packaged_runtime(&app).is_some() {
        return Err(
            "Packaged build does not ship Remotion Studio. Use the built-in preview instead."
                .to_string(),
        );
    }
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
async fn ensure_remotion_running(
    app: tauri::AppHandle,
    state: tauri::State<'_, AuthState>,
) -> Result<RemotionStartupResult, String> {
    let _session = require_valid_license(&state).await?;
    if detect_packaged_runtime(&app).is_some() {
        return Err(
            "Packaged build does not ship Remotion Studio. Use the built-in preview instead."
                .to_string(),
        );
    }
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
    app: tauri::AppHandle,
    voice_id: String,
    access_key: String,
    app_id: String,
    resource_id: String,
    speech_rate: Option<f64>,
    content_path: String,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    let project_dir = get_storage_root(&app)?;
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

    let content_arg = if detect_packaged_runtime(&app).is_some() {
        content_file.to_string_lossy().to_string()
    } else {
        repo_relative_path(&project_dir, &content_file)?
    };
    let audio_dir_arg = if detect_packaged_runtime(&app).is_some() {
        audio_file
            .parent()
            .map(|path| path.to_string_lossy().to_string())
            .unwrap_or_else(|| project_dir.join("public").join("audio").to_string_lossy().to_string())
    } else {
        audio_file
            .parent()
            .map(|path| repo_relative_path(&project_dir, path))
            .transpose()?
            .unwrap_or_else(|| "public/audio".to_string())
    };

    let mut args = vec![
        "audio".to_string(),
        content_arg,
        "-v".to_string(),
        voice_id.clone(),
        "-o".to_string(),
        audio_dir_arg,
        "-k".to_string(),
        access_key.clone(),
        "--app-id".to_string(),
        app_id.clone(),
        "--resource-id".to_string(),
        resource_id.clone(),
    ];

    if let Some(rate) = speech_rate {
        args.push("--speech-rate".to_string());
        args.push(rate.to_string());
    }

    let output = run_cli_command(&app, &project_dir, &args, &[])?;

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
    app: tauri::AppHandle,
    raw_text: String,
    voice_id: String,
    access_key: String,
    app_id: String,
    resource_id: String,
    speech_rate: Option<f64>,
    content_path: String,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    if raw_text.trim().is_empty() {
        return Err("Narration text is empty.".to_string());
    }

    let project_dir = get_storage_root(&app)?;
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

    let text_arg = if detect_packaged_runtime(&app).is_some() {
        text_file.to_string_lossy().to_string()
    } else {
        repo_relative_path(&project_dir, &text_file)?
    };
    let audio_arg = if detect_packaged_runtime(&app).is_some() {
        audio_file.to_string_lossy().to_string()
    } else {
        audio_repo_relative
    };

    let mut args = vec![
        "narrate".to_string(),
        text_arg,
        "-v".to_string(),
        voice_id.clone(),
        "-o".to_string(),
        audio_arg,
        "-k".to_string(),
        access_key.clone(),
        "--app-id".to_string(),
        app_id.clone(),
        "--resource-id".to_string(),
        resource_id.clone(),
    ];

    if let Some(rate) = speech_rate {
        args.push("--speech-rate".to_string());
        args.push(rate.to_string());
    }

    let output = run_cli_command(&app, &project_dir, &args, &[])?;

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
    app: tauri::AppHandle,
    raw_text: String,
    voice_id: String,
    access_key: String,
    app_id: String,
    resource_id: String,
    speech_rate: Option<f64>,
    content_path: String,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    if raw_text.trim().is_empty() {
        return Err("Narration text is empty.".to_string());
    }

    let project_dir = get_storage_root(&app)?;
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

    let text_arg = if detect_packaged_runtime(&app).is_some() {
        text_file.to_string_lossy().to_string()
    } else {
        repo_relative_path(&project_dir, &text_file)?
    };
    let audio_dir_arg = if detect_packaged_runtime(&app).is_some() {
        audio_dir.to_string_lossy().to_string()
    } else {
        repo_relative_path(&project_dir, &audio_dir)?
    };

    let mut args = vec![
        "narrate-timeline".to_string(),
        text_arg,
        "-v".to_string(),
        voice_id.clone(),
        "-o".to_string(),
        audio_dir_arg,
        "-k".to_string(),
        access_key.clone(),
        "--app-id".to_string(),
        app_id.clone(),
        "--resource-id".to_string(),
        resource_id.clone(),
    ];

    if let Some(rate) = speech_rate {
        args.push("--speech-rate".to_string());
        args.push(rate.to_string());
    }

    let output = run_cli_command(&app, &project_dir, &args, &[])?;

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
async fn sync_timeline(
    app: tauri::AppHandle,
    voice_id: String,
    content_path: String,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    let project_dir = get_storage_root(&app)?;
    let (content_file, _, soundtrack_file, soundtrack_repo_relative, soundtrack_static_path) =
        derive_project_paths(&project_dir, &content_path)?;

    if !content_file.exists() {
        return Err("Content JSON does not exist. Generate slides first.".to_string());
    }

    if !soundtrack_file.exists() {
        return Err("narration.mp3 does not exist. Generate narration first.".to_string());
    }

    let content_arg = if detect_packaged_runtime(&app).is_some() {
        content_file.to_string_lossy().to_string()
    } else {
        repo_relative_path(&project_dir, &content_file)?
    };
    let soundtrack_arg = if detect_packaged_runtime(&app).is_some() {
        soundtrack_file.to_string_lossy().to_string()
    } else {
        soundtrack_repo_relative
    };
    let soundtrack_path_arg = if detect_packaged_runtime(&app).is_some() {
        soundtrack_file.to_string_lossy().to_string()
    } else {
        soundtrack_static_path
    };

    let args = vec![
        "timeline".to_string(),
        content_arg,
        "-s".to_string(),
        soundtrack_arg,
        "-p".to_string(),
        soundtrack_path_arg,
        "-v".to_string(),
        voice_id.clone(),
    ];

    let output = run_cli_command(&app, &project_dir, &args, &[])?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(format!("Timeline sync failed:\n{}\n{}", stdout, stderr))
    }
}

#[tauri::command(rename_all = "camelCase")]
async fn load_preview_project(
    app: tauri::AppHandle,
    content_path: String,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    let project_dir = get_storage_root(&app)?;
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
        generation_mode: data.meta.generation_mode,
        director_style: data.meta.director_style,
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
async fn render_video(
    app: tauri::AppHandle,
    template: String,
    content_path: String,
    output_dir: Option<String>,
    state: tauri::State<'_, AuthState>,
) -> Result<String, String> {
    let _session = require_valid_license(&state).await?;
    let project_dir = get_storage_root(&app)?;
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");

    // Resolve output directory: use provided path, or default to Desktop/outs
    let out_dir = if let Some(dir) = output_dir.filter(|d| !d.trim().is_empty()) {
        std::path::PathBuf::from(dir)
    } else {
        // Default: ~/Desktop/outs
        dirs::desktop_dir()
            .unwrap_or_else(|| project_dir.join("out"))
            .join("outs")
    };

    let output_file = out_dir
        .join(format!("video_{}.mp4", timestamp))
        .to_string_lossy()
        .to_string();

    if !out_dir.exists() {
        fs::create_dir_all(&out_dir)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    let content_arg = if detect_packaged_runtime(&app).is_some() {
        resolve_project_path(&project_dir, &content_path)
            .to_string_lossy()
            .to_string()
    } else {
        normalize_repo_relative_path(&content_path)
    };

    let args = vec![
        "render".to_string(),
        content_arg,
        "-t".to_string(),
        template.clone(),
        "-o".to_string(),
        output_file.clone(),
    ];

    let output = run_cli_command(&app, &project_dir, &args, &[])?;

    if output.status.success() {
        Ok(output_file)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        // Include stdout so diagnostic logs (BrowserTest, etc.) are visible in the error popup
        if stdout.trim().is_empty() {
            Err(stderr)
        } else {
            Err(format!("[stdout]\n{}\n[stderr]\n{}", stdout.trim(), stderr.trim()))
        }
    }
}

#[tauri::command]
fn resize_window(
    app: tauri::AppHandle,
    width: f64,
    height: f64,
    min_width: f64,
    min_height: f64,
) -> Result<(), String> {
    use tauri::Manager;
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Window 'main' not found".to_string())?;
    // 先把最小尺寸设为 1×1，确保缩小时不被拦截
    window
        .set_min_size(Some(tauri::LogicalSize::new(1.0_f64, 1.0_f64)))
        .map_err(|e| e.to_string())?;
    // 设置目标尺寸
    window
        .set_size(tauri::LogicalSize::new(width, height))
        .map_err(|e| e.to_string())?;
    // 恢复正确的最小尺寸约束
    window
        .set_min_size(Some(tauri::LogicalSize::new(min_width, min_height)))
        .map_err(|e| e.to_string())?;
    window.center().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    load_runtime_env();
    tauri::Builder::default()
        .manage(AuthState::default())
        .invoke_handler(tauri::generate_handler![
            auth_get_context,
            auth_get_app_info,
            auth_register,
            auth_login,
            auth_restore_session,
            auth_get_status,
            auth_trial,
            auth_recharge,
            auth_heartbeat,
            auth_logout,
            open_external_url,
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
            resize_window,
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
