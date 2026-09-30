<script setup lang="ts">
// 关于（§26 元信息）
const VERSION = '0.1.0'
const GITHUB = 'https://github.com/homenap/homenap'
</script>

<template>
  <div class="panel about">
    <div class="panel-title">{{ $t('sidebar.about') }}</div>
    <p class="about-intro">{{ $t('about.intro') }}</p>
    <div class="about-row"><span>{{ $t('about.version') }}</span><b>{{ VERSION }}</b></div>
    <div class="about-row"><span>{{ $t('about.license') }}</span><b>MIT</b></div>
    <div class="about-row">
      <span>{{ $t('about.github') }}</span>
      <a :href="GITHUB" target="_blank" rel="noreferrer">homenap/homenap</a>
    </div>
  </div>
</template>
