<template>
  <div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <header class="space-y-4">
      <nav
        class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        :aria-label="t('pages.tools.stableEarn.languageSwitcher')"
      >
        <Icon
          aria-hidden="true"
          class="mx-2 size-4 text-slate-500"
          name="lucide:languages"
        />
        <NuxtLink
          v-for="language in availableLocales"
          :key="language.code"
          class="inline-flex min-h-8 min-w-10 items-center justify-center rounded-md px-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          :class="{
            'bg-slate-900 text-white hover:bg-slate-900 hover:text-white':
              locale === language.code,
          }"
          :to="localePath('/tools/stable-earn', language.code)"
        >
          {{ language.code.toUpperCase() }}
        </NuxtLink>
      </nav>

      <div class="space-y-3">
        <h1 class="text-2xl font-semibold text-slate-900 sm:text-4xl">
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
      </div>
    </header>

    <section
      class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.6fr)]"
    >
      <label class="space-y-2">
        <span class="text-sm font-medium text-slate-700">
          {{ t('pages.tools.stableEarn.amount') }}
        </span>
        <UiInput v-model="amount" min="0" step="50" type="number" />
      </label>

      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-slate-700">
          {{ t('pages.tools.stableEarn.asset') }}
        </legend>
        <div class="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-2">
          <UiCheckbox
            v-for="asset in stableAssets"
            :key="asset"
            v-model="selectedAssets"
            :label="asset"
            :value="asset"
            class="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
          />
        </div>
      </fieldset>

      <fieldset class="space-y-2">
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
        :format-date="formatDate"
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

    <footer
      class="flex flex-col gap-3 border-t border-slate-200 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>© {{ year }}. {{ t('Roman Korenchuk') }}</p>
      <a
        class="inline-flex w-fit items-center gap-2 rounded-md p-1 font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        :aria-label="threadsLink.label"
        :href="threadsLink.href"
        rel="noopener noreferrer me"
        target="_blank"
        :title="threadsLink.label"
      >
        <Icon :name="threadsLink.icon" class="size-5" />
        <span>{{ threadsLink.label }}</span>
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { socialLinks } from '../../../../data/social-links'
import { stableEarnOffers } from '../../../features/tools/stable-earn/data'
import { stableEarnExchanges } from '../../../features/tools/stable-earn/const'
import { allocateStableEarn } from '../../../features/tools/stable-earn/helpers'
import type {
  ExchangeId,
  StableAsset,
} from '../../../features/tools/stable-earn/types'

definePageMeta({
  layout: 'empty',
})

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()

const year = new Date().getFullYear()
const amount = ref<number>(1000)
const availableLocales = computed(() => locales.value)
const threadsLink = socialLinks.find(link => link.id === 'threads') ?? {
  id: 'threads',
  label: 'Threads',
  href: 'https://www.threads.com/@roman.korenchuk',
  icon: 'simple-icons:threads' as const,
}
const stableAssets = computed<StableAsset[]>(() => {
  return [...new Set(stableEarnOffers.map(offer => offer.asset))].sort()
})
const selectedAssets = ref<StableAsset[]>(
  stableAssets.value.filter(asset => ['USDT', 'USDC', 'DAI'].includes(asset))
)

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

const filteredOffers = computed(() => {
  const selectedExchangeSet = new Set<ExchangeId>(selectedExchangeIds.value)
  const selectedAssetSet = new Set<StableAsset>(selectedAssets.value)

  return stableEarnOffers.filter(offer => {
    if (!selectedExchangeSet.has(offer.exchangeId)) {
      return false
    }

    if (!selectedAssetSet.has(offer.asset)) {
      return false
    }

    return true
  })
})

const allocationResult = computed(() => {
  return allocateStableEarn({
    totalAmount: normalizedAmount.value,
    offers: stableEarnOffers,
    assets: selectedAssets.value,
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

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
    dateStyle: 'medium',
  }).format(date)
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
