<script setup lang="ts">
// 模板选择：分类 → 模板（§3.1）。已改内容时应用模板需二次确认（§4 覆盖确认）
// 确认走 dialog 插件原生框（window.confirm 在 WebView 下跨平台不可靠）
import { useI18n } from 'vue-i18n'
import { confirm } from '@tauri-apps/plugin-dialog'
import { TEMPLATE_CATEGORIES, pick } from '../templates'
import { config, applyTemplateToConfig } from '../store'
import { syncModifiedFlag } from '../display'
import type { Template } from '../types'

const { t } = useI18n()

async function apply(categoryId: string, tpl: Template) {
  if (config.contentModified) {
    const ok = await confirm(t('template.overwriteConfirm'), { title: t('sidebar.templates'), kind: 'warning' })
    if (!ok) return
  }
  config.template = { categoryId, templateId: tpl.id }
  applyTemplateToConfig(config, tpl, config.locale)
  syncModifiedFlag()
}

function isActive(categoryId: string, tpl: Template): boolean {
  return config.template.categoryId === categoryId && config.template.templateId === tpl.id
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">{{ $t('sidebar.templates') }}</div>
    <div v-for="cat in TEMPLATE_CATEGORIES" :key="cat.id" class="tpl-cat">
      <div class="tpl-cat-name">{{ pick(cat.name, config.locale) }}</div>
      <div class="tpl-list">
        <button
          v-for="tpl in cat.templates"
          :key="tpl.id"
          class="tpl-chip"
          :class="{ active: isActive(cat.id, tpl) }"
          @click="apply(cat.id, tpl)"
        >
          {{ pick(tpl.name, config.locale) }}
        </button>
      </div>
    </div>
  </div>
</template>
