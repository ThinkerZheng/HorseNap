<script setup lang="ts">
// 全屏展示窗口（display=1）：接收主窗口广播的快照，本地秒级刷新倒计时
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { snapshot, resolveReason } from '../display'
import DisplayStage from './DisplayStage.vue'

const now = ref(Date.now())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 500)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

const totalMs = computed(() => (snapshot.value?.durationMinutes ?? 0) * 60_000)
const deadline = computed(() => snapshot.value?.deadlineMs ?? null)
const remainingMs = computed(() => {
  if (deadline.value == null) return null
  return Math.max(0, deadline.value - now.value)
})
const finished = computed(() => deadline.value != null && now.value >= deadline.value)

const reasonResolved = computed(() => {
  const s = snapshot.value
  if (!s) return ''
  return resolveReason(s.reason, s.durationMinutes, s.locale)
})
</script>

<template>
  <div class="screen">
    <DisplayStage
      v-if="snapshot"
      :title="snapshot.title"
      :subtitle="snapshot.subtitle"
      :reason-resolved="reasonResolved"
      :image="snapshot.image"
      :countdown-style="snapshot.countdownStyle"
      :remaining-ms="remainingMs"
      :total-ms="totalMs"
      :finished="finished"
      :full="true"
    />
  </div>
</template>
