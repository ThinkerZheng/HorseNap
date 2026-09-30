import { createI18n } from 'vue-i18n'
import type { Locale } from '../types'
import { RTL_LOCALES } from '../types'

import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'

// §21：首发交付 zh-CN / zh-TW / en；其余 9 语言键缺失时 vue-i18n 自动回退英语。
const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
}

// 语言切换器中 12 种语言的自称（native name，无需翻译）
export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  ar: 'العربية',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages,
})

/** 该语言是否已有本地包（无则回退英语渲染） */
export function hasLocale(locale: Locale): boolean {
  return locale in messages
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

/** {duration} 占位符替换：按 locale 使用 Intl 格式化（§11 / §9） */
export function formatDuration(minutes: number, locale: Locale): string {
  const intlLocale = locale.replace('_', '-')
  // Intl.DurationFormat（ES2025）在部分 WebView 不可用，逐级兜底
  const DF = (Intl as unknown as { DurationFormat?: new (l: string, o: { style: string }) => { format(v: object): string } }).DurationFormat
  if (DF) {
    try {
      return new DF(intlLocale, { style: 'short' }).format({ minutes })
    } catch {
      /* fall through */
    }
  }
  try {
    return new Intl.RelativeTimeFormat(intlLocale, { numeric: 'always' }).format(minutes, 'minute')
  } catch {
    return `${minutes} min`
  }
}

export function applyDirection(locale: Locale) {
  document.documentElement.setAttribute('dir', isRtl(locale) ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', locale)
}
