<script setup lang="ts">
// 时长与倒计时样式（§9 / §10 / §19.1）
import { config } from '../store'
import { appState, onDurationChanged, stopTimer } from '../display'
import type { CountdownStyle } from '../types'

const PRESETS = [5, 10, 15, 20, 30, 45, 60]

function setMinutes(v: number) {
  const clamped = Math.min(180, Math.max(1, Math.round(v || 1)))
  config.durationMinutes = clamped
  onDurationChanged(clamped) // Preview 计时中：当前时刻 + 新时长重算（§10）
}

function setStyle(s: CountdownStyle) {
  config.countdown.style = s
}

// 停止计时按钮：仅运行态（preview / displaying / finished）可用
const canStop = () => appState.value !== 'idle'
</script>

<template>
  <div class="panel">
    <div class="panel-title">{{ $t('countdown.duration') }}</div>

    <div class="row">
      <input
        type="number"
        class="dur-input"
        :value="config.durationMinutes"
        min="1"
        max="180"
        @change="setMinutes(($event.target as HTMLInputElement).valueAsNumber)"
      />
      <span class="unit">{{ $t('countdown.minutes') }}</span>
    </div>

    <div class="label" style="margin-top: 10px">{{ $t('countdown.presets') }}</div>
    <div class="preset-row">
      <button
        v-for="p in PRESETS"
        :key="p"
        class="chip"
        :class="{ active: config.durationMinutes === p }"
        @click="setMinutes(p)"
      >
        {{ p }}
      </button>
    </div>

    <div class="label" style="margin-top: 14px">{{ $t('countdown.style') }}</div>
    <div class="segmented">
      <button class="seg" :class="{ active: config.countdown.style === 'digital' }" @click="setStyle('digital')">
        {{ $t('countdown.styleDigital') }}
      </button>
      <button class="seg" :class="{ active: config.countdown.style === 'hourglass' }" @click="setStyle('hourglass')">
        {{ $t('countdown.styleHourglass') }}
      </button>
    </div>

    <button class="danger" :disabled="!canStop()" style="margin-top: 14px" @click="stopTimer">
      {{ $t('countdown.stop') }}
    </button>
  </div>
</template>
