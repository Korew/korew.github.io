<template>
  <div class="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <header class="space-y-3">
      <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">
        {{ t('pages.tools.stableEarn.title') }}
      </h1>
      <p class="max-w-3xl text-slate-600">
        {{ t('pages.tools.stableEarn.description') }}
      </p>
      <p
        class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
      >
        {{ t('pages.tools.stableEarn.manuallyUpdated') }}
      </p>
    </header>

    <section
      class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
    >
      <label class="space-y-2 sm:col-span-2 lg:col-span-1">
        <span class="text-sm font-medium text-slate-700">
          {{ t('pages.tools.stableEarn.amount') }}
        </span>
        <UiInput v-model="amount" min="0" step="50" type="number" />
      </label>

      <label class="space-y-2">
        <span class="text-sm font-medium text-slate-700">
          {{ t('pages.tools.stableEarn.asset') }}
        </span>
        <UiSelect v-model="selectedAsset">
          <option value="ALL">
            {{ t('pages.tools.stableEarn.allAssets') }}
          </option>
          <option v-for="asset in stableAssets" :key="asset" :value="asset">
            {{ asset }}
          </option>
        </UiSelect>
      </label>

      <fieldset class="space-y-2 sm:col-span-2 lg:col-span-1">
        <legend class="text-sm font-medium text-slate-700">
          {{ t('pages.tools.stableEarn.exchanges') }}
        </legend>
        <div class="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
          <UiCheckbox
            v-for="exchange in activeExchanges"
            :key="exchange.id"
            v-model="selectedExchangeIds"
            :label="exchange.name"
            :value="exchange.id"
            class="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
          />
        </div>
      </fieldset>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ToolsStableEarnSummaryCard
        :label="t('pages.tools.stableEarn.weightedApr')"
        :value="
          hasValidAmount ? formatPercent(allocationResult.weightedApr) : '0.00%'
        "
      />
      <ToolsStableEarnSummaryCard
        :label="t('pages.tools.stableEarn.estimatedDailyIncome')"
        :value="
          hasValidAmount
            ? formatCurrency(allocationResult.estimatedDailyProfit)
            : formatCurrency(0)
        "
      />
      <ToolsStableEarnSummaryCard
        :label="t('pages.tools.stableEarn.estimatedMonthlyIncome')"
        :value="
          hasValidAmount
            ? formatCurrency(allocationResult.estimatedMonthlyProfit)
            : formatCurrency(0)
        "
      />
      <ToolsStableEarnSummaryCard
        :label="t('pages.tools.stableEarn.estimatedYearlyIncome')"
        :value="
          hasValidAmount
            ? formatCurrency(allocationResult.estimatedYearlyProfit)
            : formatCurrency(0)
        "
      />
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-slate-900">
        {{ t('pages.tools.stableEarn.allocation') }}
      </h2>

      <p
        v-if="!hasValidAmount"
        class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600"
      >
        {{ t('pages.tools.stableEarn.enterAmountHint') }}
      </p>

      <p
        v-else-if="allocationResult.segments.length === 0"
        class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600"
      >
        {{ t('pages.tools.stableEarn.noResults') }}
      </p>

      <p
        v-else-if="allocationResult.unallocatedAmount > 0"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        {{
          t('pages.tools.stableEarn.unallocatedAmount', {
            amount: formatCurrency(allocationResult.unallocatedAmount),
          })
        }}
      </p>

      <ToolsStableEarnAllocationTable
        v-if="allocationResult.segments.length > 0"
        :exchanges="activeExchanges"
        :format-currency="formatCurrency"
        :format-percent="formatPercent"
        :segments="allocationResult.segments"
      />
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-slate-900">
        {{ t('pages.tools.stableEarn.currentOffers') }}
      </h2>

      <p
        v-if="filteredOffers.length === 0"
        class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600"
      >
        {{ t('pages.tools.stableEarn.noResults') }}
      </p>

      <ToolsStableEarnOffersTable
        v-else
        :exchanges="activeExchanges"
        :format-currency="formatCurrency"
        :format-percent="formatPercent"
        :offers="filteredOffers"
      />
    </section>

    <section
      class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
    >
      <h3 class="font-semibold text-slate-800">
        {{ t('pages.tools.stableEarn.disclaimerTitle') }}
      </h3>
      <p class="mt-2">
        {{ t('pages.tools.stableEarn.disclaimerText') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { stableEarnOffers } from '../../../features/tools/stable-earn/data'
import { stableEarnExchanges } from '../../../features/tools/stable-earn/const'
import { allocateStableEarn } from '../../../features/tools/stable-earn/helpers'
import type {
  ExchangeId,
  StableAsset,
} from '../../../features/tools/stable-earn/types'

const { t, locale } = useI18n()

const amount = ref<number>(1000)
const stableAssets: StableAsset[] = ['USDT', 'USDC', 'DAI']
const selectedAsset = ref<'ALL' | StableAsset>('ALL')

const activeExchanges = computed(() => {
  return [...stableEarnExchanges].filter(exchange => exchange.isActive)
})

const selectedExchangeIds = ref<ExchangeId[]>(
  activeExchanges.value.map(exchange => exchange.id)
)

const normalizedAmount = computed(() => {
  const numeric = Number(amount.value)

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0
  }

  return numeric
})

const hasValidAmount = computed(() => normalizedAmount.value > 0)

const selectedAssetFilter = computed<StableAsset | undefined>(() => {
  return selectedAsset.value === 'ALL' ? undefined : selectedAsset.value
})

const filteredOffers = computed(() => {
  const selectedSet = new Set<ExchangeId>(selectedExchangeIds.value)

  return stableEarnOffers.filter(offer => {
    if (!selectedSet.has(offer.exchangeId)) {
      return false
    }

    if (
      selectedAssetFilter.value &&
      offer.asset !== selectedAssetFilter.value
    ) {
      return false
    }

    return true
  })
})

const allocationResult = computed(() => {
  return allocateStableEarn({
    totalAmount: normalizedAmount.value,
    offers: stableEarnOffers,
    asset: selectedAssetFilter.value,
    allowedExchangeIds: selectedExchangeIds.value,
  })
})

const currencyFormatter = computed(() => {
  const localeCode = locale.value === 'uk' ? 'uk-UA' : 'en-US'

  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
})

const percentFormatter = computed(() => {
  const localeCode = locale.value === 'uk' ? 'uk-UA' : 'en-US'

  return new Intl.NumberFormat(localeCode, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
})

function formatCurrency(value: number): string {
  return currencyFormatter.value.format(value)
}

function formatPercent(value: number): string {
  return `${percentFormatter.value.format(value)}%`
}

const pageTitle = computed(() => t('pages.tools.stableEarn.title'))
const pageDescription = computed(() => t('pages.tools.stableEarn.subtitle'))

useHead(() => ({
  title: pageTitle.value,
}))

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})
</script>
