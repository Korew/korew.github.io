<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              {{ t('pages.tools.stableEarn.offersHeaders.productType') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.offersHeaders.tiers') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.offersHeaders.fetchedAt') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.referralLink') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="offer in offers"
            :key="offer.id"
            class="align-top text-slate-800"
          >
            <td class="px-4 py-3 font-medium">
              <div class="flex items-center gap-2">
                <span>
                  {{ exchangeById[offer.exchangeId]?.name ?? offer.exchangeId }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              {{ offer.asset }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {{ t(`pages.tools.stableEarn.${offer.productType}`) }}
              </span>
            </td>
            <td class="px-4 py-3 min-w-72">
              <ul class="space-y-1">
                <li
                  v-for="tier in offer.tiers"
                  :key="`${offer.id}-${tier.maxAmount ?? 'max'}`"
                >
                  {{ formatTier(tier) }}
                </li>
              </ul>
            </td>
            <td class="px-4 py-3">
              {{ offer.fetchedAt }}
            </td>
            <td class="px-4 py-3">
              <a
                class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                :href="exchangeById[offer.exchangeId]?.referralUrl"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                {{ t('pages.tools.stableEarn.openExchange') }}
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
  AprTier,
  EarnOffer,
  ExchangeId,
  ExchangeItem,
} from '../../../features/tools/stable-earn/types'

interface Props {
  offers: EarnOffer[]
  exchanges: ExchangeItem[]
  formatPercent: (value: number) => string
  formatCurrency: (value: number) => string
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

function formatTier(tier: AprTier): string {
  const minLabel = props.formatCurrency(tier.minAmount)

  if (tier.maxAmount === null) {
    const fromLabel = t('pages.tools.stableEarn.fromAmount')
    const aboveLabel = t('pages.tools.stableEarn.aboveAmount')
    const aprLabel = props.formatPercent(tier.apr)

    return `${fromLabel} ${minLabel} ${aboveLabel}: ${aprLabel}`
  }

  const maxLabel = props.formatCurrency(tier.maxAmount)

  return `${minLabel} - ${maxLabel}: ${props.formatPercent(tier.apr)}`
}
</script>
