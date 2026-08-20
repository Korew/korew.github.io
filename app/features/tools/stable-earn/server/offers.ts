import { stableEarnOffers as temporaryStableEarnOffers } from '../data'
import type {
  EarnOffer,
  ExchangeId,
  StableAsset,
  StableEarnOffersDataSource,
  StableEarnOffersResponse,
} from '../types'
import { bybitStableEarnProvider } from './providers/bybit'
import { okxStableEarnProvider } from './providers/okx'
import type {
  FetchStableEarnProviderOptions,
  StableEarnProvider,
} from './providers/types'

export const stableEarnProviders = [
  bybitStableEarnProvider,
  okxStableEarnProvider,
] as const
export const STABLE_EARN_OFFERS_CACHE_TTL_MS = 15 * 60 * 1000

export type StableEarnProviderId = (typeof stableEarnProviders)[number]['id']

export interface FetchLiveStableEarnOffersOptions
  extends Pick<FetchStableEarnProviderOptions, 'assets' | 'fetch' | 'signal'> {
  providerIds?: StableEarnProviderId[]
}

export interface FetchStableEarnOffersOptions
  extends Pick<FetchStableEarnProviderOptions, 'assets' | 'fetch' | 'signal'> {
  providerIds?: StableEarnProviderId[]
  now?: Date | string
  cacheTtlMs?: number
  forceRefresh?: boolean
  allowStaleCacheOnError?: boolean
  fallbackToTemporaryData?: boolean
}

interface StableEarnOffersCacheEntry {
  offers: EarnOffer[]
  cachedAtMs: number
  expiresAtMs: number
}

const stableEarnProviderById = new Map<ExchangeId, StableEarnProvider>(
  stableEarnProviders.map(provider => [provider.id, provider])
)
const stableEarnOffersCache = new Map<string, StableEarnOffersCacheEntry>()

export const defaultStableEarnProviderIds: StableEarnProviderId[] = [
  'bybit',
  'okx',
]

export function isStableEarnProviderId(
  providerId: string
): providerId is StableEarnProviderId {
  return stableEarnProviderById.has(providerId as ExchangeId)
}

export async function fetchLiveStableEarnOffers(
  options: FetchLiveStableEarnOffersOptions = {}
) {
  const providerIds = options.providerIds ?? defaultStableEarnProviderIds
  const providers = providerIds.map(providerId => {
    const provider = stableEarnProviderById.get(providerId)

    if (!provider) {
      throw new Error(`Unsupported stable earn provider: ${providerId}`)
    }

    return provider
  })

  const providerResults = await Promise.allSettled(
    providers.map(provider =>
      provider.fetchOffers({
        assets: options.assets,
        fetch: options.fetch,
        signal: options.signal,
      })
    )
  )
  const fulfilledResults = providerResults.filter(isFulfilledProviderResult)

  if (fulfilledResults.length === 0) {
    const providerErrors = providerResults.map(result => {
      return result.status === 'rejected'
        ? getErrorMessage(result.reason)
        : 'No offers returned'
    })

    throw new Error(`Stable Earn providers failed: ${providerErrors.join('; ')}`)
  }

  return fulfilledResults.flatMap(result => result.value)
}

function isFulfilledProviderResult(
  result: PromiseSettledResult<EarnOffer[]>
): result is PromiseFulfilledResult<EarnOffer[]> {
  return result.status === 'fulfilled'
}

export async function fetchStableEarnOffers(
  options: FetchStableEarnOffersOptions = {}
): Promise<StableEarnOffersResponse> {
  const providerIds = normalizeProviderIds(options.providerIds)
  const nowMs = normalizeTimestamp(options.now)
  const cacheTtlMs = normalizeCacheTtlMs(options.cacheTtlMs)
  const cacheKey = createCacheKey(providerIds)
  const cachedOffers = stableEarnOffersCache.get(cacheKey)
  const hasFreshCache =
    cachedOffers !== undefined && cachedOffers.expiresAtMs > nowMs

  if (!options.forceRefresh && hasFreshCache) {
    return createStableEarnOffersResult({
      allOffers: cachedOffers.offers,
      assets: options.assets,
      providerIds,
      nowMs,
      cacheTtlMs,
      dataSource: 'cache',
      cacheEntry: cachedOffers,
    })
  }

  try {
    const offers = await fetchLiveStableEarnOffers({
      providerIds,
      fetch: options.fetch,
      signal: options.signal,
    })
    const cacheEntry = createCacheEntry(offers, nowMs, cacheTtlMs)

    stableEarnOffersCache.set(cacheKey, cacheEntry)

    return createStableEarnOffersResult({
      allOffers: offers,
      assets: options.assets,
      providerIds,
      nowMs,
      cacheTtlMs,
      dataSource: 'live',
      cacheEntry,
    })
  } catch (error) {
    const fallbackReason = getErrorMessage(error)

    if (options.allowStaleCacheOnError !== false && cachedOffers) {
      return createStableEarnOffersResult({
        allOffers: cachedOffers.offers,
        assets: options.assets,
        providerIds,
        nowMs,
        cacheTtlMs,
        dataSource: 'stale_cache',
        cacheEntry: cachedOffers,
        fallbackReason,
      })
    }

    if (options.fallbackToTemporaryData !== false) {
      return createStableEarnOffersResult({
        allOffers: filterTemporaryOffersByProvider(providerIds),
        assets: options.assets,
        providerIds,
        nowMs,
        cacheTtlMs,
        dataSource: 'temporary_test_data',
        cacheEntry: null,
        fallbackReason,
      })
    }

    throw error
  }
}

export function clearStableEarnOffersCache(): void {
  stableEarnOffersCache.clear()
}

function createStableEarnOffersResult(options: {
  allOffers: EarnOffer[]
  assets: StableAsset[] | undefined
  providerIds: StableEarnProviderId[]
  nowMs: number
  cacheTtlMs: number
  dataSource: StableEarnOffersDataSource
  cacheEntry: StableEarnOffersCacheEntry | null
  fallbackReason?: string
}): StableEarnOffersResponse {
  const offers = filterOffersByAssets(options.allOffers, options.assets)

  return {
    offers,
    meta: {
      count: offers.length,
      providerIds: options.providerIds,
      assets: options.assets ?? null,
      dataSource: options.dataSource,
      fetchedAt: new Date(options.nowMs).toISOString(),
      cache: {
        hit:
          options.dataSource === 'cache' ||
          options.dataSource === 'stale_cache',
        cachedAt: options.cacheEntry
          ? new Date(options.cacheEntry.cachedAtMs).toISOString()
          : null,
        expiresAt: options.cacheEntry
          ? new Date(options.cacheEntry.expiresAtMs).toISOString()
          : null,
        ttlMs: options.cacheTtlMs,
      },
      fallbackReason: options.fallbackReason,
    },
  }
}

function normalizeProviderIds(
  providerIds: StableEarnProviderId[] | undefined
): StableEarnProviderId[] {
  if (!providerIds || providerIds.length === 0) {
    return defaultStableEarnProviderIds
  }

  return [...new Set(providerIds)]
}

function filterOffersByAssets(
  offers: EarnOffer[],
  assets: StableAsset[] | undefined
): EarnOffer[] {
  if (!assets) {
    return offers
  }

  const assetSet = new Set<StableAsset>(assets)

  return offers.filter(offer => assetSet.has(offer.asset))
}

function filterTemporaryOffersByProvider(
  providerIds: StableEarnProviderId[]
): EarnOffer[] {
  const providerIdSet = new Set<ExchangeId>(providerIds)

  return temporaryStableEarnOffers.filter(offer =>
    providerIdSet.has(offer.exchangeId)
  )
}

function createCacheEntry(
  offers: EarnOffer[],
  nowMs: number,
  cacheTtlMs: number
): StableEarnOffersCacheEntry {
  return {
    offers,
    cachedAtMs: nowMs,
    expiresAtMs: nowMs + cacheTtlMs,
  }
}

function createCacheKey(providerIds: StableEarnProviderId[]): string {
  return providerIds.join('|')
}

function normalizeTimestamp(value: Date | string | undefined): number {
  if (!value) {
    return Date.now()
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return Date.now()
  }

  return date.getTime()
}

function normalizeCacheTtlMs(value: number | undefined): number {
  if (!Number.isFinite(value) || value === undefined || value <= 0) {
    return STABLE_EARN_OFFERS_CACHE_TTL_MS
  }

  return value
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to fetch stable earn offers'
}
