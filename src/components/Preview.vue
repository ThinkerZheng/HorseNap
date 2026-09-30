<script setup lang="ts">
// 主窗口实时预览：与全屏同一 DisplayStage 版式，缩放到卡片内（所见即所得）
import { computed } from 'vue'
import { config } from '../store'
import { buildSnapshot, remainingMs, resolveReason, appState } from '../display'
import DisplayStage from './DisplayStage.vue'

const snap = computed(() => buildSnapshot())
const totalMs = computed(() => config.durationMinutes * 60_000)
const reasonResolved = computed(() =>
  resolveReason(config.reason, config.durationMinutes, config.locale),
)
const finished = computed(() => appState.value === 'finished')
</script>

<template>
  <div class="preview-card">
    <div class="preview-screen">
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
  </div>
</template>
