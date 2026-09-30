// 内置模板（需求文档 §3.1 模板表）
// 文案为"原始文本"，reason 中 {duration} 为占位符（§11）
//
// 语言覆盖策略（§21）：首发提供 zh-CN / zh-TW / en，
// 其余语言键缺失时运行时回退英语，待社区翻译补全。

import type { TemplateCategory, Locale, Template, I18nString } from './types'

/** 按语言取值，缺失回退 en（§21） */
export function pick(i18n: I18nString, locale: Locale): string {
  return i18n[locale] ?? i18n['en'] ?? Object.values(i18n)[0] ?? ''
}

function t(zhCN: string, zhTW: string, en: string): I18nString {
  return { 'zh-CN': zhCN, 'zh-TW': zhTW, en }
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'rest',
    name: t('工作小憩', '工作小憩', 'Work Nap'),
    templates: [
      {
        id: 'rest-casual',
        name: t('轻松活泼', '輕鬆活潑', 'Casual & Cheerful'),
        title: t('人类防猝死计划执行中', '人類防猝死的計劃執行中', 'Human Anti-Sudden-Death Plan in Progress'),
        subtitle: t(
          '马儿非常累，需小憩片刻，如有急事，请打醒我，非急事请勿扰',
          '馬兒非常累，需小憩片刻，如有急事，請打醒我，非急事請勿擾',
          'The workhorse is exhausted and needs a quick nap. Urgent? Wake me up. Otherwise, please let me rest.',
        ),
        reason: t(
          '我已经加班加点地完成了阶段性的工作，现在极端困倦，需要短暂休息 {duration}。小憩之后，我会满血归来。',
          '我已经加班熬夜地完成了階段性的工作，現在極度睏倦，需要短暫休息 {duration}。小憩之後，我會滿血歸來。',
          'I finished this stage of work after long overtime hours and am extremely sleepy. I need a short break of {duration}. After a nap, I will be back at full power.',
        ),
        image: { type: 'preset', id: 'horse' },
        countdownStyle: 'digital',
        defaultDurationMinutes: 20,
      } as Template,
    ],
  },
  {
    id: 'meeting',
    name: t('参加会议', '參加會議', 'In a Meeting'),
    templates: [
      {
        id: 'meeting-casual',
        name: t('轻松活泼', '輕鬆活潑', 'Casual & Cheerful'),
        title: t('会议室开会中', '會議室開會中', 'In a Meeting Room'),
        subtitle: t(
          '人在会议室，消息会回复得慢一些',
          '人在會議室，訊息會回覆得慢一些',
          'Stuck in a meeting — replies will be slower than usual.',
        ),
        reason: t(
          '我正在开会，预计 {duration} 后回来。',
          '我正在開會，預計 {duration} 後回來。',
          'I am in a meeting. Back in about {duration}.',
        ),
        image: { type: 'preset', id: 'cat' },
        countdownStyle: 'digital',
        defaultDurationMinutes: 30,
      },
    ],
  },
  {
    id: 'coffee',
    name: t('外出买咖啡', '外出買咖啡', 'Getting Coffee'),
    templates: [
      {
        id: 'coffee-casual',
        name: t('轻松活泼', '輕鬆活潑', 'Casual & Cheerful'),
        title: t('咖啡续命中', '咖啡續命中', 'Coffee Refuel in Progress'),
        subtitle: t('下楼买杯咖啡，很快回来', '下樓買杯咖啡，很快回來', 'Going downstairs for a coffee. Be right back.'),
        reason: t(
          '我去买咖啡，预计 {duration} 后回来。',
          '我去買咖啡，預計 {duration} 後回來。',
          'Off to grab a coffee. Back in about {duration}.',
        ),
        image: { type: 'preset', id: 'horse' },
        countdownStyle: 'digital',
        defaultDurationMinutes: 10,
      },
    ],
  },
  {
    id: 'toilet',
    name: t('去洗手间', '去洗手間', 'Away'),
    templates: [
      {
        id: 'toilet-casual',
        name: t('轻松活泼', '輕鬆活潑', 'Casual & Cheerful'),
        title: t('暂离工位，很快回来', '暫離工位，很快回來', 'Temporarily Away — Back Soon'),
        subtitle: t('去个洗手间，稍后就回', '去個洗手間，稍後就回', 'Stepping away for a moment. Back shortly.'),
        reason: t(
          '临时离开一下，预计 {duration} 后回来。',
          '臨時離開一下，預計 {duration} 後回來。',
          'Just stepped away for a bit. Back in about {duration}.',
        ),
        image: { type: 'preset', id: 'cat' },
        countdownStyle: 'digital',
        defaultDurationMinutes: 5,
      },
    ],
  },
]

export function findTemplate(categoryId: string, templateId: string): Template | undefined {
  return TEMPLATE_CATEGORIES.find((c) => c.id === categoryId)?.templates.find((x) => x.id === templateId)
}
