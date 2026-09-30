// HorseNap —— Tauri 2 应用入口
// 组装后端能力：配置读写、电源保持、提示音、图片导入/清理、系统托盘、单实例。

mod config;
mod image;
mod power;
mod sound;
mod tray;

use std::sync::Mutex;
use tauri::{Manager, WindowEvent};

use tray::{Labels, TrayState};

/// 前端调用：防止展示期间系统睡眠 / 关屏（需求 §17）
#[tauri::command]
fn set_keep_awake(on: bool) -> Result<(), String> {
    power::set_keep_awake(on)
}

/// 前端调用：倒计时归零播放一次提示音（需求 §19.1）
#[tauri::command]
fn play_chime() -> Result<(), String> {
    sound::play_chime(&std::env::temp_dir())
}

/// 前端调用：用系统默认浏览器打开外链（§26 关于页；WebView 内 target=_blank 无效）
#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("only http/https allowed".into());
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let mut c = std::process::Command::new("cmd");
        c.args(["/C", "start", "", &url]);
        c.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
        c.spawn().map(|_| ()).map_err(|e| e.to_string())
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map(|_| ())
            .map_err(|e| e.to_string())
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map(|_| ())
            .map_err(|e| e.to_string())
    }
}

fn main() {
    let mut builder = tauri::Builder::default();

    // 单实例：二次启动时聚焦已有实例（需求 §20）
    builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
        if let Some(w) = app.get_webview_window("main") {
            let _ = w.unminimize();
            let _ = w.show();
            let _ = w.set_focus();
        }
    }));

    // 文件选择对话框（§13 / §23）
    builder = builder.plugin(tauri_plugin_dialog::init());

    builder
        .invoke_handler(tauri::generate_handler![
            config::load_config,
            config::save_config,
            image::import_image,
            image::cleanup_images,
            tray::set_tray_labels,
            set_keep_awake,
            play_chime,
            open_url,
        ])
        .setup(|app| {
            // 托盘状态：文案由前端按语言下发
            app.manage(TrayState {
                labels: Mutex::new(Labels::default()),
            });
            tray::build_tray(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // 主窗口点击关闭 → 隐藏到托盘而非退出（需求 §19.2）
            if window.label() == "main" {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running HorseNap");
}
