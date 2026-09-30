<script setup lang="ts">
// 展示图片：预设 SVG 或用户导入图片（经 asset: 协议加载，§13 / §23）
import { computed } from 'vue'
import { convertFileSrc } from '@tauri-apps/api/core'
import HorseSvg from './HorseSvg.vue'
import CatSvg from './CatSvg.vue'
import type { HorseNapConfig } from '../types'

const props = defineProps<{ image: HorseNapConfig['image'] }>()

const isPreset = computed(() => props.image.type === 'preset')
const presetId = computed(() => props.image.id ?? 'horse')
const customSrc = computed(() =>
  props.image.type === 'custom' && props.image.path ? convertFileSrc(props.image.path) : '',
)
</script>

<template>
  <div class="show-image">
    <HorseSvg v-if="isPreset && presetId === 'horse'" />
    <CatSvg v-else-if="isPreset && presetId === 'cat'" />
    <img v-else-if="customSrc" :src="customSrc" alt="" draggable="false" />
    <HorseSvg v-else />
  </div>
</template>
