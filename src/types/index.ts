// 全局类型定义（对应需求文档 §28 核心数据模型）

export type Locale =
  | 'zh-CN' | 'zh-TW' | 'en' | 'ko' | 'ja' | 'ru'
  | 'vi' | 'hi' | 'ar' | 'fr' | 'de' | 'es'

export const ALL_LOCALES: Locale[] = [
  'zh-CN', 'zh-TW', 'en', 'ko', 'ja', 'ru',
  'vi', 'hi', 'ar', 'fr', 'de', 'es',
]

// RTL 语言
export const RTL_LOCALES: Locale[] = ['ar']

// ---------- 模板（内置，随应用打包，按语言提供文案） ----------

// 模板文案按语言部分覆盖，缺失回退 en（§21）
export type I18nString = Partial<Record<Locale, string>>

export interface TemplateCategory {
  id: string // 'rest' | 'meeting' | 'coffee' | 'toilet'
  name: I18nString
  templates: Template[]
}

export interface Template {
  id: string // 'rest-casual' | ...
  name: I18nString
  title: I18nString
  subtitle: I18nString
  reason: I18nString // 可含 {duration} 占位符
  image: { type: 'preset'; id: string } // 'horse' | 'cat'
  countdownStyle?: CountdownStyle
  defaultDurationMinutes?: number
}

// ---------- 用户配置（持久化到本地） ----------

export type CountdownStyle = 'digital' | 'hourglass'

export interface HorseNapConfig {
  version: number

  locale: Locale

  template: {
    categoryId: string
    templateId: string
  }
  /** 标题/副标题/理由/图片 任一偏离所应用模板的默认值 */
  contentModified: boolean

  title: string
  subtitle: string
  reason: string // 含 {duration} 占位符的原始文本

  durationMinutes: number // 1–180

  image: {
    type: 'preset' | 'custom'
    id?: string // 预设图片 id
    path?: string // 导入到应用数据目录后的绝对路径
  }

  countdown: {
    style: CountdownStyle
  }

  display: {
    mode: 'all' | 'specific'
    monitorIds?: string[]
  }

  window: {
    mainWidth: number
    mainHeight: number
    mainX?: number
    mainY?: number
    previewRatio: number
  }
}

// ---------- 运行时（不持久化） ----------

export type AppState = 'idle' | 'preview' | 'displaying' | 'finished'

/** 展示快照：启动展示或从配置推导，广播给所有展示窗口 */
export interface DisplaySnapshot {
  title: string
  subtitle: string
  reason: string // 原始文本，含 {duration}
  durationMinutes: number
  deadlineMs: number | null // T_ref + duration 的绝对截止时刻（ms）；null = 未运行
  image: HorseNapConfig['image']
  countdownStyle: CountdownStyle
  locale: Locale
}
