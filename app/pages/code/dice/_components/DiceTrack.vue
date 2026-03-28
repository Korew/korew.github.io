<script setup lang="ts">
import ThresholdMarker from './ThresholdMarker.vue'

import { clamp, roundToCents } from '../_utils/helpers'
import { MIN_WIN_CHANCE, MAX_WIN_CHANCE } from '../_utils/const'
import type { RollMode, RollResult } from '../_utils/types'

const props = defineProps<{
  mode: RollMode
  result?: RollResult
  isRolling?: boolean
}>()

const threshold = defineModel<number>('threshold', {
  type: Number,
  required: true,
})

const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const markers = [0, 25, 50, 75, 100] as const

/** Arrow-key step sizes for keyboard navigation of the threshold slider. */
const KEYBOARD_STEP = 0.5
const KEYBOARD_BIG_STEP = 5
const KEYBOARD_SMALL_STEP = 0.01

const BOUNDS = {
  under: { min: MIN_WIN_CHANCE, max: MAX_WIN_CHANCE },
  over: { min: 100 - MAX_WIN_CHANCE, max: 100 - MIN_WIN_CHANCE },
}

const bounds = computed(() => BOUNDS[props.mode])

const trackFill = computed(() => {
  const c1 = '#00d492'
  const c2 = '#ff6467'
  const p = threshold.value
  if (props.mode === 'under') {
    return `linear-gradient(90deg, ${c1} 0%, ${c1} ${p}%, ${c2} ${p}%, ${c2} 100%)`
  }
  return `linear-gradient(90deg, ${c2} 0%, ${c2} ${p}%, ${c1} ${p}%, ${c1} 100%)`
})

const percentFromClientX = (clientX: number) => {
  if (!trackRef.value) return threshold.value
  const { min, max } = bounds.value
  const rect = trackRef.value.getBoundingClientRect()
  const raw = ((clientX - rect.left) / rect.width) * 100
  return clamp(raw, min, max)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return
  // Round during drag to avoid sub-cent floating-point noise in the display.
  threshold.value = roundToCents(percentFromClientX(event.clientX))
}

const stopDragging = () => {
  isDragging.value = false
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', stopDragging)
}

const startDragging = (event: PointerEvent) => {
  if (props.isRolling) return

  event.preventDefault()
  isDragging.value = true
  threshold.value = roundToCents(percentFromClientX(event.clientX))
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopDragging)
}

/**
 * Keyboard handler that lets users adjust the threshold using arrow keys.
 * - Arrow Left / Arrow Down: decrease by KEYBOARD_STEP
 * - Arrow Right / Arrow Up: increase by KEYBOARD_STEP
 * - Hold Shift for KEYBOARD_BIG_STEP jumps
 * - Hold Alt for KEYBOARD_SMALL_STEP jumps
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (props.isRolling) return

  const { min, max } = bounds.value
  let delta = 0

  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    delta = event.shiftKey
      ? -KEYBOARD_BIG_STEP
      : event.altKey
        ? -KEYBOARD_SMALL_STEP
        : -KEYBOARD_STEP
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    delta = event.shiftKey
      ? KEYBOARD_BIG_STEP
      : event.altKey
        ? KEYBOARD_SMALL_STEP
        : KEYBOARD_STEP
  } else {
    return
  }

  event.preventDefault()
  threshold.value = clamp(roundToCents(threshold.value + delta), min, max)
}

watch(
  () => props.mode,
  () => {
    const { min, max } = bounds.value
    threshold.value = clamp(100 - threshold.value, min, max)
  }
)

onBeforeUnmount(() => {
  stopDragging()
})
</script>

<template>
  <div
    ref="trackRef"
    role="slider"
    tabindex="0"
    class="track-container"
    :class="{ 'track-container--disabled': isRolling }"
    :aria-valuemin="bounds.min"
    :aria-valuemax="bounds.max"
    :aria-valuenow="threshold"
    :aria-label="`Threshold: roll ${mode} ${threshold.toFixed(2)}`"
    :aria-disabled="isRolling"
    @pointerdown="startDragging"
    @keydown="handleKeydown"
  >
    <!-- Colour-coded gradient: green = win zone, red = loss zone -->
    <div class="track-gradient" :style="{ background: trackFill }" />

    <!-- Dot markers (inset to account for circle) -->
    <div class="dots-track">
      <div
        v-for="(marker, index) in markers"
        :key="marker"
        class="dots-item"
        :style="{ left: `${(index / (markers.length - 1)) * 100}%` }"
      />
    </div>

    <!-- Result marker -->
    <div v-if="result?.result !== undefined" class="result-track">
      <div
        class="result-marker"
        :class="result.isWin ? 'result-bubble--win' : 'result-bubble--lose'"
        :style="{ left: `${result.result}%` }"
      >
        {{ result.result.toFixed(2) }}
      </div>
    </div>

    <!-- Threshold marker -->
    <div class="threshold-track">
      <ThresholdMarker :threshold :is-dragging />
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.track-container {
  @apply relative h-10;
  @apply rounded-full border-2 border-white/20;
  @apply cursor-pointer touch-none;
}

.track-container--disabled {
  @apply cursor-not-allowed;
}

.track-gradient {
  @apply absolute inset-1.25;
  @apply rounded-full;
}

.dots-track {
  @apply absolute left-5 right-5;
  @apply top-1/2 -translate-y-1/2;
  @apply h-2;
}

.dots-item {
  @apply absolute -translate-x-1/2;
  @apply h-2 w-2;
  @apply rounded-full bg-slate-900;
}

.result-track {
  @apply absolute top-0 left-5 right-5;
}

.result-marker {
  @apply absolute bottom-[calc(100%+.875rem)];
  @apply -translate-x-1/2;
  @apply px-3 py-2;
  @apply rounded-md text-sm font-semibold text-slate-900;
  transition: left 750ms cubic-bezier(0.18, 1.18, 0.32, 1);

  &::after {
    content: '';
    @apply absolute -bottom-1.25;
    @apply left-1/2 -translate-x-1/2;
    @apply w-2.5 h-2.5;
    @apply bg-inherit rotate-45;
  }
}

.result-bubble--win {
  @apply bg-emerald-400;
}

.result-bubble--lose {
  @apply bg-red-400;
}

.threshold-track {
  @apply absolute top-1/2 left-5 right-5;
  @apply -translate-y-1/2;
}
</style>
