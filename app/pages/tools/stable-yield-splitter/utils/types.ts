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
  | 'USTC'
  | 'USDP'
  | 'PYUSD'
  | 'USDD'
  | 'USDE'
  | 'USDS'

export type EarnProductType = 'flexible' | 'fixed'

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

export interface AprTier {
  max: number | null
  apr: number
}

export interface EarnOffer {
  id: string
  exchangeId: ExchangeId
  asset: StableAsset
  productType: EarnProductType
  tiers: AprTier[]
  updatedAt: string
  notes?: string
  isPromo?: boolean
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
  apr: number
  capacity: number
  minAmount: number
  maxAmount: number | null
  isPromo: boolean
}
