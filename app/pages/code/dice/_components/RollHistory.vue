<script setup lang="ts">
import type { RollResult } from '../_utils/types'

type Props = {
  history: RollResult[]
}

const { history } = defineProps<Props>()

const historyViewportRef = ref<HTMLElement | null>(null)
const visibleItemsCount = ref(1)
let resizeObserver: ResizeObserver | null = null

const visibleHistory = computed(() => history.slice(-visibleItemsCount.value))

const updateVisibleItemsCount = () => {
  const viewportEl = historyViewportRef.value
  if (!viewportEl) return

  const CHIP_WIDTH = 40 // hardcoded in CSS, adjust if you change it there
  const GAP_WIDTH = 8 // hardcoded in CSS, adjust if you change it there
  const count = Math.floor(
    (viewportEl.clientWidth + 2 * GAP_WIDTH) / (CHIP_WIDTH + GAP_WIDTH)
  )

  visibleItemsCount.value = Math.max(1, count - 1) // Leave 1 slot empty for animations
}

onMounted(() => {
  updateVisibleItemsCount()

  resizeObserver = new ResizeObserver(updateVisibleItemsCount)

  if (!historyViewportRef.value) return

  resizeObserver.observe(historyViewportRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="historyViewportRef" class="history-viewport">
    <TransitionGroup name="history" tag="div" class="history-wrap">
      <div
        v-for="item in visibleHistory"
        :key="item.id"
        class="history-chip"
        :aria-label="`${item.result.toFixed(2)} — ${item.isWin ? 'win' : 'loss'}`"
        :class="item.isWin ? 'text-emerald-300' : 'text-slate-300'"
      >
        {{ item.result.toFixed(2) }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.history-viewport {
  @apply w-full min-w-0 overflow-hidden;
}

.history-wrap {
  @apply flex items-center justify-end;
  @apply gap-2; /* adjust js calculation if you change this */
  @apply w-full h-8;
}

.history-chip {
  @apply w-10; /* adjust js calculation if you change this */
  @apply text-sm font-medium;
  @apply text-center;
}

.history-enter-active,
.history-leave-active,
.history-move {
  @apply transition-all duration-300 ease-in-out;
}

.history-enter-from {
  @apply opacity-0;
  @apply scale-5;
}

.history-leave-to {
  @apply opacity-0;
  @apply -translate-x-4 scale-50;
}
</style>
