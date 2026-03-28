<script setup lang="ts">
import { MAX_BET, MIN_BET } from '../_utils/const'
import { roundToCents } from '../_utils/helpers'

const props = defineProps<{
  balance: number
  multiplier: number
  isRolling: boolean
}>()

const emit = defineEmits<{
  roll: []
}>()

const betAmount = defineModel<number>('betAmount', {
  type: Number,
  required: true,
})

const maxAllowedBet = computed(() => Math.min(props.balance, MAX_BET))

const betInput = computed({
  get: () => betAmount.value,
  set: (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      betAmount.value = 0
      return
    }

    betAmount.value = Math.min(roundToCents(value), maxAllowedBet.value)
  },
})

const profitOnWin = computed(() => betAmount.value * (props.multiplier - 1))

const isBetTooHigh = computed(() => betAmount.value > maxAllowedBet.value)

const isRollDisabled = computed(
  () => props.isRolling || betAmount.value < MIN_BET || isBetTooHigh.value
)

/** Halve the bet, keeping at least MIN_BET. */
const handleClickHalve = () => {
  betAmount.value = Math.max(MIN_BET, roundToCents(betAmount.value / 2))
}

const handleClickDouble = () => {
  betAmount.value = Math.min(
    roundToCents(betAmount.value * 2),
    maxAllowedBet.value
  )
}

const handleClickMax = () => {
  betAmount.value = maxAllowedBet.value
}
</script>

<template>
  <section class="panel">
    <div class="panel__balance">
      <span class="panel__label">Balance</span>
      <span>{{ balance.toFixed(2) }}</span>
    </div>

    <div class="panel__bet">
      <label class="panel__label mb-2">Bet Amount</label>

      <div
        class="panel__bet-input"
        :class="{ 'panel__bet-input--error': isBetTooHigh }"
      >
        <input
          v-model.number="betInput"
          type="number"
          inputmode="decimal"
          placeholder="0.00"
          :min="MIN_BET"
          :max="MAX_BET"
          step="0.01"
        />

        <button type="button" @click="handleClickHalve">½</button>
        <button type="button" @click="handleClickDouble">2x</button>
        <button type="button" @click="handleClickMax">MAX</button>
      </div>
    </div>

    <div class="panel__profit">
      <span class="panel__label">Profit on Win</span>
      <span>{{ profitOnWin.toFixed(2) }}</span>
    </div>

    <button
      type="button"
      class="panel__roll-button"
      :disabled="isRollDisabled"
      @click="emit('roll')"
    >
      {{ isRolling ? 'Rolling...' : 'Roll Dice' }}
    </button>
  </section>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.panel {
  @apply flex flex-col gap-6;
  @apply p-4;
  @apply bg-slate-700 text-slate-100;
}

.panel__label {
  @apply block;
  @apply text-xs uppercase tracking-widest text-slate-400;
}

.panel__balance {
  @apply flex items-center justify-between gap-4;
  @apply text-sm font-medium;
}

.panel__bet-input {
  @apply flex items-center gap-2 pr-2;
  @apply bg-slate-600;
  @apply border-2 border-transparent rounded-xl;
  @apply transition-colors duration-200;

  &:focus-within {
    @apply border-2;
    @apply border-emerald-500;
  }

  &.panel__bet-input--error,
  &.panel__bet-input--error:focus-within {
    @apply border-red-500;
  }

  input {
    @apply grow min-w-0 p-4;
    @apply border-0 bg-transparent shadow-none outline-none;
    @apply appearance-none focus:border-0 focus:ring-0;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  input[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  button {
    @apply py-2 px-3;
    @apply rounded-lg bg-slate-700 text-sm text-slate-300;
    @apply cursor-pointer;

    @apply hover:bg-slate-800;
  }
}

.panel__profit {
  @apply flex items-center justify-center gap-4;
  @apply mt-auto;
  @apply text-sm font-medium;
}

.panel__roll-button {
  @apply block w-full p-4;
  @apply rounded-xl cursor-pointer;
  @apply bg-emerald-500 font-semibold text-slate-100;
  @apply transition-colors duration-200;

  @apply hover:bg-emerald-400;

  @apply disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400;
}
</style>
