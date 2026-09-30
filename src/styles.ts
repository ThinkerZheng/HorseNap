// 全局样式：以运行时注入替代独立 .css 资源，深色主题、安静低刺激（§15 视觉基调）
const CSS = `
:root {
  --bg: #0d1526;
  --bg-soft: #16203a;
  --panel: #1b2942;
  --border: #2a3a5a;
  --text: #e8eefc;
  --text-dim: #9fb0d0;
  --accent: #6ea8fe;
  --accent-2: #ffd27a;
  --danger: #ff8fa3;
  --radius: 12px;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
button {
  font: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  border-radius: 8px;
  padding: 8px 14px;
  transition: background 0.15s, border-color 0.15s;
}
button:hover { border-color: var(--accent); }
button:active { transform: translateY(1px); }
button.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #08111f;
  font-weight: 600;
}
button:disabled { opacity: 0.45; cursor: not-allowed; }
input, textarea, select {
  font: inherit;
  background: var(--bg-soft);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  width: 100%;
  user-select: text;
}
textarea { resize: vertical; min-height: 68px; }
input:focus, textarea:focus, select:focus { border-color: var(--accent); }
/* 可见焦点（§29 无障碍）：键盘导航时用轮廓环标出 */
input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 1px; }
.label { color: var(--text-dim); font-size: 13px; margin-bottom: 6px; display: block; }
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 5px; }

/* ---------- 主窗口布局 ---------- */
.main-view { height: 100%; display: flex; flex-direction: column; position: relative; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--bg-soft); }
.brand-name { font-weight: 700; font-size: 18px; }
.brand-tag { color: var(--text-dim); font-size: 12px; }
.topbar-right { display: flex; align-items: center; gap: 14px; }
.lang-wrap { min-width: 170px; }
.lang-wrap .label { display: none; }
.state-badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; border: 1px solid var(--border); white-space: nowrap; }
.state-badge.idle { color: var(--text-dim); }
.state-badge.preview { color: var(--accent-2); border-color: var(--accent-2); }
.state-badge.displaying { color: var(--accent); border-color: var(--accent); }
.state-badge.finished { color: var(--danger); border-color: var(--danger); }
.content { flex: 1; display: grid; grid-template-columns: minmax(300px, 380px) 1fr; gap: 18px; padding: 18px; overflow: hidden; }
.col-edit { overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 6px; }
.col-preview { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.actions { display: flex; gap: 10px; }
.big { padding: 14px 20px; font-size: 16px; flex: 1; }
.mini { padding: 3px 8px; font-size: 12px; }
.danger { background: transparent; border-color: var(--danger); color: var(--danger); width: 100%; }

/* ---------- 面板通用 ---------- */
.panel { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.panel-title { font-weight: 600; font-size: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
.hint { color: var(--text-dim); font-size: 12px; margin: 8px 0 0; }
.error { color: var(--danger); font-size: 13px; margin: 8px 0 0; }
.row { display: flex; align-items: center; gap: 10px; }
.unit { color: var(--text-dim); }

/* ---------- 模板选择 ---------- */
.tpl-cat { margin-bottom: 12px; }
.tpl-cat-name { font-size: 13px; color: var(--text-dim); margin-bottom: 6px; }
.tpl-list { display: flex; flex-wrap: wrap; gap: 8px; }
.tpl-chip { background: var(--bg-soft); border: 1px solid var(--border); padding: 6px 12px; border-radius: 999px; font-size: 13px; }
.tpl-chip.active { background: var(--accent); border-color: var(--accent); color: #08111f; font-weight: 600; }

/* ---------- 时长 / 倒计时 ---------- */
.dur-input { width: 110px; }
.preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: var(--bg-soft); border: 1px solid var(--border); padding: 4px 10px; border-radius: 8px; font-size: 13px; }
.chip.active { border-color: var(--accent); color: var(--accent); }
.segmented { display: flex; gap: 6px; }
.seg { flex: 1; background: var(--bg-soft); }
.seg.active { background: var(--accent); color: #08111f; border-color: var(--accent); font-weight: 600; }

/* ---------- 图片 ---------- */
.img-picker { display: flex; gap: 10px; }
.img-preset { flex: 1; background: var(--bg-soft); display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px; }
.img-preset span { font-size: 12px; color: var(--text-dim); }
.img-preset.active { border-color: var(--accent); }
.img-preset .show-image { width: 100%; height: 70px; }
.dropzone { margin-top: 12px; border: 1.5px dashed var(--border); border-radius: 10px; padding: 16px; text-align: center; min-height: 130px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; position: relative; }
.dropzone.dragging { border-color: var(--accent); background: var(--bg-soft); }
.dropzone.active { border-style: solid; }
.dropzone .show-image { width: 100%; height: 150px; }
.dropzone-hint { font-weight: 600; }
.dropzone-sub { color: var(--text-dim); font-size: 12px; }

/* ---------- 显示范围 ---------- */
.monitor-list { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.monitor-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.monitor-item input { width: auto; }
.monitor-name { flex: 1; }
.monitor-dim { color: var(--text-dim); font-size: 12px; }

/* ---------- 关于 ---------- */
.about-intro { color: var(--text-dim); font-size: 13px; }
.about-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-top: 1px solid var(--border); }
.about-row a { color: var(--accent); text-decoration: none; }

/* ---------- 展示图片容器 ---------- */
.show-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.show-image svg, .show-image img { width: 100%; height: 100%; object-fit: contain; }

/* ---------- 展示版式（预览 / 全屏共用，基于容器查询单位等比缩放） ---------- */
.screen { width: 100vw; height: 100vh; container-type: size; }
.stage { width: 100%; height: 100%; display: flex; flex-direction: column; padding: 6cqmin; gap: 3cqmin; font-size: 4cqmin; color: #e8eefc; position: relative; background: linear-gradient(160deg, #0d1526, #1a2947); }
.stage-head { flex: 0 0 auto; text-align: center; }
.stage-title { font-size: 8cqmin; font-weight: 800; line-height: 1.15; margin: 0; }
.stage-subtitle { font-size: 4cqmin; color: #9fb0d0; margin: 1cqmin 0 0; }
.stage-body { flex: 1; display: grid; grid-template-columns: 1.05fr 1fr; gap: 4cqmin; min-height: 0; }
.stage-image { display: flex; align-items: center; justify-content: center; min-height: 0; }
.stage-right { display: flex; flex-direction: column; gap: 3cqmin; min-height: 0; }
.stage-countdown { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; }
.stage-reason { flex: 1; font-size: 3.4cqmin; line-height: 1.5; color: #cdd8f0; overflow: hidden; background: rgba(255, 255, 255, 0.04); border-radius: 2cqmin; padding: 3cqmin; }
.stage-finished { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3cqmin; background: rgba(13, 21, 38, 0.86); }
.stage-finished-badge { font-size: 16cqmin; }
.stage-finished-text { font-size: 8cqmin; font-weight: 700; color: var(--accent-2); }
.stage-hint { position: absolute; bottom: 2.5cqmin; right: 4cqmin; font-size: 2.6cqmin; color: #9fb0d0; opacity: 0.6; }

/* 数字倒计时 */
.digital { width: 100%; display: flex; flex-direction: column; gap: 2cqmin; align-items: center; }
.digital-time { font-size: 12cqmin; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: 1px; }
.digital-bar { width: 80%; height: 1.6cqmin; background: rgba(255, 255, 255, 0.12); border-radius: 999px; overflow: hidden; }
.digital-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width 0.3s linear; }

/* 沙漏倒计时 */
.hourglass { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2cqmin; height: 100%; }
.hourglass svg { height: 26cqmin; }
.hourglass-hint { font-size: 5cqmin; font-weight: 700; color: var(--accent-2); }

/* ---------- 实时预览 ---------- */
.preview-card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; box-shadow: var(--shadow); }
.preview-wrap { position: relative; }
.preview-screen { container-type: size; width: 100%; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; }
.edit-hint { color: var(--text-dim); font-size: 12.5px; margin-top: 8px; }

/* ---------- 点击预览热区 + 浮层编辑面板（§3.2 / §12） ---------- */
.hotspot { position: absolute; z-index: 4; background: transparent; border: 1px dashed transparent; border-radius: 10px; cursor: pointer; padding: 0; box-shadow: none; }
.hotspot:hover { border-color: rgba(110, 168, 254, 0.6); background: rgba(110, 168, 254, 0.08); }
.hotspot::after { content: '✎'; position: absolute; right: 8px; top: 4px; font-size: 13px; color: var(--accent); opacity: 0; }
.hotspot:hover::after { opacity: 0.9; }
.hs-head { left: 3%; top: 2%; right: 3%; height: 20%; }
.hs-image { left: 3%; top: 24%; width: 48%; height: 62%; }
.hs-count { right: 3%; top: 24%; width: 42%; height: 34%; }
.hs-reason { right: 3%; top: 60%; width: 42%; height: 26%; }
.edit-overlay { position: absolute; inset: 0; z-index: 20; background: rgba(7, 11, 22, 0.68); backdrop-filter: blur(3px); border-radius: 10px; display: flex; align-items: flex-start; justify-content: center; padding: 14px; overflow: auto; }
.edit-card { width: min(100%, 430px); background: var(--bg-soft); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; }
.edit-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.edit-card .panel { background: transparent; border: none; padding: 0; }
.link-btn { background: none; border: none; color: var(--accent); cursor: pointer; padding: 0; font-size: inherit; text-decoration: underline; }

/* ---------- 星空背景（§14 / §25） ---------- */
.starfield { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.sf-star { position: absolute; border-radius: 50%; background: #cfe0ff; opacity: 0.6; animation: sf-tw 3s ease-in-out infinite alternate; }
@keyframes sf-tw { from { opacity: 0.1; transform: scale(0.7); } to { opacity: 0.9; transform: scale(1); } }
.sf-moon { position: absolute; right: 6%; top: 7%; width: min(7vw, 84px); height: min(7vw, 84px); border-radius: 50%; background: radial-gradient(circle at 38% 35%, #f6f2df, #ded7ba 62%, #b8b190); box-shadow: 0 0 24px rgba(246, 242, 223, 0.3); }
.stage .stage-head, .stage .stage-body, .stage .stage-hint { position: relative; z-index: 1; }
.main-view > .topbar, .main-view > .content { position: relative; z-index: 1; }

/* 减少动态效果（§29） */
@media (prefers-reduced-motion: reduce) {
  .sf-star { animation: none; opacity: 0.5; }
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
`

export function injectGlobalStyle() {
  if (document.getElementById('homenap-global-style')) return
  const style = document.createElement('style')
  style.id = 'homenap-global-style'
  style.textContent = CSS
  document.head.appendChild(style)
}

injectGlobalStyle()
