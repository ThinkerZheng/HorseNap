<script setup lang="ts">
// 语言切换（§21）：切换 UI 语言；未自定义内容时同步重套当前模板的新语言文案
import { ALL_LOCALES } from '../types'
import type { Locale } from '../types'
import { LOCALE_NAMES, hasLocale } from '../i18n'
import { findTemplate } from '../templates'
import { config, applyTemplateToConfig } from '../store'
import { syncModifiedFlag } from '../display'

function setLang(loc: Locale) {
  config.locale = loc
  if (!config.contentModified) {
    const tpl = findTemplate(config.template.categoryId, config.template.templateId)
    if (tpl) applyTemplateToConfig(config, tpl, loc)
  }
  syncModifiedFlag()
}
</script>

<template>
  <div>
    <label class="label">{{ $t('sidebar.language') }}</label>
    <select :value="config.locale" @change="setLang(($event.target as HTMLSelectElement).value as Locale)">
      <option v-for="loc in ALL_LOCALES" :key="loc" :value="loc">
        {{ LOCALE_NAMES[loc] }}{{ hasLocale(loc) ? '' : ' · en' }}
      </option>
    </select>
  </div>
</template>
