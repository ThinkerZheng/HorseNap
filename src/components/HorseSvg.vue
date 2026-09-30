<script setup lang="ts">
// 内置预设：睡觉的白马（§3.1 image.preset 'horse'）
// 声明式 SMIL 动画：呼吸起伏 + Zzz 飘动，无常驻 JS 循环（§18 低 CPU）
</script>

<template>
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sleeping horse" preserveAspectRatio="xMidYMid meet">
    <!-- 地面阴影 -->
    <ellipse cx="200" cy="252" rx="150" ry="20" fill="#000" opacity="0.18" />

    <!-- 身体（呼吸缩放） -->
    <g>
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1 1; 1.015 1.03; 1 1"
        keyTimes="0;0.5;1"
        dur="4s"
        repeatCount="indefinite"
        additive="sum"
        transform-origin="200 220"
      />
      <!-- 蜷卧的身体 -->
      <ellipse cx="190" cy="205" rx="130" ry="60" fill="#f7f7fb" stroke="#d8d8e6" stroke-width="3" />
      <!-- 后腿 tucked -->
      <path d="M90 235 q-18 6 -30 -2 q10 -14 30 -12 z" fill="#eeeeF5" stroke="#d8d8e6" stroke-width="2" />
      <!-- 颈部 + 头 -->
      <path
        d="M300 200 q40 -10 48 -55 q4 -30 -22 -40 q-30 -12 -55 8 q-18 14 -22 40 q-4 30 6 47 z"
        fill="#f7f7fb"
        stroke="#d8d8e6"
        stroke-width="3"
      />
      <!-- 耳朵 -->
      <path d="M300 118 l-6 -30 l24 16 z" fill="#f0f0f8" stroke="#d8d8e6" stroke-width="2" />
      <path d="M330 112 l10 -26 l6 28 z" fill="#f0f0f8" stroke="#d8d8e6" stroke-width="2" />
      <!-- 鬃毛（淡蓝紫，安静感） -->
      <path d="M300 92 q-30 20 -40 60 q-8 34 -2 60 q14 -30 20 -66 q6 -34 22 -54 z" fill="#c9d4f2" />
      <path d="M262 150 q-14 26 -14 56 q12 -22 22 -46 z" fill="#b9c7ee" />
      <!-- 闭眼（安详弧线） -->
      <path d="M320 150 q12 8 24 0" fill="none" stroke="#5a5a72" stroke-width="3" stroke-linecap="round" />
      <!-- 鼻孔 -->
      <ellipse cx="352" cy="176" rx="4" ry="6" fill="#c7c7d6" />
      <!-- 微笑 -->
      <path d="M340 190 q10 6 20 2" fill="none" stroke="#9a9ab0" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Zzz 飘动 -->
    <g fill="#9fb0d0" font-family="'Segoe UI', sans-serif" font-weight="700">
      <text x="330" y="80" font-size="20" opacity="0">Z
        <animate attributeName="opacity" values="0;0.9;0" dur="3s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 10 -30" dur="3s" repeatCount="indefinite" />
      </text>
      <text x="350" y="60" font-size="26" opacity="0">Z
        <animate attributeName="opacity" values="0;0.9;0" dur="3s" begin="0.6s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 12 -34" dur="3s" begin="0.6s" repeatCount="indefinite" />
      </text>
      <text x="372" y="40" font-size="32" opacity="0">z
        <animate attributeName="opacity" values="0;0.9;0" dur="3s" begin="1.2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 14 -38" dur="3s" begin="1.2s" repeatCount="indefinite" />
      </text>
    </g>
  </svg>
</template>
