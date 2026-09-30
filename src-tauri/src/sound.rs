// 倒计时归零提示音（需求 §19.1：播放一次）
// 不引入解码库：运行时生成"叮–咚"WAV 写入临时目录，用系统媒体引擎播放。

const SAMPLE_RATE: u32 = 44100;

fn gen_wav_bytes() -> Vec<u8> {
    // 两个短音：880Hz 0.35s + 660Hz 0.5s，指数衰减，16bit 单声道
    let mut samples: Vec<i16> = Vec::new();
    let tone = |freq: f32, dur: f32| -> Vec<i16> {
        let n = (SAMPLE_RATE as f32 * dur) as usize;
        (0..n)
            .map(|i| {
                let t = i as f32 / SAMPLE_RATE as f32;
                let env = (-(t * 4.0).exp()).min(1.0);
                let v = (2.0 * std::f32::consts::PI * freq * t).sin() * env * 0.5;
                (v * 32767.0) as i16
            })
            .collect()
    };
    samples.extend(tone(880.0, 0.35));
    samples.extend(tone(660.0, 0.5));

    let data_len = (samples.len() * 2) as u32;
    let mut w: Vec<u8> = Vec::new();
    let u32le = |v: u32| v.to_le_bytes().to_vec();
    let u16le = |v: u16| v.to_le_bytes().to_vec();
    w.extend(b"RIFF");
    w.extend(u32le(36 + data_len));
    w.extend(b"WAVEfmt ");
    w.extend(u32le(16));
    w.extend(u16le(1)); // PCM
    w.extend(u16le(1)); // mono
    w.extend(u32le(SAMPLE_RATE));
    w.extend(u32le(SAMPLE_RATE * 2));
    w.extend(u16le(2));
    w.extend(u16le(16));
    w.extend(b"data");
    w.extend(u32le(data_len));
    for s in samples {
        w.extend(u16le(s as u16));
    }
    w
}

// 不在 Rust 侧引入解码/播放依赖：生成 WAV 后交给系统播放器
// （Windows: SoundPlayer；macOS: afplay），失败仅记日志（§31）
#[cfg(windows)]
pub fn play_chime(dir: &std::path::Path) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    let path = dir.join("homenap-chime.wav");
    std::fs::write(&path, gen_wav_bytes()).map_err(|e| e.to_string())?;
    let ps = format!(
        "Add-Type -AssemblyName System.Windows.Forms; (New-Object System.Media.SoundPlayer '{}').Play()",
        path.to_string_lossy().replace('\'', "''")
    );
    std::thread::spawn(move || {
        let mut cmd = std::process::Command::new("powershell");
        cmd.args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps]);
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW：不弹控制台
        let _ = cmd.spawn();
    });
    Ok(())
}

#[cfg(not(windows))]
pub fn play_chime(dir: &std::path::Path) -> Result<(), String> {
    let path = dir.join("homenap-chime.wav");
    std::fs::write(&path, gen_wav_bytes()).map_err(|e| e.to_string())?;
    std::thread::spawn(move || {
        let _ = std::process::Command::new("afplay").arg(&path).spawn();
    });
    Ok(())
}
