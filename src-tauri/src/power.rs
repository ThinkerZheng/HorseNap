// 防止系统因空闲睡眠 / 关屏（需求 §17）
// Windows: SetThreadExecutionState；其他平台目前为 stub（M0 在各自平台验证）

#[cfg(windows)]
mod imp {
    use windows::Win32::System::Power::{
        SetThreadExecutionState, ES_CONTINUOUS, ES_DISPLAY_REQUIRED,
    };

    pub fn set_keep_awake(on: bool) -> Result<(), String> {
        let flags = if on {
            ES_CONTINUOUS | ES_DISPLAY_REQUIRED
        } else {
            ES_CONTINUOUS
        };
        // 成功返回上一次状态，失败返回 0（EXECUTION_STATE(0)）
        let ret = unsafe { SetThreadExecutionState(flags) };
        if ret.0 == 0 {
            Err("SetThreadExecutionState failed".to_string())
        } else {
            Ok(())
        }
    }
}

#[cfg(not(windows))]
mod imp {
    // macOS: IOPMAssertion；Linux: inhibitor。按需求 §31，v0.1 先确保 Windows 完整，
    // 其他平台请求失败仅记录日志并继续展示（§31）。
    pub fn set_keep_awake(_on: bool) -> Result<(), String> {
        Err("keep-awake not implemented on this platform yet".to_string())
    }
}

pub fn set_keep_awake(on: bool) -> Result<(), String> {
    imp::set_keep_awake(on)
}
