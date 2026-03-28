<script setup lang="ts">
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

const betInput = computed({
  get: () => betAmount.value,
  set: (value: number) =>
    value ? (betAmount.value = value) : (betAmount.value = 0),
})

const profitOnWin = computed(() => betAmount.value * (props.multiplier - 1))

const isOverBalance = computed(() => betAmount.value > props.balance)

const isRollDisabled = computed(
  () =>
    props.isRolling || betAmount.value <= 0 || betAmount.value > props.balance
)

const handleClickHalve = () => {
  if (betAmount.value / 2 > props.balance) {
    betAmount.value = props.balance
    return
  }
  betAmount.value = Math.round((betAmount.value / 2) * 100) / 100
}

const handleClickDouble = () => {
  if (betAmount.value * 2 > props.balance) {
    betAmount.value = props.balance
    return
  }
  betAmount.value = betAmount.value * 2
}

const handleClickMax = () => {
  betAmount.value = props.balance
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
        :class="{ 'panel__bet-input--error': isOverBalance }"
      >
        <input
          v-model.number="betInput"
          type="number"
          inputmode="decimal"
          placeholder="0.00"
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
