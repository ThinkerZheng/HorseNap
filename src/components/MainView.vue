<script setup lang="ts">
// 主窗口布局：顶栏（品牌 / 语言 / 状态） + 左编辑区 + 右预览区 + 全屏动作
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { appState, startDisplay } from '../display'
import TemplateSelector from './TemplateSelector.vue'
import TextPanel from './TextPanel.vue'
import DurationPanel from './DurationPanel.vue'
import ImagePanel from './ImagePanel.vue'
import DisplayRangePanel from './DisplayRangePanel.vue'
import LanguageSelector from './LanguageSelector.vue'
import AboutPanel from './AboutPanel.vue'
import Preview from './Preview.vue'

const { t } = useI18n()
const stateLabel = computed(() => t(`state.${appState.value}`))
const canStart = computed(() => appState.value === 'idle' || appState.value === 'preview')
</script>

<template>
  <div class="main-view">
    <header class="topbar">
      <div class="brand">
        <div class="brand-name">🐴 {{ $t('app.name') }}</div>
        <div class="brand-tag">{{ $t('app.tagline') }}</div>
      </div>
      <div class="topbar-right">
        <div class="lang-wrap"><LanguageSelector /></div>
        <span class="state-badge" :class="appState">{{ stateLabel }}</span>
      </div>
    </header>

    <div class="content">
      <div class="col-edit">
        <TemplateSelector />
        <TextPanel />
        <DurationPanel />
        <ImagePanel />
        <DisplayRangePanel />
        <AboutPanel />
      </div>

      <div class="col-preview">
        <Preview />
        <div class="actions">
          <button class="primary big" :disabled="!canStart" @click="startDisplay">
            ⛶ {{ $t('display.fullscreen') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
