<script setup lang="ts">
// 文案编辑：标题 / 副标题 / 理由（§10 / §11）
// 直接绑定 config；保存由 store 的深度 watch 防抖触发；此处仅同步 contentModified
import { config } from '../store'
import { syncModifiedFlag } from '../display'

function onEdit() {
  syncModifiedFlag()
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">{{ $t('text.title') }}</div>

    <label class="label">{{ $t('text.title') }}</label>
    <input v-model="config.title" :placeholder="$t('text.placeholderTitle')" maxlength="60" @input="onEdit" />

    <label class="label" style="margin-top: 12px">{{ $t('text.subtitle') }}</label>
    <input v-model="config.subtitle" :placeholder="$t('text.placeholderSubtitle')" maxlength="80" @input="onEdit" />

    <label class="label" style="margin-top: 12px">{{ $t('text.reason') }}</label>
    <textarea v-model="config.reason" :placeholder="$t('text.placeholderReason')" rows="4" @input="onEdit"></textarea>
    <p class="hint">{{ $t('text.reasonHint') }}</p>
  </div>
</template>
