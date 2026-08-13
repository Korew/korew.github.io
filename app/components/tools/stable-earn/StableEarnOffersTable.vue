<template>
  <section class="space-y-3">
    <div class="grid gap-3 lg:hidden">
      <article
        v-for="offer in offers"
        :key="offer.id"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <a
              v-if="getExchangeReferralUrl(offer.exchangeId)"
              class="
                inline-flex items-center gap-2 text-sm font-semibold
                text-slate-900 hover:text-slate-600
              "
              :href="getExchangeReferralUrl(offer.exchangeId)"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              <ExchangeIcon :exchange-id="offer.exchangeId" />
              <span>{{ getExchangeName(offer.exchangeId) }}</span>
            </a>
            <span
              v-else
              class="
                inline-flex items-center gap-2 text-sm font-semibold
                text-slate-900
              "
            >
              <ExchangeIcon :exchange-id="offer.exchangeId" />
              <span>{{ getExchangeName(offer.exchangeId) }}</span>
            </span>
            <p class="mt-1 text-xs text-slate-500">
              {{ offer.asset }} ·
              {{ t(`pages.tools.stableEarn.${offer.productType}`) }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            :class="statusClass(offer.status)"
          >
            {{ t(`pages.tools.stableEarn.status.${offer.status}`) }}
          </span>
        </div>

        <ul class="mt-4 space-y-1 text-sm text-slate-700">
          <li
            v-for="tier in offer.tiers"
            :key="`${offer.id}-${tier.maxAmount ?? 'max'}`"
          >
            {{ formatTier(tier) }}
          </li>
        </ul>

        <div class="mt-4 grid gap-2 text-xs text-slate-500">
          <p>
            {{ t('pages.tools.stableEarn.offersHeaders.source') }}:
            <span class="font-medium text-slate-700">
              {{ formatSource(offer.source) }}
            </span>
          </p>
          <p>
            {{ t('pages.tools.stableEarn.offersHeaders.fetchedAt') }}:
            <span class="font-medium text-slate-700">
              {{ formatDate(offer.fetchedAt) }}
            </span>
          </p>
          <div
            v-if="formatOfferNotes(offer).length > 0"
            class="space-y-1"
          >
            <p>{{ t('pages.tools.stableEarn.offersHeaders.notes') }}:</p>
            <ul class="font-medium text-slate-700">
              <li
                v-for="note in formatOfferNotes(offer)"
                :key="`${offer.id}-${note}`"
              >
                {{ note }}
              </li>
            </ul>
          </div>
        </div>
      </article>
    </div>

    <div
      class="
        hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white
        shadow-sm lg:block
      "
    >
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
              {{ t('pages.tools.stableEarn.offersHeaders.status') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.offersHeaders.source') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('pages.tools.stableEarn.offersHeaders.fetchedAt') }}
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
              <a
                v-if="getExchangeReferralUrl(offer.exchangeId)"
                class="
                  inline-flex items-center gap-2 text-slate-900
                  hover:text-slate-600
                "
                :href="getExchangeReferralUrl(offer.exchangeId)"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <ExchangeIcon :exchange-id="offer.exchangeId" />
                <span>{{ getExchangeName(offer.exchangeId) }}</span>
              </a>
              <span v-else class="inline-flex items-center gap-2">
                <ExchangeIcon :exchange-id="offer.exchangeId" />
                <span>{{ getExchangeName(offer.exchangeId) }}</span>
              </span>
            </td>
            <td class="px-4 py-3">
              {{ offer.asset }}
            </td>
            <td class="px-4 py-3">
              <span
                class="
                  rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium
                  text-slate-700
                "
              >
                {{ t(`pages.tools.stableEarn.${offer.productType}`) }}
              </span>
            </td>
            <td class="min-w-72 px-4 py-3">
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
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusClass(offer.status)"
              >
                {{ t(`pages.tools.stableEarn.status.${offer.status}`) }}
              </span>
            </td>
            <td class="px-4 py-3">
              {{ formatSource(offer.source) }}
            </td>
            <td class="px-4 py-3">
              {{ formatDate(offer.fetchedAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import type {
  AprTier,
  EarnOffer,
  EarnOfferSource,
  EarnOfferStatus,
  ExchangeId,
  ExchangeItem,
} from '../../../features/tools/stable-earn/types'

interface Props {
  offers: EarnOffer[]
  exchanges: ExchangeItem[]
  formatPercent: (value: number) => string
  formatCurrency: (value: number) => string
  formatDate: (value: string) => string
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

const ExchangeIcon = defineComponent({
  props: {
    exchangeId: {
      type: String as PropType<ExchangeId>,
      required: true,
    },
  },
  setup(componentProps) {
    return () => {
      const exchange = exchangeById.value[componentProps.exchangeId]
      const imageSrc = getExchangeImageSrc(exchange)
      const name = getExchangeName(componentProps.exchangeId)

      if (imageSrc) {
        return h('img', {
          alt: '',
          class:
            'size-6 shrink-0 rounded-full bg-white object-contain ring-1 ' +
            'ring-slate-200',
          loading: 'lazy',
          src: imageSrc,
        })
      }

      return h(
        'span',
        {
          'aria-hidden': 'true',
          class:
            'inline-flex size-6 shrink-0 items-center justify-center ' +
            'rounded-full bg-slate-100 text-[10px] font-bold text-slate-700',
        },
        getExchangeFallbackIcon(exchange, name)
      )
    }
  },
})

function getExchangeName(exchangeId: ExchangeId): string {
  return exchangeById.value[exchangeId]?.name ?? exchangeId
}

function getExchangeReferralUrl(exchangeId: ExchangeId): string | undefined {
  return exchangeById.value[exchangeId]?.referralUrl
}

function getExchangeImageSrc(exchange?: ExchangeItem): string {
  return getImageSrc(exchange?.icon)
}

function getImageSrc(asset: ExchangeItem['icon'] | undefined): string {
  if (typeof asset === 'string' && asset.startsWith('/')) {
    return asset
  }

  if (typeof asset === 'object') {
    return getImageSrc(asset.light)
  }

  return ''
}

function getExchangeFallbackIcon(
  exchange: ExchangeItem | undefined,
  name: string
): string {
  if (typeof exchange?.icon === 'string' && !exchange.icon.startsWith('/')) {
    return exchange.icon
  }

  return name.slice(0, 2).toUpperCase()
}

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

function formatSource(source: EarnOfferSource): string {
  return t(`pages.tools.stableEarn.source.${source}`)
}

function formatOfferNotes(offer: EarnOffer): string[] {
  const notes: string[] = []

  if (offer.isPromo) {
    notes.push(t('pages.tools.stableEarn.promo'))
  }

  if (offer.newUserOnly) {
    notes.push(t('pages.tools.stableEarn.newUserOnly'))
  }

  if (offer.requiresAuth) {
    notes.push(t('pages.tools.stableEarn.requiresAuth'))
  }

  notes.push(...offer.regionNotes)

  if (offer.notes) {
    notes.push(offer.notes)
  }

  return notes
}

function statusClass(status: EarnOfferStatus): string {
  if (status === 'available') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (status === 'sold_out' || status === 'paused') {
    return 'bg-amber-100 text-amber-800'
  }

  if (status === 'unavailable') {
    return 'bg-rose-100 text-rose-800'
  }

  return 'bg-slate-100 text-slate-700'
}
</script>
