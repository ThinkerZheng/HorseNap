// 用户配置：内存单例 + Rust 持久化（§22）
// 前端只持有数据，读写通过 invoke 走 Rust（原子替换 / 损坏回退在 Rust 侧）

import { reactive, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { HorseNapConfig, Locale, Template } from './types'
import { ALL_LOCALES } from './types'
import { findTemplate, pick } from './templates'

export const CONFIG_VERSION = 1

function detectSystemLocale(): Locale {
  const nav = navigator.language
  const exact = ALL_LOCALES.find((l) => l.toLowerCase() === nav.toLowerCase())
  if (exact) return exact
  const base = nav.split('-')[0].toLowerCase()
  if (base === 'zh') return nav.toLowerCase().includes('tw') || nav.toLowerCase().includes('hk') ? 'zh-TW' : 'zh-CN'
  const partial = ALL_LOCALES.find((l) => l.toLowerCase().startsWith(base))
  return partial ?? 'en'
}

export function defaultConfig(): HorseNapConfig {
  return {
    version: CONFIG_VERSION,
    locale: detectSystemLocale(),
    template: { categoryId: 'rest', templateId: 'rest-casual' },
    contentModified: false,
    title: '',
    subtitle: '',
    reason: '',
    durationMinutes: 20,
    image: { type: 'preset', id: 'horse' },
    countdown: { style: 'digital' },
    display: { mode: 'all', monitorIds: [] },
    window: { mainWidth: 1080, mainHeight: 720, previewRatio: 0.4 },
  }
}

export const config = reactive<HorseNapConfig>(defaultConfig())

/** 用模板默认内容填充配置（当前语言版本，§3.1 / §21） */
export function applyTemplateToConfig(cfg: HorseNapConfig, tpl: Template, locale: Locale) {
  cfg.title = pick(tpl.title, locale)
  cfg.subtitle = pick(tpl.subtitle, locale)
  cfg.reason = pick(tpl.reason, locale)
  cfg.image = { type: 'preset', id: tpl.image.id }
  if (tpl.countdownStyle) cfg.countdown.style = tpl.countdownStyle
  if (tpl.defaultDurationMinutes) cfg.durationMinutes = tpl.defaultDurationMinutes
  cfg.template = { categoryId: cfg.template.categoryId, templateId: tpl.id }
  cfg.contentModified = false
}

/** 判断字段是否偏离模板默认（contentModified 定义，§3.1） */
export function contentMatchesTemplate(cfg: HorseNapConfig): boolean {
  const tpl = findTemplate(cfg.template.categoryId, cfg.template.templateId)
  if (!tpl) return false
  return (
    cfg.title === pick(tpl.title, cfg.locale) &&
    cfg.subtitle === pick(tpl.subtitle, cfg.locale) &&
    cfg.reason === pick(tpl.reason, cfg.locale) &&
    cfg.image.type === 'preset' &&
    cfg.image.id === tpl.image.id
  )
}

let saveTimer: number | undefined

/** 防抖持久化 */
export function scheduleSave() {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    invoke('save_config', { config: JSON.stringify({ ...config }) }).catch((e: unknown) =>
      console.error('save_config failed', e),
    )
  }, 300)
}

export async function loadConfig() {
  try {
    const raw = await invoke<string | null>('load_config')
    if (raw) {
      const parsed = JSON.parse(raw) as HorseNapConfig
      Object.assign(config, defaultConfig(), parsed)
      // 首次安装：配置内容为空时用模板默认填充
      if (!config.title && !config.subtitle && !config.reason) {
        const tpl = findTemplate(config.template.categoryId, config.template.templateId)
        if (tpl) applyTemplateToConfig(config, tpl, config.locale)
      }
      return
    }
  } catch (e) {
    console.error('load_config failed, using defaults', e)
  }
  // 全新安装：默认模板内容
  const tpl = findTemplate(config.template.categoryId, config.template.templateId)
  if (tpl) applyTemplateToConfig(config, tpl, config.locale)
  config.title = pick(tpl!.title, config.locale)
  config.subtitle = pick(tpl!.subtitle, config.locale)
  config.reason = pick(tpl!.reason, config.locale)
}

export function initConfigWatch() {
  watch(config, scheduleSave, { deep: true })
}
