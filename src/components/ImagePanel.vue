<script setup lang="ts">
// 图片：预设 或 拖拽导入自定义图片（§13 / §23）
// 通过原生拖放获取真实文件路径，交 Rust import_image 做魔数校验 / 清洗 / 落盘
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { open } from '@tauri-apps/plugin-dialog'
import { useI18n } from 'vue-i18n'
import { config } from '../store'
import { syncModifiedFlag } from '../display'
import ShowImage from './ShowImage.vue'
import type { HorseNapConfig } from '../types'

const { t } = useI18n()
const dragging = ref(false)
const error = ref('')
let unlisten: (() => void) | undefined

function setPreset(id: string) {
  error.value = ''
  config.image = { type: 'preset', id }
  syncModifiedFlag()
}

function mapError(code: string): string {
  if (code.startsWith('type:')) return t('image.unsupported')
  if (code.startsWith('size:')) return t('image.tooLarge')
  if (code.startsWith('sanitize:')) return t('image.sanitizeFailed')
  return t('image.importFailed')
}

async function importPath(source: string) {
  error.value = ''
  try {
    const res = await invoke<{ path: string }>('import_image', { source })
    config.image = { type: 'custom', path: res.path } satisfies HorseNapConfig['image']
    syncModifiedFlag()
    // 清理旧的孤儿图片，保留当前引用（§23）
    invoke('cleanup_images', { keep: res.path }).catch(() => undefined)
  } catch (e) {
    error.value = mapError(String(e))
  }
}

async function chooseFile() {
  try {
    const sel = await open({ multiple: false, filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] }] })
    if (typeof sel === 'string' && sel) void importPath(sel)
  } catch { /* 用户取消 */ }
}
onMounted(async () => {
  const win = getCurrentWebviewWindow()
  const un = await win.onDragDropEvent((event) => {
    const p = event.payload
    if (p.type === 'enter' || p.type === 'over') {
      dragging.value = true
    } else if (p.type === 'leave') {
      dragging.value = false
    } else if (p.type === 'drop') {
      dragging.value = false
      if (p.paths.length) void importPath(p.paths[0])
    }
  })
  unlisten = un
})
onBeforeUnmount(() => unlisten?.())
</script>

<template>
  <div class="panel">
    <div class="panel-title">{{ $t('image.preset') }}</div>

    <div class="img-picker">
      <button class="img-preset" :class="{ active: config.image.type === 'preset' && config.image.id === 'horse' }" @click="setPreset('horse')">
        <ShowImage :image="{ type: 'preset', id: 'horse' }" />
        <span>{{ $t('image.presetHorse') }}</span>
      </button>
      <button class="img-preset" :class="{ active: config.image.type === 'preset' && config.image.id === 'cat' }" @click="setPreset('cat')">
        <ShowImage :image="{ type: 'preset', id: 'cat' }" />
        <span>{{ $t('image.presetCat') }}</span>
      </button>
    </div>

    <div class="dropzone" :class="{ dragging, active: config.image.type === 'custom' }">
      <template v-if="config.image.type === 'custom'">
        <ShowImage :image="config.image" />
        <button class="mini" @click="setPreset('horse')">{{ $t('panel.cancel') }}</button>
      </template>
      <template v-else>
        <div class="dropzone-hint">{{ $t('image.upload') }}</div>
        <div class="dropzone-sub">SVG / PNG / JPG / GIF / WebP</div>
      </template>
    </div>

    <button class="ghost" @click="chooseFile">{{ $t('image.choose') }}</button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>
