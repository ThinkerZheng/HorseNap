<script setup lang="ts">
// 沙漏倒计时（§14）：沙量按剩余比例变化，细流用 SMIL 常驻动画（低 CPU）
import { computed } from 'vue'
import { prefersReducedMotion } from '../motion'
const reduced = prefersReducedMotion

const props = defineProps<{ remainingMs: number | null; totalMs: number }>()

const ratio = computed(() => {
  const ms = props.remainingMs ?? props.totalMs
  if (props.totalMs <= 0) return 1
  return Math.min(1, Math.max(0, ms / props.totalMs))
})

const TOP_APEX = 78
const TOP_H = 56 // 上锥高度
const BOT_BASE = 140
// 上锥剩余沙：从锥底(顶点)向上堆积
const topSand = computed(() => ({
  y: TOP_APEX - ratio.value * TOP_H,
  height: ratio.value * TOP_H,
}))
// 下锥已落下沙
const hint = computed(() => {
  const ms = props.remainingMs ?? props.totalMs
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return s === 0 ? `${m} min` : `${m} min ${s} sec`
})
const botFill = computed(() => {
  const h = (1 - ratio.value) * 54
  return { y: BOT_BASE - h, height: h }
})
</script>

<template>
  <div class="hourglass">
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-label="hourglass">
      <defs>
        <clipPath id="hg-top"><path d="M30 22 L90 22 L60 78 Z" /></clipPath>
        <clipPath id="hg-bot"><path d="M60 82 L90 138 L30 138 Z" /></clipPath>
      </defs>
      <!-- 外框 -->
      <rect x="24" y="14" width="72" height="8" rx="3" fill="#8a6d3b" />
      <rect x="24" y="138" width="72" height="8" rx="3" fill="#8a6d3b" />
      <rect x="20" y="18" width="6" height="124" rx="3" fill="#6f5a34" />
      <rect x="94" y="18" width="6" height="124" rx="3" fill="#6f5a34" />
      <!-- 玻璃 -->
      <path d="M30 22 L90 22 L60 78 Z" fill="#1b2942" opacity="0.5" />
      <path d="M60 82 L90 138 L30 138 Z" fill="#1b2942" opacity="0.5" />
      <!-- 上部沙 -->
      <rect x="28" :y="topSand.y" width="64" :height="topSand.height" fill="#ffd27a" clip-path="url(#hg-top)" />
      <!-- 下部沙 -->
      <rect x="28" :y="botFill.y" width="64" :height="botFill.height" fill="#ffd27a" clip-path="url(#hg-bot)" />
      <!-- 中间细流 -->
      <rect x="58.5" y="78" width="3" height="60" fill="#ffd27a" opacity="0.9">
        <animate v-if="!reduced" attributeName="opacity" values="0.9;0.4;0.9" dur="0.9s" repeatCount="indefinite" />
      </rect>
    </svg>
    <div class="hourglass-hint">{{ hint }}</div>
  </div>
</template>
