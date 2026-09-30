<script setup lang="ts">
// 数字倒计时（§14）：基于绝对截止时刻计算，250ms 刷新无漂移（§19.3）
import { computed } from 'vue'

const props = defineProps<{ remainingMs: number | null; totalMs: number }>()

const pad = (n: number) => String(n).padStart(2, '0')

const text = computed(() => {
  const ms = props.remainingMs ?? props.totalMs
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
})

const progress = computed(() => {
  const ms = props.remainingMs ?? props.totalMs
  if (props.totalMs <= 0) return 0
  return Math.min(1, Math.max(0, ms / props.totalMs))
})
</script>

<template>
  <div class="digital">
    <div class="digital-time">{{ text }}</div>
    <div class="digital-bar">
      <div class="digital-bar-fill" :style="{ width: progress * 100 + '%' }"></div>
    </div>
  </div>
</template>
