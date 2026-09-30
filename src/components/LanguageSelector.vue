<script setup lang="ts">
// 语言切换（§21）：只切换 UI 语言；已写入配置的告示内容不覆盖、不翻译，
// 需要其他语言的模板文案时由用户重新应用模板。
import { ALL_LOCALES } from '../types'
import type { Locale } from '../types'
import { LOCALE_NAMES, hasLocale } from '../i18n'
import { config } from '../store'

function setLang(loc: Locale) {
  config.locale = loc
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