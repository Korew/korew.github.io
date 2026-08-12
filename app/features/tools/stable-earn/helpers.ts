import type {
  AllocationResult,
  AllocationSegment,
  AprTier,
  CreateEarnOfferInput,
  CreateEarnOfferTierInput,
  EarnOffer,
  ExchangeId,
  FlatTierSegment,
  NormalizeEarnRateOptions,
  NormalizedEarnRate,
  StableAsset,
} from './types'

export interface AllocateStableEarnOptions {
  totalAmount: number
  offers: EarnOffer[]
  asset?: StableAsset
  allowedExchangeIds?: ExchangeId[]
}

const INFINITE_CAPACITY = Number.POSITIVE_INFINITY

export function normalizeEarnRate(
  options: NormalizeEarnRateOptions
): NormalizedEarnRate {
  const rawNumericValue = parseRateValue(options.value)
  const annualRatePercent = toAnnualRatePercent(
    rawNumericValue,
    options.valueFormat
  )

  if (annualRatePercent < 0) {
    throw new Error('Earn rate cannot be negative')
  }

  if (options.kind === 'apr') {
    return {
      kind: options.kind,
      rawValue: options.value,
      valueFormat: options.valueFormat,
      annualRatePercent,
      apr: annualRatePercent,
      compoundingPeriodsPerYear: null,
    }
  }

  const compoundingPeriodsPerYear = options.compoundingPeriodsPerYear

  if (
    compoundingPeriodsPerYear === undefined ||
    !Number.isFinite(compoundingPeriodsPerYear) ||
    compoundingPeriodsPerYear <= 0
  ) {
    throw new Error('APY normalization requires compoundingPeriodsPerYear')
  }

  return {
    kind: options.kind,
    rawValue: options.value,
    valueFormat: options.valueFormat,
    annualRatePercent,
    apr: apyToApr(annualRatePercent, compoundingPeriodsPerYear),
    compoundingPeriodsPerYear,
  }
}

export function createStableEarnOffer(input: CreateEarnOfferInput): EarnOffer {
  const status = input.status ?? 'available'
  const minAmount = input.minAmount ?? 0
  const tiers = createStableEarnTiers(input.tiers, minAmount, status)
  const lastTier = tiers.at(-1)

  return {
    id: input.id,
    exchangeId: input.exchangeId,
    asset: input.asset,
    productType: input.productType,
    source: input.source ?? 'manual',
    sourceUrl: input.sourceUrl ?? null,
    fetchedAt: input.fetchedAt,
    minAmount,
    maxAmount:
      input.maxAmount === undefined
        ? lastTier?.maxAmount ?? null
        : input.maxAmount,
    remainingCapacity: input.remainingCapacity ?? null,
    status,
    termDays: input.termDays ?? null,
    isFlexible: input.isFlexible ?? input.productType === 'flexible',
    isPromo: input.isPromo ?? false,
    newUserOnly: input.newUserOnly ?? false,
    requiresAuth: input.requiresAuth ?? false,
    regionNotes: input.regionNotes ?? [],
    tiers,
    notes: input.notes,
  }
}

export function flattenTierSegments(
  offers: EarnOffer[],
  asset?: StableAsset,
  allowedExchangeIds?: ExchangeId[]
): FlatTierSegment[] {
  const allowedSet =
    allowedExchangeIds && allowedExchangeIds.length > 0
      ? new Set<ExchangeId>(allowedExchangeIds)
      : null

  return offers
    .filter(offer => {
      if (offer.status !== 'available') {
        return false
      }

      if (asset && offer.asset !== asset) {
        return false
      }

      if (allowedSet && !allowedSet.has(offer.exchangeId)) {
        return false
      }

      return true
    })
    .flatMap(offer => {
      const segments: FlatTierSegment[] = []

      for (const tier of offer.tiers) {
        if (tier.status !== 'available') {
          continue
        }

        const maxAmount = tier.maxAmount

        if (maxAmount !== null && maxAmount <= tier.minAmount) {
          continue
        }

        const rangeCapacity =
          maxAmount === null
            ? INFINITE_CAPACITY
            : Math.max(0, maxAmount - tier.minAmount)
        const capacity =
          tier.remainingCapacity === null
            ? rangeCapacity
            : Math.min(rangeCapacity, tier.remainingCapacity)

        segments.push({
          offerId: offer.id,
          exchangeId: offer.exchangeId,
          asset: offer.asset,
          productType: offer.productType,
          source: offer.source,
          sourceUrl: offer.sourceUrl,
          apr: tier.apr,
          capacity,
          minAmount: tier.minAmount,
          maxAmount,
          remainingCapacity: tier.remainingCapacity,
          status: tier.status,
          isPromo: offer.isPromo,
        })
      }

      return segments
    })
}

export function allocateStableEarn(
  options: AllocateStableEarnOptions
): AllocationResult {
  const safeAmount = Number.isFinite(options.totalAmount)
    ? Math.max(0, options.totalAmount)
    : 0

  if (safeAmount === 0) {
    return createEmptyResult(0)
  }

  const sortedSegments = flattenTierSegments(
    options.offers,
    options.asset,
    options.allowedExchangeIds
  ).sort((a, b) => b.apr - a.apr)

  let remaining = safeAmount
  const segments: AllocationSegment[] = []

  for (const segment of sortedSegments) {
    if (remaining <= 0) {
      break
    }

    const allocatable = Math.min(remaining, segment.capacity)

    if (allocatable <= 0) {
      continue
    }

    const estimatedYearlyProfit = (allocatable * segment.apr) / 100

    segments.push({
      exchangeId: segment.exchangeId,
      asset: segment.asset,
      amount: allocatable,
      apr: segment.apr,
      estimatedYearlyProfit,
      estimatedMonthlyProfit: estimatedYearlyProfit / 12,
      estimatedDailyProfit: estimatedYearlyProfit / 365,
    })

    remaining -= allocatable
  }

  const allocatedTotal = segments.reduce((sum, item) => sum + item.amount, 0)

  if (allocatedTotal <= 0) {
    return createEmptyResult(safeAmount)
  }

  const estimatedYearlyProfit = segments.reduce(
    (sum, item) => sum + item.estimatedYearlyProfit,
    0
  )
  const estimatedMonthlyProfit = estimatedYearlyProfit / 12
  const estimatedDailyProfit = estimatedYearlyProfit / 365

  return {
    totalAmount: safeAmount,
    weightedApr: (estimatedYearlyProfit / safeAmount) * 100,
    estimatedYearlyProfit,
    estimatedMonthlyProfit,
    estimatedDailyProfit,
    segments,
  }
}

function createEmptyResult(totalAmount: number): AllocationResult {
  return {
    totalAmount,
    weightedApr: 0,
    estimatedYearlyProfit: 0,
    estimatedMonthlyProfit: 0,
    estimatedDailyProfit: 0,
    segments: [],
  }
}

function createStableEarnTiers(
  tiers: CreateEarnOfferTierInput[],
  offerMinAmount: number,
  offerStatus: EarnOffer['status']
): AprTier[] {
  let currentMinAmount = offerMinAmount

  return tiers.map(tier => {
    const minAmount = tier.minAmount ?? currentMinAmount
    const maxAmount = tier.maxAmount

    if (maxAmount !== null && maxAmount < minAmount) {
      throw new Error('Tier maxAmount cannot be lower than minAmount')
    }

    const rate = normalizeTierRate(tier)

    if (maxAmount !== null) {
      currentMinAmount = maxAmount
    }

    return {
      minAmount,
      maxAmount,
      remainingCapacity: tier.remainingCapacity ?? null,
      apr: rate.apr,
      rate,
      status: tier.status ?? offerStatus,
    }
  })
}

function normalizeTierRate(tier: CreateEarnOfferTierInput): NormalizedEarnRate {
  if (tier.rate) {
    return normalizeEarnRate(tier.rate)
  }

  if (tier.apr === undefined) {
    throw new Error('Tier must include either rate or apr')
  }

  return normalizeEarnRate({
    value: tier.apr,
    kind: 'apr',
    valueFormat: 'percent',
  })
}

function parseRateValue(value: number | string): number {
  const parsedValue =
    typeof value === 'string' ? Number(value.replace('%', '').trim()) : value

  if (!Number.isFinite(parsedValue)) {
    throw new Error('Earn rate value must be a finite number')
  }

  return parsedValue
}

function toAnnualRatePercent(
  value: number,
  valueFormat: NormalizeEarnRateOptions['valueFormat']
): number {
  if (valueFormat === 'decimal') {
    return value * 100
  }

  if (valueFormat === 'basisPoints') {
    return value / 100
  }

  return value
}

function apyToApr(
  annualRatePercent: number,
  compoundingPeriodsPerYear: number
): number {
  const annualRateDecimal = annualRatePercent / 100
  const periodRate =
    Math.pow(1 + annualRateDecimal, 1 / compoundingPeriodsPerYear) - 1

  return periodRate * compoundingPeriodsPerYear * 100
}
