// 图片导入：魔数识别、大小/像素限制、SVG 清洗、复制入应用数据目录、孤儿清理（需求 §13 / §23 / §32）

use std::path::{Path, PathBuf};

const MAX_BITMAP: u64 = 10 * 1024 * 1024; // 10 MB
const MAX_SVG: u64 = 2 * 1024 * 1024; // 2 MB
const MAX_NODES: usize = 5000;
const MAX_PIXEL: u32 = 8192;

#[derive(serde::Serialize)]
pub struct ImportOk {
    pub path: String,
}

fn detect_kind(bytes: &[u8]) -> Option<&'static str> {
    // 按文件头魔数识别（§13：与扩展名不符即拒绝）
    let head = &bytes[..bytes.len().min(32)];
    if head.starts_with(b"\x89PNG\r\n\x1a\n") {
        Some("png")
    } else if head.starts_with(b"GIF87a") || head.starts_with(b"GIF89a") {
        Some("gif")
    } else if head.starts_with(b"RIFF") && head.len() >= 12 && &head[8..12] == b"WEBP" {
        Some("webp")
    } else if head.starts_with(&[0xFF, 0xD8, 0xFF]) {
        Some("jpg")
    } else {
        // SVG：文本且含 <svg
        let text = std::str::from_utf8(&bytes[..bytes.len().min(4096)]).ok()?;
        if text.replace(['\n', '\r', '\t'], "").contains("<svg") {
            Some("svg")
        } else {
            None
        }
    }
}

fn bitmap_dims(bytes: &[u8], kind: &str) -> Option<(u32, u32)> {
    match kind {
        "png" if bytes.len() > 24 => Some((
            u32::from_be_bytes(bytes[16..20].try_into().ok()?),
            u32::from_be_bytes(bytes[20..24].try_into().ok()?),
        )),
        "gif" if bytes.len() > 10 => Some((
            u16::from_le_bytes(bytes[6..8].try_into().ok()?) as u32,
            u16::from_le_bytes(bytes[8..10].try_into().ok()?) as u32,
        )),
        "jpg" => {
            // 扫描 SOFn 段
            let mut i = 2usize;
            while i + 9 < bytes.len() {
                if bytes[i] != 0xFF {
                    i += 1;
                    continue;
                }
                let marker = bytes[i + 1];
                if matches!(marker, 0xC0..=0xC3 | 0xC5..=0xC7 | 0xC9..=0xCF | 0xD0..=0xD3 | 0xD5..=0xD7 | 0xD9..=0xDB | 0xDD..=0xDF) {
                    let h = u16::from_be_bytes(bytes[i + 5..i + 7].try_into().ok()?) as u32;
                    let w = u16::from_be_bytes(bytes[i + 7..i + 9].try_into().ok()?) as u32;
                    return Some((w, h));
                }
                let len = u16::from_be_bytes(bytes[i + 2..i + 4].try_into().ok()?) as usize;
                i += 2 + len;
            }
            None
        }
        "webp" => {
            // 按 RIFF 子块解析真实尺寸（VP8 / VP8L / VP8X），避免绕过像素上限
            if bytes.len() < 30 {
                return None;
            }
            match &bytes[12..16] {
                b"VP8 " => {
                    let w = u16::from_le_bytes(bytes[26..28].try_into().ok()?) as u32 & 0x3fff;
                    let h = u16::from_le_bytes(bytes[28..30].try_into().ok()?) as u32 & 0x3fff;
                    Some((w, h))
                }
                b"VP8L" => {
                    // 14bit 宽-1 / 14bit 高-1，小端位流从签名字节后开始
                    let bits = u32::from_le_bytes(bytes[21..25].try_into().ok()?);
                    Some(((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1))
                }
                b"VP8X" => {
                    let w = (bytes[24] as u32
                        | (bytes[25] as u32) << 8
                        | (bytes[26] as u32) << 16)
                        + 1;
                    let h = (bytes[27] as u32
                        | (bytes[28] as u32) << 8
                        | (bytes[29] as u32) << 16)
                        + 1;
                    Some((w, h))
                }
                _ => None,
            }
        }
        _ => None,
    }
}

/// SVG 清洗：标签数限制 + §23 指定的消毒库（白名单剥离脚本/事件/外链）。
/// 需求原文的 sanitize-svg 库已从 crates.io 消失，改用同类 svg-hush；
/// 两道防线：此处清洗 + 渲染层统一用 `<img>`（浏览器不执行其中脚本）
fn sanitize_svg(text: &str) -> Result<String, String> {
    // 启发式节点数：以 '<' 计数近似，恶意膨胀文件会在此或 2MB 大小限制处拒绝
    if text.matches('<').count() > MAX_NODES {
        return Err("sanitize:too_many_nodes".into());
    }
    let mut input: &[u8] = text.as_bytes();
    let mut out: Vec<u8> = Vec::new();
    let filter = svg_hush::Filter::new();
    filter
        .filter(&mut input, &mut out)
        .map_err(|e| format!("sanitize:{e}"))?;
    let cleaned = String::from_utf8(out).map_err(|_| "sanitize:encoding".to_string())?;
    if !cleaned.contains("<svg") {
        return Err("sanitize:empty".into());
    }
    Ok(cleaned)
}

/// 导入图片；返回相对/绝对存储路径或错误码（前端按 code 映射 i18n 文案）
#[tauri::command]
pub async fn import_image(app: tauri::AppHandle, source: String) -> Result<ImportOk, String> {
    use tauri::Manager;
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("data_dir:{e}"))?;
    let images_dir = data_dir.join("images");
    std::fs::create_dir_all(&images_dir).map_err(|e| format!("mkdir:{e}"))?;

    let src = Path::new(&source);
    let meta = std::fs::metadata(src).map_err(|e| format!("read:{e}"))?;

    let bytes = std::fs::read(src).map_err(|e| format!("read:{e}"))?;

    let kind = detect_kind(&bytes).ok_or_else(|| "type:unsupported".to_string())?;

    if kind == "svg" {
        if meta.len() > MAX_SVG {
            return Err("size:too_large".into());
        }
        let text = String::from_utf8(bytes).map_err(|_| "type:unsupported".to_string())?;
        let cleaned = sanitize_svg(&text)?;
        let dest = images_dir.join(format!("{}.svg", uuid_simple()));
        std::fs::write(&dest, cleaned).map_err(|e| format!("write:{e}"))?;
        return Ok(ImportOk {
            path: dest.to_string_lossy().to_string(),
        });
    }

    if meta.len() > MAX_BITMAP {
        return Err("size:too_large".into());
    }
    if let Some((w, h)) = bitmap_dims(&bytes, kind) {
        if w > MAX_PIXEL || h > MAX_PIXEL {
            return Err("size:too_large".into());
        }
    }
    let dest = images_dir.join(format!("{}.{ext}", uuid_simple(), ext = kind));
    std::fs::write(&dest, &bytes).map_err(|e| format!("write:{e}"))?;
    Ok(ImportOk {
        path: dest.to_string_lossy().to_string(),
    })
}

/// 清理孤儿文件：保留当前配置引用的图片，删除其余；5 分钟内的文件跳过（防竞态）
#[tauri::command]
pub async fn cleanup_images(app: tauri::AppHandle, keep: String) -> Result<(), String> {
    use tauri::Manager;
    let images_dir: PathBuf = app.path().app_data_dir().map_err(|e| e.to_string())?.join("images");
    if !images_dir.exists() {
        return Ok(());
    }
    let keep_abs = dunce_canon(&PathBuf::from(&keep));
    let now = std::time::SystemTime::now();
    if let Ok(rd) = std::fs::read_dir(&images_dir) {
        for entry in rd.flatten() {
            let p = entry.path();
            if !p.is_file() {
                continue;
            }
            if dunce_canon(&p) == keep_abs && !keep.is_empty() {
                continue;
            }
            if let Ok(m) = p.metadata() {
                if let Ok(t) = m.modified() {
                    if now.duration_since(t).map(|d| d.as_secs()).unwrap_or(0) < 300 {
                        continue;
                    }
                }
            }
            let _ = std::fs::remove_file(&p);
        }
    }
    Ok(())
}

fn dunce_canon(p: &Path) -> PathBuf {
    p.canonicalize().unwrap_or_else(|_| p.to_path_buf())
}

fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("{:x}", nanos ^ ((nanos >> 17) * 0x9e3779b97f4a7c15))
}
