import type { EarnOffer } from './types'

export const stableYieldOffers: EarnOffer[] = [
  /* === BINANCE === */
  {
    id: 'binance-usdt-flex',
    exchangeId: 'binance',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 200, apr: 3.84 },
      { max: null, apr: 0.84 },
    ],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-usdc-flex',
    exchangeId: 'binance',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 200, apr: 5.5 },
      { max: null, apr: 0.5 },
    ],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-rlusd-flex',
    exchangeId: 'binance',
    asset: 'RLUSD',
    productType: 'flexible',
    tiers: [{ max: 10000, apr: 8 }],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-usd1-flex',
    exchangeId: 'binance',
    asset: 'USD1',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.27 }],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-xusd-flex',
    exchangeId: 'binance',
    asset: 'XUSD',
    productType: 'flexible',
    tiers: [{ max: null, apr: 2.84 }],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-fdusd-flex',
    exchangeId: 'binance',
    asset: 'FDUSD',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.42 }],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-tusd-flex',
    exchangeId: 'binance',
    asset: 'TUSD',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.41 }],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-ustc-flex',
    exchangeId: 'binance',
    asset: 'USTC',
    productType: 'flexible',
    tiers: [{ max: null, apr: 1.02 }],
    updatedAt: '2026-03-12',
  },
  {
    id: 'binance-usdp-flex',
    exchangeId: 'binance',
    asset: 'USDP',
    productType: 'flexible',
    tiers: [{ max: null, apr: 2.62 }],
    updatedAt: '2026-03-12',
  },

  /* === BYBIT === */
  {
    id: 'bybit-usdt-flex',
    exchangeId: 'bybit',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 200, apr: 5.68 },
      { max: null, apr: 0.68 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bybit-usdc-flex',
    exchangeId: 'bybit',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 200, apr: 5.8 },
      { max: null, apr: 0.8 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bybit-dai-flex',
    exchangeId: 'bybit',
    asset: 'DAI',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 5 },
      { max: null, apr: 1 },
    ],
    updatedAt: '2026-03-10',
  },

  /* === MEXC === */
  {
    id: 'mexc-usdt-flex',
    exchangeId: 'mexc',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 300, apr: 15 },
      { max: 100000, apr: 6 },
      { max: null, apr: 1 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'mexc-usdc-flex',
    exchangeId: 'mexc',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 300, apr: 12 },
      { max: 50000, apr: 3.5 },
      { max: null, apr: 2 },
    ],
    updatedAt: '2026-03-10',
  },

  /* === BINGX === */
  {
    id: 'bingx-usdt-flex',
    exchangeId: 'bingx',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 300, apr: 10 },
      { max: null, apr: 1 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bingx-usdc-flex',
    exchangeId: 'bingx',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 8 },
      { max: null, apr: 1 },
    ],
    updatedAt: '2026-03-10',
  },

  /* === OKX === */
  {
    id: 'okx-usdc-flexible',
    exchangeId: 'okx',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 10 },
      { max: null, apr: 1.16 },
    ],
    updatedAt: '2026-03-10',
  },

  /* === KUCOIN === */
  {
    id: 'kucoin-usdt-flex',
    exchangeId: 'kucoin',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.9 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'kucoin-usdc-flex',
    exchangeId: 'kucoin',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.68 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'kucoin-usdd-flex',
    exchangeId: 'kucoin',
    asset: 'USDD',
    productType: 'flexible',
    tiers: [{ max: null, apr: 8 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'kucoin-usde-flex',
    exchangeId: 'kucoin',
    asset: 'USDE',
    productType: 'flexible',
    tiers: [{ max: null, apr: 3.5 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'kucoin-tusd-flex',
    exchangeId: 'kucoin',
    asset: 'TUSD',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.35 }],
    updatedAt: '2026-03-10',
  },

  /* === BITGET === */
  {
    id: 'bitget-usdt-flexible',
    exchangeId: 'bitget',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 300, apr: 9.88 },
      { max: null, apr: 0.88 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bitget-usdc-flexible',
    exchangeId: 'bitget',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 8.88 },
      { max: null, apr: 1.68 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bitget-usd1-flexible',
    exchangeId: 'bitget',
    asset: 'USD1',
    productType: 'flexible',
    tiers: [{ max: null, apr: 1 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bitget-dai-flexible',
    exchangeId: 'bitget',
    asset: 'DAI',
    productType: 'flexible',
    tiers: [{ max: null, apr: 0.5 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'bitget-usds-flexible',
    exchangeId: 'bitget',
    asset: 'USDS',
    productType: 'flexible',
    tiers: [{ max: null, apr: 5 }],
    updatedAt: '2026-03-10',
  },

  /* === HTX === */
  {
    id: 'htx-usdt-flex',
    exchangeId: 'htx',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 10 },
      { max: null, apr: 2.5 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'htx-usdc-flex',
    exchangeId: 'htx',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [{ max: null, apr: 5 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'htx-usde-flex',
    exchangeId: 'htx',
    asset: 'USDE',
    productType: 'flexible',
    tiers: [{ max: null, apr: 5 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'htx-usdd-flex',
    exchangeId: 'htx',
    asset: 'USDD',
    productType: 'flexible',
    tiers: [{ max: null, apr: 5 }],
    updatedAt: '2026-03-10',
  },
  {
    id: 'htx-usd1-flex',
    exchangeId: 'htx',
    asset: 'USD1',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 15 },
      { max: null, apr: 4 },
    ],
    updatedAt: '2026-03-10',
  },

  /* === XT === */
  {
    id: 'xt-usdt-flex',
    exchangeId: 'xt',
    asset: 'USDT',
    productType: 'flexible',
    tiers: [
      { max: 200, apr: 12 },
      { max: 500, apr: 7 },
      { max: null, apr: 2.3 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'xt-usdc-flex',
    exchangeId: 'xt',
    asset: 'USDC',
    productType: 'flexible',
    tiers: [
      { max: 500, apr: 15 },
      { max: null, apr: 2.5 },
    ],
    updatedAt: '2026-03-10',
  },
  {
    id: 'xt-dai-flex',
    exchangeId: 'xt',
    asset: 'DAI',
    productType: 'flexible',
    tiers: [{ max: null, apr: 1 }],
    updatedAt: '2026-03-10',
  },
]
