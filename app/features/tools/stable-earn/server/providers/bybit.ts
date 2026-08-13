import { isStableEarnAsset } from '../../const'
import { createStableEarnOffer } from '../../helpers'
import type {
  CreateEarnOfferTierInput,
  EarnOffer,
  EarnOfferStatus,
  EarnProductType,
  StableAsset,
} from '../../types'
import type {
  FetchStableEarnProviderOptions,
  StableEarnProvider,
  StableEarnProviderFetch,
} from './types'

export const BYBIT_EARN_PRODUCT_URL = 'https://api.bybit.com/v5/earn/product'
const BYBIT_DEFAULT_CATEGORY = 'FlexibleSaving'

interface BybitEarnBonusEvent {
  apr?: string
  coin?: string
  announcement?: string
}

interface BybitEarnTierAprDetail {
  min?: string
  max?: string
  estimateApr?: string
}

export interface BybitEarnProduct {
  category?: string
  estimateApr?: string
  coin?: string
  minStakeAmount?: string
  maxStakeAmount?: string
  productId?: string
  status?: string
  bonusEvents?: BybitEarnBonusEvent[]
  duration?: string
  term?: number
  hasTieredApr?: boolean
  tierAprDetails?: BybitEarnTierAprDetail[]
  remainingPoolAmount?: string
}

interface BybitEarnProductResponse {
  retCode?: number
  retMsg?: string
  result?: {
    list?: BybitEarnProduct[]
  }
  time?: number
}

export const bybitStableEarnProvider: StableEarnProvider = {
  id: 'bybit',
  name: 'Bybit',
  requiresAuth: false,
  async fetchOffers(options = {}) {
    return fetchBybitEarnOffers(options)
  },
}

export async function fetchBybitEarnOffers(
  options: FetchStableEarnProviderOptions = {}
): Promise<EarnOffer[]> {
  const url = new URL(BYBIT_EARN_PRODUCT_URL)
  url.searchParams.set('category', BYBIT_DEFAULT_CATEGORY)

  const fetcher = options.fetch ?? globalThis.fetch
  const response = await fetchWithJson<BybitEarnProductResponse>(fetcher, url, {
    signal: options.signal,
  })

  if (response.retCode !== 0) {
    throw new Error(
      `Bybit Earn API error: ${response.retMsg || `retCode ${response.retCode}`}`
    )
  }

  const fetchedAt = options.fetchedAt ?? parseBybitResponseTime(response.time)
  const requestedAssets = options.assets
    ? new Set<StableAsset>(options.assets)
    : null

  return normalizeBybitEarnProducts(response.result?.list ?? [], fetchedAt).filter(
    offer => {
      return requestedAssets ? requestedAssets.has(offer.asset) : true
    }
  )
}

export function normalizeBybitEarnProducts(
  products: BybitEarnProduct[],
  fetchedAt: Date | string
): EarnOffer[] {
  return products.flatMap(product => {
    const asset = normalizeBybitStableAsset(product.coin)

    if (!asset) {
      return []
    }

    const tiers = createBybitTierInputs(product)

    if (tiers.length === 0) {
      return []
    }

    const category = product.category || BYBIT_DEFAULT_CATEGORY
    const productType = normalizeBybitProductType(product)
    const remainingCapacity = normalizeBybitCapacity(product.remainingPoolAmount)
    const status = normalizeBybitOfferStatus(product.status, remainingCapacity)

    try {
      return [
        createStableEarnOffer({
          id: createBybitOfferId(product, asset, category),
          exchangeId: 'bybit',
          asset,
          productType,
          source: 'api',
          sourceUrl: createBybitSourceUrl(category, asset),
          fetchedAt: normalizeFetchedAt(fetchedAt),
          minAmount: normalizeBybitAmount(product.minStakeAmount) ?? 0,
          maxAmount: normalizeBybitLimit(product.maxStakeAmount),
          remainingCapacity,
          status,
          termDays: normalizeBybitTermDays(product, productType),
          isFlexible: productType === 'flexible',
          isPromo: Boolean(product.bonusEvents?.length),
          newUserOnly: false,
          requiresAuth: false,
          regionNotes: [],
          tiers,
        }),
      ]
    } catch {
      return []
    }
  })
}

function createBybitTierInputs(
  product: BybitEarnProduct
): CreateEarnOfferTierInput[] {
  const tierAprDetails = product.tierAprDetails ?? []
  const productMaxAmount = normalizeBybitLimit(product.maxStakeAmount)

  if (tierAprDetails.length > 0) {
    return tierAprDetails.flatMap(tier => {
      if (!tier.estimateApr) {
        return []
      }

      return [
        {
          minAmount: normalizeBybitAmount(tier.min) ?? 0,
          maxAmount: normalizeBybitLimit(tier.max) ?? productMaxAmount,
          rate: {
            value: tier.estimateApr,
            kind: 'apr',
            valueFormat: 'percent',
          },
        },
      ]
    })
  }

  if (!product.estimateApr) {
    return []
  }

  return [
    {
      minAmount: normalizeBybitAmount(product.minStakeAmount) ?? 0,
      maxAmount: productMaxAmount,
      rate: {
        value: product.estimateApr,
        kind: 'apr',
        valueFormat: 'percent',
      },
    },
  ]
}

async function fetchWithJson<T>(
  fetcher: StableEarnProviderFetch,
  url: URL,
  init: RequestInit
): Promise<T> {
  const response = await fetcher(url.toString(), {
    ...init,
    headers: {
      'accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Bybit Earn API request failed with ${response.status}`)
  }

  return (await response.json()) as T
}

function normalizeBybitStableAsset(value?: string): StableAsset | null {
  const asset = value?.trim().toUpperCase()

  if (!asset || !isStableEarnAsset(asset)) {
    return null
  }

  return asset
}

function normalizeBybitProductType(product: BybitEarnProduct): EarnProductType {
  if (product.duration?.toLowerCase() === 'fixed') {
    return 'fixed'
  }

  return 'flexible'
}

function normalizeBybitOfferStatus(
  value: string | undefined,
  remainingCapacity: number | null
): EarnOfferStatus {
  if (remainingCapacity === 0) {
    return 'sold_out'
  }

  const status = value?.trim().toLowerCase()

  if (status === 'available') {
    return 'available'
  }

  if (status === 'notavailable' || status === 'not_available') {
    return 'unavailable'
  }

  return 'unknown'
}

function normalizeBybitTermDays(
  product: BybitEarnProduct,
  productType: EarnProductType
): number | null {
  if (productType !== 'fixed') {
    return null
  }

  return Number.isFinite(product.term) && Number(product.term) > 0
    ? Number(product.term)
    : null
}

function normalizeBybitCapacity(value?: string): number | null {
  const amount = normalizeBybitAmount(value)

  if (amount === null || amount < 0) {
    return null
  }

  return amount
}

function normalizeBybitLimit(value?: string): number | null {
  const amount = normalizeBybitAmount(value)

  if (amount === null || amount < 0) {
    return null
  }

  return amount
}

function normalizeBybitAmount(value?: string): number | null {
  if (value === undefined || value.trim() === '') {
    return null
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return null
  }

  return amount
}

function createBybitOfferId(
  product: BybitEarnProduct,
  asset: StableAsset,
  category: string
): string {
  const categorySlug = category.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  const productId = product.productId?.trim() || 'unknown'

  return `bybit-${categorySlug}-${asset.toLowerCase()}-${productId}`
}

function createBybitSourceUrl(category: string, asset: StableAsset): string {
  const url = new URL(BYBIT_EARN_PRODUCT_URL)
  url.searchParams.set('category', category)
  url.searchParams.set('coin', asset)

  return url.toString()
}

function normalizeFetchedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

function parseBybitResponseTime(value?: number): Date {
  if (!Number.isFinite(value)) {
    return new Date()
  }

  return new Date(Number(value))
}
