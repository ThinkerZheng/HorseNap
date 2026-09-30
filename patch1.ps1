$ErrorActionPreference = 'Stop'
function Patch($path, $pairs) {
  $t = [System.IO.File]::ReadAllText($path)
  foreach ($p in $pairs) {
    if (-not $t.Contains($p[0])) { Write-Warning "miss: $($p[0].Substring(0, [Math]::Min(60, $p[0].Length)))"; continue }
    $t = $t.Replace($p[0], $p[1])
  }
  [System.IO.File]::WriteAllText($path, $t, [System.Text.UTF8Encoding]::new($false))
  Write-Host "patched $path"
}

$base = 'd:\dev\code\AIProject\HorseNap'

Patch "$base\src\components\DisplayStage.vue" @(
  ,@("import HourglassCountdown from './HourglassCountdown.vue'", "import HourglassCountdown from './HourglassCountdown.vue'`r`nimport StarField from './StarField.vue'")
  ,@('<div class="stage" :class="{ ''stage--full'': props.full }">', "<div class=`"stage`" :class=`"{ 'stage--full': props.full }`">`r`n    <StarField />")
)

Patch "$base\src\components\HourglassCountdown.vue" @(
  ,@("import { computed } from 'vue'", "import { computed } from 'vue'`r`nimport { prefersReducedMotion } from '../motion'`r`nconst reduced = prefersReducedMotion")
  ,@('<animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.9s" repeatCount="indefinite" />', '<animate v-if="!reduced" attributeName="opacity" values="0.9;0.4;0.9" dur="0.9s" repeatCount="indefinite" />')
  ,@('<div class="hourglass-hint">{{ Math.max(1, Math.ceil((remainingMs ?? totalMs) / 60000)) }} min</div>', '<div class="hourglass-hint">{{ hint }}</div>')
  ,@('const botFill = computed(() => {', "const hint = computed(() => {`r`n  const ms = props.remainingMs ?? props.totalMs`r`n  const total = Math.max(0, Math.ceil(ms / 1000))`r`n  const m = Math.floor(total / 60)`r`n  const s = total % 60`r`n  return s === 0 ? `` `${m} min` : `${m} min ${s} sec` ``.replace(/``/g, '')`r`n})`r`nconst botFill = computed(() => {")
)
