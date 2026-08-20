export type ExchangeId =
  | 'binance'
  | 'bybit'
  | 'mexc'
  | 'bingx'
  | 'okx'
  | 'kucoin'
  | 'gate'
  | 'bitget'
  | 'nexo'
  | 'htx'
  | 'xt'
  | 'whitebit'

export type StableAsset =
  | 'USDT'
  | 'USDC'
  | 'DAI'
  | 'RLUSD'
  | 'USD1'
  | 'XUSD'
  | 'FDUSD'
  | 'TUSD'
  | 'USDP'
  | 'PYUSD'
  | 'USDD'
  | 'USDE'
  | 'USDS'
  | 'USDG'
  | 'GHO'
  | 'FRAX'
  | 'CRVUSD'
  | 'USDM'
  | 'AUSD'

export type EarnProductType = 'flexible' | 'fixed'

export type EarnOfferSource = 'api' | 'scrape'

export type StableEarnOffersDataSource =
  | 'live'
  | 'cache'
  | 'stale_cache'

export type EarnOfferStatus =
  | 'available'
  | 'sold_out'
  | 'paused'
  | 'unavailable'
  | 'unknown'

export type EarnRateKind = 'apr' | 'apy'

export type EarnRateValueFormat = 'percent' | 'decimal' | 'basisPoints'

export interface ExchangeItem {
  id: ExchangeId
  name: string
  slug: string
  referralUrl?: string
  icon?:
    | string
    | {
        light: string
        dark: string
      }
  logo?:
    | string
    | {
        light: string
        dark: string
      }
  isActive: boolean
}

export interface NormalizeEarnRateOptions {
  value: number | string
  kind: EarnRateKind
  valueFormat: EarnRateValueFormat
  compoundingPeriodsPerYear?: number
}

export interface NormalizedEarnRate {
  kind: EarnRateKind
  rawValue: number | string
  valueFormat: EarnRateValueFormat
  annualRatePercent: number
  apr: number
  compoundingPeriodsPerYear: number | null
}

export interface AprTier {
  minAmount: number
  maxAmount: number | null
  remainingCapacity: number | null
  apr: number
  rate: NormalizedEarnRate
  status: EarnOfferStatus
}

export interface EarnOffer {
  id: string
  exchangeId: ExchangeId
  asset: StableAsset
  productType: EarnProductType
  source: EarnOfferSource
  sourceUrl: string | null
  fetchedAt: string
  minAmount: number
  maxAmount: number | null
  remainingCapacity: number | null
  status: EarnOfferStatus
  termDays: number | null
  isFlexible: boolean
  isPromo: boolean
  newUserOnly: boolean
  requiresAuth: boolean
  regionNotes: string[]
  tiers: AprTier[]
  notes?: string
}

export interface StableEarnOffersCacheMeta {
  hit: boolean
  cachedAt: string | null
  expiresAt: string | null
  ttlMs: number
}

export interface StableEarnOffersResponseMeta {
  count: number
  providerIds: ExchangeId[]
  assets: StableAsset[] | null
  dataSource: StableEarnOffersDataSource
  fetchedAt: string
  cache: StableEarnOffersCacheMeta
  fallbackReason?: string
}

export interface StableEarnOffersResponse {
  offers: EarnOffer[]
  meta: StableEarnOffersResponseMeta
}

export interface AllocationSegment {
  exchangeId: ExchangeId
  asset: StableAsset
  amount: number
  apr: number
  estimatedYearlyProfit: number
  estimatedMonthlyProfit: number
  estimatedDailyProfit: number
}

export interface AllocationResult {
  totalAmount: number
  allocatedAmount: number
  unallocatedAmount: number
  weightedApr: number
  estimatedYearlyProfit: number
  estimatedMonthlyProfit: number
  estimatedDailyProfit: number
  segments: AllocationSegment[]
}

export interface FlatTierSegment {
  offerId: string
  exchangeId: ExchangeId
  asset: StableAsset
  productType: EarnProductType
  offerMinAmount: number
  source: EarnOfferSource
  sourceUrl: string | null
  apr: number
  capacity: number
  minAmount: number
  maxAmount: number | null
  remainingCapacity: number | null
  status: EarnOfferStatus
  isPromo: boolean
}

export interface CreateEarnOfferTierInput {
  minAmount?: number
  maxAmount: number | null
  remainingCapacity?: number | null
  status?: EarnOfferStatus
  rate?: NormalizeEarnRateOptions
  apr?: number
}

export interface CreateEarnOfferInput {
  id: string
  exchangeId: ExchangeId
  asset: StableAsset
  productType: EarnProductType
  source: EarnOfferSource
  sourceUrl?: string | null
  fetchedAt: string
  minAmount?: number
  maxAmount?: number | null
  remainingCapacity?: number | null
  status?: EarnOfferStatus
  termDays?: number | null
  isFlexible?: boolean
  isPromo?: boolean
  newUserOnly?: boolean
  requiresAuth?: boolean
  regionNotes?: string[]
  tiers: CreateEarnOfferTierInput[]
  notes?: string
}
