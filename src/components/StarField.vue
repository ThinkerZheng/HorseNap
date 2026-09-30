<script setup lang="ts">
// 星空背景（§14 / §25 主题）：少量闪烁小星星 + 月亮
// 纯 CSS 动画；系统开启「减少动态效果」时静止呈现（§29）
const STARS: [number, number, number, number][] = [
  [6, 5, 2, 3.2], [13, 16, 1, 4.1], [21, 4, 2, 2.6], [29, 13, 1, 3.8],
  [37, 7, 2, 3.0], [45, 17, 1, 4.4], [53, 5, 2, 2.8], [61, 12, 1, 3.6],
  [69, 3, 2, 4.0], [77, 15, 1, 3.1], [86, 8, 2, 3.7], [93, 18, 1, 2.9],
  [10, 28, 1, 4.2], [49, 24, 1, 3.3], [82, 27, 2, 3.5],
]
</script>

<template>
  <div class="starfield" aria-hidden="true">
    <span
      v-for="(s, i) in STARS"
      :key="i"
      class="sf-star"
      :style="{
        left: `${s[0]}%`,
        top: `${s[1]}%`,
        width: `${s[2]}px`,
        height: `${s[2]}px`,
        animationDuration: `${s[3]}s`,
        animationDelay: `${-(i % 5) * 0.8}s`,
      }"
    />
    <span class="sf-moon" />
  </div>
</template>
