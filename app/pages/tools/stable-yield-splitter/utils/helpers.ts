import type {
  AllocationResult,
  AllocationSegment,
  EarnOffer,
  ExchangeId,
  FlatTierSegment,
  StableAsset,
} from './types'

export interface AllocateStableYieldOptions {
  totalAmount: number
  offers: EarnOffer[]
  asset?: StableAsset
  allowedExchangeIds?: ExchangeId[]
}

const INFINITE_CAPACITY = Number.POSITIVE_INFINITY

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
      let currentMin = 0

      for (const tier of offer.tiers) {
        const maxAmount = tier.max

        if (maxAmount !== null && maxAmount <= currentMin) {
          continue
        }

        const capacity =
          maxAmount === null
            ? INFINITE_CAPACITY
            : Math.max(0, maxAmount - currentMin)

        segments.push({
          offerId: offer.id,
          exchangeId: offer.exchangeId,
          asset: offer.asset,
          productType: offer.productType,
          apr: tier.apr,
          capacity,
          minAmount: currentMin,
          maxAmount,
          isPromo: Boolean(offer.isPromo),
        })

        if (maxAmount === null) {
          break
        }

        currentMin = maxAmount
      }

      return segments
    })
}

export function allocateStableYield(
  options: AllocateStableYieldOptions
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
