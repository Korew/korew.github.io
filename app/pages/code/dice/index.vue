<script setup lang="ts">
import { DEFAULT_WIN_CHANCE, PAYOUT_CONSTANT } from './_utils/const'
import type { RollResult, RollMode } from './_utils/types'
import { mockRoll, roundToCents } from './_utils/helpers'

import BetPanel from './_components/BetPanel.vue'
import ControlsPanel from './_components/ControlsPanel.vue'
import DiceTrack from './_components/DiceTrack.vue'
import RollHistory from './_components/RollHistory.vue'

definePageMeta({
  layout: 'empty',
})

const balance = ref(1000)
const isRolling = ref(false)

const betAmount = ref(1)
const mode = ref<RollMode>('over')
const threshold = ref(100 - DEFAULT_WIN_CHANCE)
const result = ref<RollResult>()
const history = ref<RollResult[]>([])

const winChance = computed(() => {
  if (mode.value === 'under') {
    return threshold.value
  }

  return 100 - threshold.value
})

const multiplier = computed(
  () => (100 / winChance.value) * (PAYOUT_CONSTANT / 100)
)

const handleRoll = async () => {
  isRolling.value = true
  balance.value = roundToCents(balance.value - betAmount.value)

  try {
    const roll = await mockRoll(threshold.value, betAmount.value, mode.value)
    result.value = roll
    history.value.push(roll)
    balance.value = roundToCents(balance.value + roll.payout)
  } catch {
    balance.value = roundToCents(balance.value + betAmount.value)
  } finally {
    isRolling.value = false
  }
}
</script>

<template>
  <main class="page-dice">
    <div class="game-container">
      <section class="game-field">
        <RollHistory :history />

        <DiceTrack v-model:threshold="threshold" :mode :result :is-rolling />

        <ControlsPanel v-model:mode="mode" :threshold :win-chance :multiplier />
      </section>
      <BetPanel
        v-model:bet-amount="betAmount"
        :balance
        :multiplier
        :is-rolling
        @roll="handleRoll"
      />
    </div>
  </main>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.page-dice {
  @apply flex items-center justify-center;
  @apply min-h-dvh p-4 md:p-8;
  @apply bg-slate-800 text-slate-100;
}

.game-container {
  @apply flex flex-col lg:flex-row;
  @apply w-full max-w-6xl mx-auto;
  @apply rounded-3xl overflow-hidden;
}

.game-field {
  @apply flex flex-col justify-between;
  @apply lg:order-last;
  @apply w-full p-4;
  @apply min-h-80 lg:min-h-180;
  @apply bg-slate-900;
}
</style>
