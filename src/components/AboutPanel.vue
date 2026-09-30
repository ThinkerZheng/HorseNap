<script setup lang="ts">
// 关于（§26 元信息）：外链交 Rust open_url 走系统浏览器（WebView 内 target=_blank 无效）
import { invoke } from '@tauri-apps/api/core'
const VERSION = '0.1.0'
const GITHUB = 'https://github.com/homenap/homenap'
function openGithub() {
  invoke('open_url', { url: GITHUB }).catch(() => undefined)
}
</script>

<template>
  <div class="panel about">
    <div class="panel-title">{{ $t('sidebar.about') }}</div>
    <p class="about-intro">{{ $t('about.intro') }}</p>
    <div class="about-row"><span>{{ $t('about.version') }}</span><b>{{ VERSION }}</b></div>
    <div class="about-row"><span>{{ $t('about.license') }}</span><b>MIT</b></div>
    <div class="about-row">
      <span>{{ $t('about.github') }}</span>
      <button class="link-btn" @click="openGithub">homenap/homenap ↗</button>
    </div>
  </div>
</template>