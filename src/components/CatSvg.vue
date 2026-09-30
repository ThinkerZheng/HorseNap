<script setup lang="ts">
// 内置预设：睡觉的橘猫（§3.1 image.preset 'cat'）
// 蜷缩成一团的橘色虎斑猫，呼吸起伏 + 尾巴轻摆 + Zzz
import { prefersReducedMotion } from '../motion'
const reduced = prefersReducedMotion
</script>

<template>
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sleeping cat" preserveAspectRatio="xMidYMid meet">
    <ellipse cx="200" cy="252" rx="140" ry="20" fill="#000" opacity="0.18" />

    <!-- 身体团（呼吸） -->
    <g>
      <animateTransform v-if="!reduced"
        attributeName="transform"
        type="scale"
        values="1 1; 1.02 1.03; 1 1"
        keyTimes="0;0.5;1"
        dur="3.6s"
        repeatCount="indefinite"
        additive="sum"
        transform-origin="200 210"
      />
      <!-- 蜷缩身体 -->
      <circle cx="200" cy="200" r="95" fill="#f2a65a" stroke="#d9853f" stroke-width="3" />
      <!-- 虎斑条纹 -->
      <path d="M150 130 q10 20 6 40" fill="none" stroke="#e08b3e" stroke-width="8" stroke-linecap="round" />
      <path d="M185 120 q6 24 4 44" fill="none" stroke="#e08b3e" stroke-width="8" stroke-linecap="round" />
      <path d="M222 122 q-2 24 2 44" fill="none" stroke="#e08b3e" stroke-width="8" stroke-linecap="round" />
      <path d="M256 134 q-10 18 -10 36" fill="none" stroke="#e08b3e" stroke-width="8" stroke-linecap="round" />
      <!-- 肚皮浅色 -->
      <ellipse cx="200" cy="235" rx="60" ry="30" fill="#fbe0c3" />

      <!-- 尾巴环绕（轻摆） -->
      <path d="M285 235 q55 -8 40 -60 q-8 -28 -40 -30" fill="none" stroke="#e08b3e" stroke-width="18" stroke-linecap="round">
        <animate v-if="!reduced" attributeName="d"
          values="M285 235 q55 -8 40 -60 q-8 -28 -40 -30; M285 235 q60 -4 48 -58 q-8 -26 -38 -26; M285 235 q55 -8 40 -60 q-8 -28 -40 -30"
          dur="5s" repeatCount="indefinite" />
      </path>

      <!-- 头（趴在身前） -->
      <g>
        <circle cx="150" cy="205" r="52" fill="#f4b26e" stroke="#d9853f" stroke-width="3" />
        <!-- 耳朵 -->
        <path d="M110 172 l-6 -34 l32 18 z" fill="#f2a65a" stroke="#d9853f" stroke-width="2" />
        <path d="M185 168 l20 -28 l6 32 z" fill="#f2a65a" stroke="#d9853f" stroke-width="2" />
        <path d="M116 170 l-2 -16 l15 9 z" fill="#f6c9d6" />
        <path d="M186 168 l10 -14 l2 16 z" fill="#f6c9d6" />
        <!-- 闭眼 -->
        <path d="M128 205 q10 8 20 0" fill="none" stroke="#7a4a1e" stroke-width="3" stroke-linecap="round" />
        <path d="M162 205 q10 8 20 0" fill="none" stroke="#7a4a1e" stroke-width="3" stroke-linecap="round" />
        <!-- 鼻子 + 嘴 -->
        <path d="M148 218 l6 0 l-3 5 z" fill="#e56b8a" />
        <path d="M151 223 q-8 8 -16 4 M151 223 q8 8 16 4" fill="none" stroke="#7a4a1e" stroke-width="2.5" stroke-linecap="round" />
        <!-- 胡须 -->
        <path d="M110 216 l-26 -6 M110 224 l-26 6" stroke="#c98b5a" stroke-width="2" stroke-linecap="round" />
        <path d="M190 216 l26 -6 M190 224 l26 6" stroke="#c98b5a" stroke-width="2" stroke-linecap="round" />
      </g>
    </g>

    <!-- Zzz -->
    <g fill="#9fb0d0" font-family="'Segoe UI', sans-serif" font-weight="700">
      <text x="210" y="90" font-size="20" :opacity="reduced ? 0.7 : 0">Z
        <animate v-if="!reduced" attributeName="opacity" values="0;0.9;0" dur="2.8s" repeatCount="indefinite" />
        <animateTransform v-if="!reduced" attributeName="transform" type="translate" values="0 0; 10 -28" dur="2.8s" repeatCount="indefinite" />
      </text>
      <text x="232" y="70" font-size="26" :opacity="reduced ? 0.6 : 0">Z
        <animate v-if="!reduced" attributeName="opacity" values="0;0.9;0" dur="2.8s" begin="0.5s" repeatCount="indefinite" />
        <animateTransform v-if="!reduced" attributeName="transform" type="translate" values="0 0; 12 -30" dur="2.8s" begin="0.5s" repeatCount="indefinite" />
      </text>
      <text x="256" y="50" font-size="30" :opacity="reduced ? 0.5 : 0">z
        <animate v-if="!reduced" attributeName="opacity" values="0;0.9;0" dur="2.8s" begin="1s" repeatCount="indefinite" />
        <animateTransform v-if="!reduced" attributeName="transform" type="translate" values="0 0; 14 -34" dur="2.8s" begin="1s" repeatCount="indefinite" />
      </text>
    </g>
  </svg>
</template>
