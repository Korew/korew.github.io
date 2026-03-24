<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableYield.allocationHeaders.exchange') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableYield.asset') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableYield.allocationHeaders.amount') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableYield.allocationHeaders.apr') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableYield.estimatedDailyIncome') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableYield.referralLink') }}
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
              {{ exchangeById[segment.exchangeId]?.name ?? segment.exchangeId }}
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
            <td class="px-4 py-3">
              <a
                class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                :href="exchangeById[segment.exchangeId]?.referralUrl"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                {{ t('pages.tools.stableYield.openExchange') }}
              </a>
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
  ExchangeId,
  ExchangeItem,
} from '../../../../types/stable-yield'

interface Props {
  segments: AllocationSegment[]
  exchanges: ExchangeItem[]
  formatCurrency: (value: number) => string
  formatPercent: (value: number) => string
}

const props = defineProps<Props>()
const { t } = useI18n()

const exchangeById = computed<Record<ExchangeId, ExchangeItem | undefined>>(
  () => {
    const entries = props.exchanges.map(
      exchange => [exchange.id, exchange] as const
    )

    return Object.fromEntries(entries) as Record<
      ExchangeId,
      ExchangeItem | undefined
    >
  }
)
</script>
