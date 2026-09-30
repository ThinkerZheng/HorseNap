<script setup lang="ts">
// 实时预览 + 点击热区（§3.2/§12）：点击预览中的区域，打开对应浮层编辑面板
// 预览版式与全屏共用 DisplayStage；容器查询单位保证 1:1 同构缩放
import { computed, onMounted, ref } from 'vue'
import { availableMonitors } from '@tauri-apps/api/window'
import { config } from '../store'
import { buildSnapshot, remainingMs, resolveReason, appState } from '../display'
import DisplayStage from './DisplayStage.vue'
import TextPanel from './TextPanel.vue'
import DurationPanel from './DurationPanel.vue'
import ImagePanel from './ImagePanel.vue'

type PanelKind = 'text' | 'duration' | 'image'
const openPanel = ref<PanelKind | null>(null)
// 预览比例取主显示器实际比例，与全屏 1:1（§5）
const aspect = ref('16 / 9')

const snap = computed(() => buildSnapshot())
const totalMs = computed(() => config.durationMinutes * 60_000)
const reasonResolved = computed(() =>
  resolveReason(config.reason, config.durationMinutes, config.locale),
)
const finished = computed(() => appState.value === 'finished')
const panelTitle = computed(() =>
  openPanel.value === 'text' ? 'text.title' : openPanel.value === 'duration' ? 'countdown.duration' : 'image.preset',
)

onMounted(async () => {
  try {
    const ms = await availableMonitors()
    // JS API 的 Monitor 无 isPrimary 字段：约定首个为主显示器
    const p = ms[0]
    if (p && p.size.width > 0 && p.size.height > 0) aspect.value = `${p.size.width} / ${p.size.height}`
  } catch {
    /* 取不到显示器时退回 16:9 */
  }
})
</script>

<template>
  <div class="preview-card">
    <div class="preview-wrap">
      <div class="preview-screen" :style="{ aspectRatio: aspect }">
        <DisplayStage
          :title="snap.title"
          :subtitle="snap.subtitle"
          :reason-resolved="reasonResolved"
          :image="snap.image"
          :countdown-style="config.countdown.style"
          :remaining-ms="remainingMs"
          :total-ms="totalMs"
          :finished="finished"
          :full="false"
        />
      </div>

      <!-- 点击热区：对应版式中的可编辑区域 -->
      <button class="hotspot hs-head" :title="$t('text.title')" @click="openPanel = 'text'"></button>
      <button class="hotspot hs-image" :title="$t('image.upload')" @click="openPanel = 'image'"></button>
      <button class="hotspot hs-count" :title="$t('countdown.duration')" @click="openPanel = 'duration'"></button>
      <button class="hotspot hs-reason" :title="$t('text.reason')" @click="openPanel = 'text'"></button>

      <!-- 浮层编辑面板（§12：不在预览内部内联编辑） -->
      <div v-if="openPanel" class="edit-overlay" @click.self="openPanel = null">
        <div class="edit-card">
          <div class="edit-head">
            <b>{{ $t(panelTitle) }}</b>
            <button class="mini" @click="openPanel = null">✕ {{ $t('panel.close') }}</button>
          </div>
          <TextPanel v-if="openPanel === 'text'" />
          <DurationPanel v-else-if="openPanel === 'duration'" />
          <ImagePanel v-else />
        </div>
      </div>
    </div>
    <div class="edit-hint">💡 {{ $t('preview.editHint') }}</div>
  </div>
</template>