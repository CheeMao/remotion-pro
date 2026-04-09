fn main() {
    // Embed Qiniu credentials from .env at compile time so the packaged app
    // doesn't need external env vars.
    embed_env_vars();
    tauri_build::build()
}

fn embed_env_vars() {
    let env_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join(".env");

    if !env_path.exists() {
        return;
    }

    let content = std::fs::read_to_string(&env_path).unwrap_or_default();
    for line in content.lines() {
        let line = line.trim();
        // Skip comments and empty lines
        if line.starts_with('#') || line.is_empty() {
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim();
            // Only embed keys we explicitly want compiled in
            if matches!(
                key,
                "QINIU_ACCESS_KEY"
                    | "QINIU_SECRET_KEY"
                    | "QINIU_BUCKET"
                    | "QINIU_DOMAIN"
                    | "QINIU_UPLOAD_URL"
            ) {
                println!("cargo:rustc-env=COMPILED_{key}={value}");
            }
        }
    }

    // Re-run if .env changes
    println!(
        "cargo:rerun-if-changed={}",
        env_path.display()
    );
}
