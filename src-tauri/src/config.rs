// 配置持久化（需求 §22）：原子写入 / 损坏备份回退

use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

#[tauri::command]
pub fn load_config(app: AppHandle) -> Result<Option<String>, String> {
    let path = config_path(&app)?;
    match std::fs::read_to_string(&path) {
        Ok(raw) => {
            // 解析校验：非法 JSON 视为损坏 → 备份并回退默认（§22）
            if serde_json::from_str::<serde_json::Value>(&raw).is_err() {
                let bak = with_ext(&path, "bak");
                let _ = std::fs::rename(&path, &bak);
                return Ok(None);
            }
            Ok(Some(raw))
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => {
            // 读取失败（非缺失）：也走备份回退
            let bak = with_ext(&path, "bak");
            let _ = std::fs::rename(&path, &bak);
            Err(format!("read:{e}"))
        }
    }
}

#[tauri::command]
pub fn save_config(app: AppHandle, config: String) -> Result<(), String> {
    // 先验证是合法 JSON，避免把损坏数据写盘
    serde_json::from_str::<serde_json::Value>(&config).map_err(|e| e.to_string())?;
    let path = config_path(&app)?;
    let tmp = with_ext(&path, "tmp");
    std::fs::write(&tmp, &config).map_err(|e| e.to_string())?;
    // rename 在 Windows 上为 MoveFileEx(REPLACE_EXISTING)，在 Unix 上为原子 rename
    std::fs::rename(&tmp, &path).map_err(|e| e.to_string())?;
    Ok(())
}

fn with_ext(p: &PathBuf, ext: &str) -> PathBuf {
    let mut file = p.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
    if let Some(stem) = file.rfind('.') {
        file.truncate(stem);
    } else {
        file.push_str("config");
    }
    p.with_file_name(format!("{file}.{ext}"))
}
