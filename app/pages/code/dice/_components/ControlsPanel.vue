<script setup lang="ts">
import type { RollMode } from '../_utils/types'

type Props = {
  threshold: number
  multiplier: number
  winChance: number
}

const { threshold, multiplier, winChance } = defineProps<Props>()

const mode = defineModel<RollMode>('mode')

const toggleMode = () => {
  mode.value = mode.value === 'under' ? 'over' : 'under'
}
</script>

<template>
  <div class="panel">
    <div class="control-panel">
      <div class="control-item">
        <div class="control-label">Multiplier</div>
        <div class="control-value">{{ multiplier.toFixed(4) }}</div>
      </div>
      <div class="control-item">
        <div class="control-label">Roll {{ mode }}</div>
        <button class="control-value toggle" @click="toggleMode">
          <span>{{ threshold.toFixed(2) }}</span>
          <span>↻</span>
        </button>
      </div>
      <div class="control-item">
        <div class="control-label">Win Chance</div>
        <div class="control-value">{{ winChance.toFixed(2) }}%</div>
      </div>
    </div>
    <div class="panel-footer">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="m1.176 3.27.237 5.245c.115 2.557 1.66 4.852 4.036 5.997l1.324.638a2.84
            2.84 0 0 0 2.454 0l1.324-.638c2.376-1.145 3.92-3.44 4.036-5.997l.237-5.245
            c.017-.375-.33-.68-.705-.677a6 6 0 0 1-2.005-.33c-.746-.256-1.593-.726-2.324-1.184
            a3.41 3.41 0 0 0-3.58 0c-.73.458-1.578.928-2.324 1.184a6 6 0 0 1-2.005.33
            c-.375-.004-.722.302-.705.677m10.4 3.193a.952.952 0 0 0-1.497-1.177L7.025 9.172
            L5.782 8.136A.952.952 0 1 0 4.562 9.6l1.997 1.663a.95.95 0 0 0 1.358-.143z"
          clip-rule="evenodd"
        />
      </svg>
      Provably Fair
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.control-panel {
  @apply flex items-center justify-between gap-4;
}

.control-item {
  @apply w-full;
}

.control-label {
  @apply text-xs uppercase tracking-widest text-slate-400;
}

.control-value {
  @apply flex items-center justify-between gap-1;
  @apply w-full h-12 pl-4 pr-1 mt-2;
  @apply bg-slate-600 text-left;
  @apply border-2 border-transparent rounded-xl;
}
.control-value.toggle {
  @apply py-2;
  @apply cursor-pointer;

  span:last-child {
    @apply text-slate-400;
    @apply py-2 px-3;
    @apply rounded-lg bg-slate-700 text-sm text-slate-300;
  }

  &:hover span:last-child {
    @apply bg-slate-800;
  }
}

.panel-footer {
  @apply flex items-center justify-end gap-2;
  @apply p-2 pt-8;
  @apply text-slate-500 tracking-widest;

  svg {
    @apply w-5 h-5;
  }
}
</style>
