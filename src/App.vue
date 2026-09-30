<script setup lang="ts">
// 根组件：按 URL 参数区分「展示窗口」与「主窗口」
import { isDisplayWindow } from './display'
import MainView from './components/MainView.vue'
import DisplayView from './components/DisplayView.vue'

const display = isDisplayWindow()
</script>

<template>
  <DisplayView v-if="display" />
  <MainView v-else />
</template>
