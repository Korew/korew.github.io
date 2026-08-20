<template>
  <section
    class="
      overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm
    "
  >
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.allocationHeaders.exchange') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.asset') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.allocationHeaders.amount') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.allocationHeaders.apr') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.estimatedDailyIncome') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(segment, index) in segments"
            :key="`${segment.exchangeId}-${segment.asset}-${index}`"
            class="text-slate-800"
          >
            <td class="px-4 py-3 font-medium">
              <ToolsStableEarnExchangeLink
                :exchange-id="segment.exchangeId"
                :exchanges="exchanges"
              />
            </td>
            <td class="px-4 py-3">
              {{ segment.asset }}
            </td>
            <td class="px-4 py-3">
              {{ formatCurrency(segment.amount) }}
            </td>
            <td class="px-4 py-3">
              {{ formatPercent(segment.apr) }}
            </td>
            <td class="px-4 py-3">
              {{ formatCurrency(segment.estimatedDailyProfit) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  AllocationSegment,
  ExchangeItem,
} from '../../../features/tools/stable-earn/types'

interface Props {
  segments: AllocationSegment[]
  exchanges: ExchangeItem[]
  formatCurrency: (value: number) => string
  formatPercent: (value: number) => string
}

defineProps<Props>()
const { t } = useI18n()
</script>
