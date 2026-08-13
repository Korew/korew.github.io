import { createStableEarnOffer } from './helpers'
import type { CreateEarnOfferInput, EarnOffer } from './types'

// Temporary test dataset. Delete this static list after automated provider
// ingestion/scraping becomes the source used by the tool.
type TemporaryStableEarnOfferInput = Omit<
  CreateEarnOfferInput,
  'source' | 'sourceUrl'
>

const stableEarnOfferInputs: TemporaryStableEarnOfferInput[] = [
  /* === BINANCE === */
  {
    id: 'binance-usdt-flex',
    exchangeId: 'binance',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 200, apr: 3.84 },
      { maxAmount: null, apr: 0.84 },
    ],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-usdc-flex',
    exchangeId: 'binance',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 200, apr: 5.5 },
      { maxAmount: null, apr: 0.5 },
    ],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-rlusd-flex',
    exchangeId: 'binance',
    asset: 'RLUSD',
    productType: 'flexible',
    tiers: [{ maxAmount: 10000, apr: 8 }],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-usd1-flex',
    exchangeId: 'binance',
    asset: 'USD1',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.27 }],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-xusd-flex',
    exchangeId: 'binance',
    asset: 'XUSD',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 2.84 }],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-fdusd-flex',
    exchangeId: 'binance',
    asset: 'FDUSD',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.42 }],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-tusd-flex',
    exchangeId: 'binance',
    asset: 'TUSD',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.41 }],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-ustc-flex',
    exchangeId: 'binance',
    asset: 'USTC',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 1.02 }],
    fetchedAt: '2026-03-12',
  },
  {
    id: 'binance-usdp-flex',
    exchangeId: 'binance',
    asset: 'USDP',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 2.62 }],
    fetchedAt: '2026-03-12',
  },

  /* === BYBIT === */
  {
    id: 'bybit-usdt-flex',
    exchangeId: 'bybit',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 200, apr: 5.68 },
      { maxAmount: null, apr: 0.68 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bybit-usdc-flex',
    exchangeId: 'bybit',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 200, apr: 5.8 },
      { maxAmount: null, apr: 0.8 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bybit-dai-flex',
    exchangeId: 'bybit',
    asset: 'DAI',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 5 },
      { maxAmount: null, apr: 1 },
    ],
    fetchedAt: '2026-03-10',
  },

  /* === MEXC === */
  {
    id: 'mexc-usdt-flex',
    exchangeId: 'mexc',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 300, apr: 15 },
      { maxAmount: 100000, apr: 6 },
      { maxAmount: null, apr: 1 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'mexc-usdc-flex',
    exchangeId: 'mexc',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 300, apr: 12 },
      { maxAmount: 50000, apr: 3.5 },
      { maxAmount: null, apr: 2 },
    ],
    fetchedAt: '2026-03-10',
  },

  /* === BINGX === */
  {
    id: 'bingx-usdt-flex',
    exchangeId: 'bingx',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 300, apr: 10 },
      { maxAmount: null, apr: 1 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bingx-usdc-flex',
    exchangeId: 'bingx',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 8 },
      { maxAmount: null, apr: 1 },
    ],
    fetchedAt: '2026-03-10',
  },

  /* === OKX === */
  {
    id: 'okx-usdc-flexible',
    exchangeId: 'okx',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 10 },
      { maxAmount: null, apr: 1.16 },
    ],
    fetchedAt: '2026-03-10',
  },

  /* === KUCOIN === */
  {
    id: 'kucoin-usdt-flex',
    exchangeId: 'kucoin',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.9 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'kucoin-usdc-flex',
    exchangeId: 'kucoin',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.68 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'kucoin-usdd-flex',
    exchangeId: 'kucoin',
    asset: 'USDD',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 8 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'kucoin-usde-flex',
    exchangeId: 'kucoin',
    asset: 'USDE',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 3.5 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'kucoin-tusd-flex',
    exchangeId: 'kucoin',
    asset: 'TUSD',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.35 }],
    fetchedAt: '2026-03-10',
  },

  /* === BITGET === */
  {
    id: 'bitget-usdt-flexible',
    exchangeId: 'bitget',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 300, apr: 9.88 },
      { maxAmount: null, apr: 0.88 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bitget-usdc-flexible',
    exchangeId: 'bitget',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 8.88 },
      { maxAmount: null, apr: 1.68 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bitget-usd1-flexible',
    exchangeId: 'bitget',
    asset: 'USD1',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 1 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bitget-dai-flexible',
    exchangeId: 'bitget',
    asset: 'DAI',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 0.5 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'bitget-usds-flexible',
    exchangeId: 'bitget',
    asset: 'USDS',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 5 }],
    fetchedAt: '2026-03-10',
  },

  /* === HTX === */
  {
    id: 'htx-usdt-flex',
    exchangeId: 'htx',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 10 },
      { maxAmount: null, apr: 2.5 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'htx-usdc-flex',
    exchangeId: 'htx',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 5 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'htx-usde-flex',
    exchangeId: 'htx',
    asset: 'USDE',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 5 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'htx-usdd-flex',
    exchangeId: 'htx',
    asset: 'USDD',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 5 }],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'htx-usd1-flex',
    exchangeId: 'htx',
    asset: 'USD1',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 15 },
      { maxAmount: null, apr: 4 },
    ],
    fetchedAt: '2026-03-10',
  },

  /* === XT === */
  {
    id: 'xt-usdt-flex',
    exchangeId: 'xt',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { maxAmount: 200, apr: 12 },
      { maxAmount: 500, apr: 7 },
      { maxAmount: null, apr: 2.3 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'xt-usdc-flex',
    exchangeId: 'xt',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { maxAmount: 500, apr: 15 },
      { maxAmount: null, apr: 2.5 },
    ],
    fetchedAt: '2026-03-10',
  },
  {
    id: 'xt-dai-flex',
    exchangeId: 'xt',
    asset: 'DAI',
    productType: 'flexible',
    tiers: [{ maxAmount: null, apr: 1 }],
    fetchedAt: '2026-03-10',
  },
]

export const stableEarnOffers: EarnOffer[] = stableEarnOfferInputs.map(input =>
  createStableEarnOffer({
    ...input,
    source: 'temporary_test_data',
    sourceUrl: null,
  })
)
