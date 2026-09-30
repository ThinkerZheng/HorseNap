<script setup lang="ts">
// 展示版式（§14）：顶部标题/副标题；下方左图 / 右(倒计时上 + 理由下)
// 预览与全屏共用同一组件，保证所见即所得
import ShowImage from './ShowImage.vue'
import DigitalCountdown from './DigitalCountdown.vue'
import HourglassCountdown from './HourglassCountdown.vue'
import StarField from './StarField.vue'
import type { HorseNapConfig } from '../types'

const props = defineProps<{
  title: string
  subtitle: string
  reasonResolved: string
  image: HorseNapConfig['image']
  countdownStyle: 'digital' | 'hourglass'
  remainingMs: number | null
  totalMs: number
  finished: boolean
  full: boolean
}>()
</script>

<template>
  <div class="stage" :class="{ 'stage--full': props.full }">
    <StarField />
    <header class="stage-head">
      <h1 class="stage-title">{{ props.title }}</h1>
      <p class="stage-subtitle">{{ props.subtitle }}</p>
    </header>

    <main class="stage-body">
      <section class="stage-image">
        <ShowImage :image="props.image" />
      </section>
      <section class="stage-right">
        <div class="stage-countdown">
          <DigitalCountdown v-if="props.countdownStyle === 'digital'" :remaining-ms="props.remainingMs" :total-ms="props.totalMs" />
          <HourglassCountdown v-else :remaining-ms="props.remainingMs" :total-ms="props.totalMs" />
        </div>
        <div class="stage-reason">{{ props.reasonResolved }}</div>
      </section>
    </main>

    <div v-if="props.finished" class="stage-finished">
      <div class="stage-finished-badge">✅</div>
      <div class="stage-finished-text">{{ $t('display.finished') }}</div>
    </div>

    <div v-if="props.full" class="stage-hint">⌨ {{ $t('display.keyHint') }}</div>
  </div>
</template>
