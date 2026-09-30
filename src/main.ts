// 应用启动：加载配置 → 初始化 i18n/RTL → 分支「展示窗口」或「主窗口」→ 挂载
import { createApp, watch, type WritableComputedRef } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import App from './App.vue'
import './styles'
import { i18n, applyDirection } from './i18n'
import { loadConfig, initConfigWatch, config } from './store'
import {
  isDisplayWindow,
  initDisplayWindow,
  installDisplayKeyHandler,
  listenDisplayEvents,
  listenDisplayReady,
  startDisplay,
  exitDisplay,
  stopTimer,
} from './display'
import type { Locale } from './types'

// vue-i18n 从 messages 推断 locale 类型为已交付的三种；运行时其余 9 语言按 §21 回退英语，
// 故此处以完整 Locale 联合类型持有该 ref。
const localeRef = i18n.global.locale as unknown as WritableComputedRef<Locale>

/** 托盘菜单文案随语言下发到 Rust（§19.2 / §21） */
async function pushTrayLabels(locale: Locale) {
  const t = (k: string) => i18n.global.t(k, {}, { locale } as never)
  try {
    await invoke('set_tray_labels', {
      toggle: t('tray.showHide'),
      start: t('tray.start'),
      stopDisplay: t('tray.stopDisplay'),
      stopTimer: t('tray.stopTimer'),
      quit: t('tray.quit'),
    })
  } catch {
    /* 托盘未就绪时忽略 */
  }
}

async function boot() {
  await loadConfig()

  // 语言 / RTL 联动
  applyDirection(config.locale)
  localeRef.value = config.locale
  watch(
    () => config.locale,
    (loc) => {
      localeRef.value = loc
      applyDirection(loc)
      void pushTrayLabels(loc)
    },
  )
  initConfigWatch()

  const app = createApp(App)
  app.use(i18n)

  if (isDisplayWindow()) {
    // 展示窗口：仅渲染 + 监听快照 + 任意键退出
    await initDisplayWindow()
    installDisplayKeyHandler()
  } else {
    // 主窗口：驱动状态机 + 托盘事件
    await listenDisplayEvents()
    await listenDisplayReady()
    await listen('tray-start', () => void startDisplay())
    await listen('tray-stop-display', () => void exitDisplay())
    await listen('tray-stop-timer', () => void stopTimer())
    await pushTrayLabels(config.locale)
  }

  app.mount('#app')
}

void boot()
