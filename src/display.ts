// 展示生命周期状态机（需求 §19.1）——仅主窗口进程驱动
//
// Idle ──全屏──▶ Displaying ──任意键/托盘退出展示──▶ Preview（计时继续）
// Preview ──全屏──▶ Displaying（沿用截止时刻）
// Displaying/Preview ──归零──▶ Finished/Idle
// 停止计时（面板仅 Preview / 托盘任意态）──▶ Idle

import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { emit, listen } from '@tauri-apps/api/event'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { availableMonitors } from '@tauri-apps/api/window'
import type { AppState, DisplaySnapshot } from './types'
import { config, contentMatchesTemplate, scheduleSave } from './store'
import { formatDuration } from './i18n'

export const appState = ref<AppState>('idle')

/** 运行时截止时刻（ms, epoch），不持久化（§22） */
export const deadlineMs = ref<number | null>(null)
export const nowTs = ref(Date.now())

const DISPLAY_LABEL_PREFIX = 'display-'
let displayWindows: string[] = []
let tickTimer: number | undefined
let soundPlayed = false
let hotplugTimer: number | undefined
/** 已开窗口覆盖的显示器位置（热插拔对比基准，§19.4） */
let openedPositions: string[] = []

/** 电源保持失败仅记录并继续展示（§31；非 Windows 平台目前为 stub） */
function keepAwake(on: boolean) {
  invoke('set_keep_awake', { on }).catch((e) => console.warn('set_keep_awake failed', e))
}

export const remainingMs = computed(() => {
  if (deadlineMs.value == null) return null
  return Math.max(0, deadlineMs.value - nowTs.value)
})

export function buildSnapshot(): DisplaySnapshot {
  return {
    title: config.title,
    subtitle: config.subtitle,
    reason: config.reason,
    durationMinutes: config.durationMinutes,
    deadlineMs: deadlineMs.value,
    image: { ...config.image },
    countdownStyle: config.countdown.style,
    locale: config.locale,
  }
}

/** 广播快照给所有展示窗口 + 预览 */
export async function broadcastSnapshot() {
  const snap = buildSnapshot()
  await emit('display-snapshot', snap)
}

/** 理由文本 {duration} 替换（§11：不受语言切换影响，跟随当前配置时长） */
export function resolveReason(reason: string, minutes: number, locale: string): string {
  return reason.replaceAll('{duration}', formatDuration(minutes, locale as never))
}

function startTick() {
  stopTick()
  // 250ms 刷新一次显示；时间基于绝对截止时刻计算，不累加，无漂移（§19.3）
  tickTimer = window.setInterval(() => {
    nowTs.value = Date.now()
    if (deadlineMs.value != null && nowTs.value >= deadlineMs.value && appState.value !== 'finished') {
      if (appState.value === 'displaying' || appState.value === 'preview') {
        onDeadlineReached()
      }
    }
  }, 250)
}

function stopTick() {
  if (tickTimer) window.clearInterval(tickTimer)
  tickTimer = undefined
}

async function onDeadlineReached() {
  if (appState.value === 'displaying') {
    appState.value = 'finished'
    if (!soundPlayed) {
      soundPlayed = true
      invoke('play_chime').catch(() => undefined) // 归零提示音播放一次（§19.1）
    }
    await broadcastSnapshot()
  } else if (appState.value === 'preview') {
    // Preview 归零 → Idle（§19.1）
    deadlineMs.value = null
    appState.value = 'idle'
    stopTick()
    await broadcastSnapshot()
  }
}

/** 在指定显示器创建并显示一个全屏窗口 */
async function spawnOnMonitor(
  mon: { position: { x: number; y: number }; size: { width: number; height: number } },
  label: string,
) {
  const win = new WebviewWindow(label, {
    url: `index.html?display=1`,
    x: mon.position.x,
    y: mon.position.y,
    width: mon.size.width,
    height: mon.size.height,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focus: true,
    visible: false,
  })
  displayWindows.push(label)
  return new Promise<void>((resolve) => {
    win.once('tauri://created', () => {
      // visible:false 创建的窗口不会自行出现，必须显式 show
      void win.show().catch(() => undefined)
      resolve()
    })
    win.once('tauri://error', () => resolve())
  })
}

/** 创建全屏展示窗口（按显示范围，§19.4） */
async function createDisplayWindows(): Promise<boolean> {
  try {
    const monitors = await availableMonitors()
    if (monitors.length === 0) return false
    let targets = monitors
    if (config.display.mode === 'specific' && config.display.monitorIds?.length) {
      const matched = monitors.filter((m, i) => config.display.monitorIds!.includes(m.name || `Monitor ${i + 1}`))
      if (matched.length === 0) {
        // 指定显示器失配：回退全部（§22 / §32）
        config.display.mode = 'all'
        config.display.monitorIds = []
        scheduleSave()
      } else {
        targets = matched
      }
    }
    openedPositions = targets.map((m) => `${m.position.x},${m.position.y}`)
    await Promise.all(
      targets.map((mon, i) => spawnOnMonitor(mon, `${DISPLAY_LABEL_PREFIX}${i}`)),
    )
    return displayWindows.length > 0
  } catch (e) {
    console.error('create display windows failed', e)
    return false
  }
}

async function closeDisplayWindows() {
  stopHotplugWatch()
  const wins = await WebviewWindow.getAll().catch(() => [])
  for (const w of wins) {
    if (w.label.startsWith(DISPLAY_LABEL_PREFIX)) {
      await w.close().catch(() => undefined)
    }
  }
  displayWindows = []
  openedPositions = []
}

/** 多显示器热插拔：展示期间轮询，新增显示器（range=all）自动纳入（§19.4，3s 防抖） */
function startHotplugWatch() {
  if (hotplugTimer) return
  hotplugTimer = window.setInterval(async () => {
    if (appState.value !== 'displaying') {
      stopHotplugWatch()
      return
    }
    if (config.display.mode !== 'all') return
    try {
      const monitors = await availableMonitors()
      const missing = monitors.filter((m) => !openedPositions.includes(`${m.position.x},${m.position.y}`))
      if (!missing.length) return
      // 接入瞬间可能连续变化，先等一轮稳定再创建
      await new Promise((r) => window.setTimeout(r, 1500))
      const fresh = await availableMonitors()
      for (const m of fresh) {
        const pos = `${m.position.x},${m.position.y}`
        if (openedPositions.includes(pos) || !missing.some((x) => `${x.position.x},${x.position.y}` === pos)) continue
        openedPositions.push(pos)
        await spawnOnMonitor(m, `${DISPLAY_LABEL_PREFIX}hot-${m.position.x}-${m.position.y}`)
        await broadcastSnapshot()
      }
    } catch {
      /* 轮询失败静默，下一轮重试 */
    }
  }, 3000)
}

function stopHotplugWatch() {
  if (hotplugTimer) window.clearInterval(hotplugTimer)
  hotplugTimer = undefined
}

// ---------- 用户操作入口 ----------

/** 点击「全屏」/ 托盘"进入展示"：Idle 或 Preview → Displaying */
export async function startDisplay() {
  if (appState.value === 'displaying' || appState.value === 'finished') return
  if (appState.value === 'idle') {
    // 记录 T_ref = 当前时刻, duration = 配置时长（§19.1）
    deadlineMs.value = Date.now() + config.durationMinutes * 60_000
    soundPlayed = false
  }
  // Preview → Displaying：沿用既有截止时刻
  const main = (await import('@tauri-apps/api/window')).getCurrentWindow()
  await main.hide()
  const ok = await createDisplayWindows()
  if (!ok) {
    await main.show()
    deadlineMs.value = null
    return
  }
  appState.value = 'displaying'
  startTick()
  startHotplugWatch()
  keepAwake(true) // 电源保持（§17）；失败不阻断展示（§31）
  await broadcastSnapshot()
}

/** 任意键 / Esc / 托盘"退出展示"：Displaying → Preview（计时继续） */
export async function exitDisplay() {
  if (appState.value !== 'displaying') return
  await closeDisplayWindows()
  appState.value = 'preview'
  const main = (await import('@tauri-apps/api/window')).getCurrentWindow()
  await main.show()
  await main.setFocus()
  await broadcastSnapshot()
}

/** 停止计时（面板仅 Preview；托盘任意运行态）→ Idle（§19.1/§19.3） */
export async function stopTimer() {
  if (appState.value === 'idle') return
  deadlineMs.value = null
  appState.value = 'idle'
  stopTick()
  await closeDisplayWindows()
  keepAwake(false)
  const main = (await import('@tauri-apps/api/window')).getCurrentWindow()
  await main.show().catch(() => undefined)
  await broadcastSnapshot()
}

/** Finished → Idle（任意键/Esc/托盘退出展示或停止计时） */
export async function finishToIdle() {
  if (appState.value !== 'finished') return
  deadlineMs.value = null
  appState.value = 'idle'
  stopTick()
  await closeDisplayWindows()
  keepAwake(false)
  const main = (await import('@tauri-apps/api/window')).getCurrentWindow()
  await main.show().catch(() => undefined)
}

/** 修改时长且计时运行中（Preview）：当前时刻 + 新时长重算（§10） */
export function onDurationChanged(minutes: number) {
  if (appState.value === 'preview' && deadlineMs.value != null) {
    deadlineMs.value = Date.now() + minutes * 60_000
    broadcastSnapshot()
  }
}

// ---------- 展示窗口事件 ----------

export async function listenDisplayEvents() {
  // 展示窗口按任意键 → 请求退出
  await listen('display-exit-request', () => {
    if (appState.value === 'displaying') exitDisplay()
    else if (appState.value === 'finished') finishToIdle()
  })
}

// ---------- 展示窗口侧（display=1 的窗口调用） ----------

export const snapshot = ref<DisplaySnapshot | null>(null)

export async function initDisplayWindow() {
  snapshot.value = buildFallbackSnapshot()
  await listen<DisplaySnapshot>('display-snapshot', (e) => {
    snapshot.value = e.payload
  })
  // 启动时主动向主窗口请求一次快照不太必要：主窗口创建时已广播
  void emit('display-ready', undefined)
}

function buildFallbackSnapshot(): DisplaySnapshot {
  return {
    title: config.title,
    subtitle: config.subtitle,
    reason: config.reason,
    durationMinutes: config.durationMinutes,
    deadlineMs: null,
    image: { ...config.image },
    countdownStyle: config.countdown.style,
    locale: config.locale,
  }
}

/** 展示窗口任意键退出（§16：仅物理键盘；鼠标不退出） */
export function installDisplayKeyHandler() {
  window.addEventListener('keydown', (e) => {
    // §19.3 语义即「任意物理按键（含 Esc）」退出；鼠标不退出
    void emit('display-exit-request', undefined)
    e.preventDefault()
  })
  // 进入全屏 2 秒后隐藏指针（§19.5）
  let hideTimer = window.setTimeout(hideCursor, 2000)
  window.addEventListener('mousemove', () => {
    window.clearTimeout(hideTimer)
    document.body.style.cursor = 'default'
    hideTimer = window.setTimeout(hideCursor, 2000)
  })
}

function hideCursor() {
  document.body.style.cursor = 'none'
}

// 主窗口收到展示窗口的就绪信号时补发快照
export async function listenDisplayReady() {
  await listen('display-ready', () => {
    void broadcastSnapshot()
  })
}

export function isDisplayWindow(): boolean {
  return new URLSearchParams(window.location.search).has('display')
}

export function syncModifiedFlag() {
  config.contentModified = !contentMatchesTemplate(config)
}
