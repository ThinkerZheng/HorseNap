// 系统托盘（需求 §19.2）
// Windows/Linux：左键显示/隐藏主窗口，右键菜单；macOS：单击弹菜单。
// 菜单文案由前端按当前语言下发（set_tray_labels）。

use std::sync::Mutex;
use tauri::menu::{Menu, MenuBuilder, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager};

pub const ID_TOGGLE: &str = "toggle";
pub const ID_START: &str = "start";
pub const ID_STOP_DISPLAY: &str = "stop-display";
pub const ID_STOP_TIMER: &str = "stop-timer";
pub const ID_QUIT: &str = "quit";

#[derive(Default)]
pub struct Labels {
    pub toggle: String,
    pub start: String,
    pub stop_display: String,
    pub stop_timer: String,
    pub quit: String,
}

pub struct TrayState {
    pub labels: Mutex<Labels>,
}

pub fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let menu = build_menu(app, &app.state::<TrayState>().labels.lock().unwrap())?;

    let icon = tauri::include_image!("icons/icon.png");
    let _ = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .show_menu_on_left_click(cfg!(target_os = "macos"))
        .icon(icon)
        .tooltip("HorseNap")
        .on_menu_event(|app, event| match event.id().as_ref() {
            ID_TOGGLE => toggle_main_window(app),
            ID_START => {
                let _ = app.emit_to("main", "tray-start", ());
            }
            ID_STOP_DISPLAY => {
                let _ = app.emit_to("main", "tray-stop-display", ());
            }
            ID_STOP_TIMER => {
                let _ = app.emit_to("main", "tray-stop-timer", ());
            }
            ID_QUIT => {
                crate::power::set_keep_awake(false).ok();
                for (label, w) in app.webview_windows() {
                    if label.starts_with("display-") || label == "main" {
                        let _ = w.close();
                    }
                }
                app.remove_tray_by_id("main-tray");
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            #[cfg(not(target_os = "macos"))]
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                toggle_main_window(&tray.app_handle());
            }
            #[cfg(target_os = "macos")]
            let _ = event;
        })
        .build(app)?;
    Ok(())
}

fn build_menu(app: &AppHandle, labels: &Labels) -> tauri::Result<Menu<tauri::Wry>> {
    let default = |s: &String, d: &str| if s.is_empty() { d.to_string() } else { s.clone() };
    let m = MenuBuilder::new(app)
        .item(&MenuItem::with_id(
            app,
            ID_TOGGLE,
            default(&labels.toggle, "Show / Hide"),
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            ID_START,
            default(&labels.start, "Start display"),
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            ID_STOP_DISPLAY,
            default(&labels.stop_display, "Stop display"),
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            ID_STOP_TIMER,
            default(&labels.stop_timer, "Stop timer"),
            true,
            None::<&str>,
        )?)
        .separator()
        // 自定义 Quit（非 PredefinedMenuItem）：使 ID_QUIT 分支的清理逻辑可达
        .item(&MenuItem::with_id(
            app,
            ID_QUIT,
            default(&labels.quit, "Quit"),
            true,
            None::<&str>,
        )?)
        .build()?;
    Ok(m)
}

#[tauri::command]
pub fn set_tray_labels(
    app: AppHandle,
    toggle: String,
    start: String,
    stop_display: String,
    stop_timer: String,
    quit: String,
) -> Result<(), String> {
    {
        let state = app.state::<TrayState>();
        let mut l = state.labels.lock().unwrap();
        l.toggle = toggle;
        l.start = start;
        l.stop_display = stop_display;
        l.stop_timer = stop_timer;
        l.quit = quit;
    }
    let labels = app.state::<TrayState>().labels.lock().unwrap().clone_labels();
    // 重建菜单并下发（TrayIcon 无取回当前菜单的 getter）
    if let Some(tray) = app.tray_by_id("main-tray") {
        if let Ok(menu) = build_menu(&app, &labels) {
            let _ = tray.set_menu(Some(menu));
        }
    }
    Ok(())
}

impl Labels {
    fn clone_labels(&self) -> Labels {
        Labels {
            toggle: self.toggle.clone(),
            start: self.start.clone(),
            stop_display: self.stop_display.clone(),
            stop_timer: self.stop_timer.clone(),
            quit: self.quit.clone(),
        }
    }
}

fn toggle_main_window(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        if w.is_visible().unwrap_or(false) {
            let _ = w.hide();
        } else {
            let _ = w.show();
            let _ = w.set_focus();
        }
    }
}
