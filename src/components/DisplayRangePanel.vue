<script setup lang="ts">
// 显示范围：全部 / 指定显示器（§19.4）
import { ref, onMounted } from 'vue'
import { availableMonitors } from '@tauri-apps/api/window'
import { config } from '../store'

interface MonitorInfo {
  name: string
  index: number
  width: number
  height: number
}

const monitors = ref<MonitorInfo[]>([])
const loading = ref(false)

async function refresh() {
  loading.value = true
  try {
    const list = await availableMonitors()
    monitors.value = list.map((m, i) => ({
      name: m.name || `Monitor ${i + 1}`,
      index: i,
      width: m.size.width,
      height: m.size.height,
    }))
  } finally {
    loading.value = false
  }
}

function toggleMonitor(name: string) {
  const set = new Set(config.display.monitorIds ?? [])
  if (set.has(name)) set.delete(name)
  else set.add(name)
  config.display.monitorIds = [...set]
}

onMounted(refresh)
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      {{ $t('display.range') }}
      <button class="mini" @click="refresh">⟳</button>
    </div>

    <div class="segmented">
      <button class="seg" :class="{ active: config.display.mode === 'all' }" @click="config.display.mode = 'all'">
        {{ $t('display.rangeAll') }}
      </button>
      <button class="seg" :class="{ active: config.display.mode === 'specific' }" @click="config.display.mode = 'specific'">
        {{ $t('display.rangeSpecific') }}
      </button>
    </div>

    <div v-if="config.display.mode === 'specific'" class="monitor-list">
      <label v-for="m in monitors" :key="m.name" class="monitor-item">
        <input
          type="checkbox"
          :checked="config.display.monitorIds?.includes(m.name)"
          @change="toggleMonitor(m.name)"
        />
        <span class="monitor-name">{{ m.name }}</span>
        <span class="monitor-dim">{{ m.width }}×{{ m.height }}</span>
      </label>
      <p v-if="!monitors.length" class="hint">{{ $t('display.noMonitor') }}</p>
    </div>
  </div>
</template>
