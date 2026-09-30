# 🐴 HorseNap（牛马小憩）

工位暂离告示桌面软件：离开工位时，一键在全屏显示器上挂出「去喝咖啡了，20 分钟后回来」式的温柔告示，并阻止电脑在期间睡眠。

- 技术栈：**Tauri 2 + Rust + Vue 3 + TypeScript**（Windows 优先，macOS / Linux 尽力而为）
- 需求文档：[`doc/需求.md`](doc/需求.md)

## 功能速览

- 4 类内置模板（工作小憩 / 参加会议 / 吃饭 / 稍后回来），`{duration}` 占位符与倒计时联动
- 预览与全屏同一版式，容器单位等比缩放，所见即所得；点击预览区域弹出浮层编辑
- 数字 / 沙漏两种倒计时；归零播放一次提示音并切换「休息时间到了」
- 多显示器全屏展示，任意物理按键退出（鼠标不误触），托盘可随时兜底
- 自定义配图（拖拽或文件选择，SVG/PNG/JPG/GIF/WebP，导入清洗 + 大小像素限制）
- 系统托盘常驻、单实例、12 语言 UI（已交付 zh-CN / zh-TW / en，其余回退英语）

## 开发

```bash
npm install          # 前端依赖
npm run tauri dev    # 开发模式（需 Rust 工具链 + Windows MSVC Build Tools）
```

## 打包

```bash
npm run tauri build  # 产物在 src-tauri/target/release/bundle/
```

仅要绿色 exe：`npm run tauri build -- --no-bundle`（位于 `src-tauri/target/release/homenap.exe`）。

## 目录结构

```
src/            Vue 3 前端（组件 / 状态机 / i18n）
src-tauri/      Rust 后端（config / image / power / sound / tray）
doc/            需求与审查文档
```

## License

MIT
