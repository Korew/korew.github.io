import { describe, expect, it } from 'vitest'
import {
  OKX_LENDING_RATE_SUMMARY_URL,
  OKX_SIMPLE_EARN_COMPENSATION_CONFIG_URL,
  OKX_SIMPLE_EARN_ESTIMATED_RATE_URL,
  OKX_SIMPLE_EARN_PAGE_URL,
  extractOkxSimpleEarnData,
  fetchOkxLendingRateSummaryOffers,
  normalizeOkxLendingRateSummaries,
  normalizeOkxSimpleEarnCurrencies,
  okxStableEarnProvider,
  type OkxLendingRateSummary,
  type OkxSimpleEarnCurrency,
} from '../../app/features/tools/stable-earn/server/providers/okx'

const fetchedAt = '2026-08-13T10:23:45.000Z'

describe('OKX stable earn provider', () => {
  it('extracts Simple Earn data from OKX page state', () => {
    const html = createSimpleEarnPageHtml([createUsdtSimpleEarnCurrency()])

    expect(
      extractOkxSimpleEarnData(html)?.allProducts?.currencies
    ).toHaveLength(1)
  })

  it('normalizes Simple Earn flexible, promo, and fixed products', () => {
    const offers = normalizeOkxSimpleEarnCurrencies(
      [createUsdtSimpleEarnCurrency()],
      fetchedAt,
      new Map([
        [
          'USDT:7',
          {
            estimatedRate: {
              estimatedRateNum: {
                type: '2',
                value: '0.0232',
              },
            },
            compensationConfigs: [
              {
                bonusLimit: 500,
                bonusRateNum: {
                  type: '1',
                  value: '10.00',
                },
                boostDay: 180,
                currencyId: 7,
                currencySymbol: 'USDT',
              },
            ],
          },
        ],
      ])
    )

    expect(offers).toHaveLength(3)

    expect(
      offers.find(offer => offer.id === 'okx-simple-earn-flexible-usdt')
    ).toMatchObject({
      asset: 'USDT',
      exchangeId: 'okx',
      isPromo: false,
      maxAmount: null,
      notes: 'Simple Earn regular flexible APR',
      productType: 'flexible',
      source: 'scrape',
      sourceUrl: OKX_SIMPLE_EARN_PAGE_URL,
      status: 'available',
      termDays: null,
    })
    expect(
      offers.find(offer => offer.id === 'okx-simple-earn-flexible-usdt')
        ?.tiers[0]?.apr
    ).toBeCloseTo(2.32)

    expect(
      offers.find(offer => offer.id === 'okx-simple-earn-promo-usdt')
    ).toMatchObject({
      asset: 'USDT',
      isPromo: true,
      maxAmount: 500,
      newUserOnly: true,
      notes: 'New-user bonus for 180 days, capped at 500 USDT',
      productType: 'flexible',
      status: 'available',
      termDays: null,
    })
    expect(
      offers.find(offer => offer.id === 'okx-simple-earn-promo-usdt')
        ?.tiers[0]
    ).toMatchObject({
      apr: 10,
      maxAmount: 500,
    })

    expect(
      offers.find(offer => offer.id === 'okx-simple-earn-fixed-usdt-90')
    ).toMatchObject({
      asset: 'USDT',
      isFlexible: false,
      productType: 'fixed',
      status: 'sold_out',
      termDays: 90,
    })
    expect(
      offers.find(offer => offer.id === 'okx-simple-earn-fixed-usdt-90')
        ?.tiers[0]?.apr
    ).toBeCloseTo(3.5)
  })

  it('fetches Simple Earn offers and does not use lending fallback', async () => {
    const calls: string[] = []
    const offers = await okxStableEarnProvider.fetchOffers({
      assets: ['USDT'],
      fetchedAt,
      fetch: async input => {
        calls.push(String(input))

        return createOkxFetchResponse(input)
      },
    })

    expect(offers).toHaveLength(3)
    expect(offers.map(offer => offer.id)).toEqual([
      'okx-simple-earn-flexible-usdt',
      'okx-simple-earn-promo-usdt',
      'okx-simple-earn-fixed-usdt-90',
    ])
    expect(calls).not.toContain(OKX_LENDING_RATE_SUMMARY_URL)
  })

  it('falls back to public lending summaries when Simple Earn is empty', async () => {
    const summaries: OkxLendingRateSummary[] = [
      {
        ccy: 'USDC',
        estRate: '0.026',
      },
    ]

    const offers = await okxStableEarnProvider.fetchOffers({
      fetchedAt,
      fetch: async input => {
        if (String(input) === OKX_SIMPLE_EARN_PAGE_URL) {
          return new Response(createSimpleEarnPageHtml([]))
        }

        expect(String(input)).toBe(OKX_LENDING_RATE_SUMMARY_URL)

        return new Response(
          JSON.stringify({
            code: 0,
            data: summaries,
          })
        )
      },
    })

    expect(offers).toHaveLength(1)
    expect(offers[0]).toMatchObject({
      id: 'okx-lending-summary-usdc',
      asset: 'USDC',
      notes: 'Lending-market APR fallback',
      productType: 'flexible',
      source: 'api',
    })
    expect(offers[0]?.tiers[0]?.apr).toBeCloseTo(2.6)
  })

  it('normalizes public lending summaries into flexible earn offers', () => {
    const offers = normalizeOkxLendingRateSummaries(
      [
        {
          ccy: 'USDC',
          estRate: '0.026',
          avgRate: '0.025',
          preRate: '0.024',
        },
      ],
      fetchedAt
    )

    expect(offers).toHaveLength(1)
    expect(offers[0]).toMatchObject({
      id: 'okx-lending-summary-usdc',
      exchangeId: 'okx',
      asset: 'USDC',
      productType: 'flexible',
      source: 'api',
      sourceUrl:
        'https://www.okx.com/api/v5/finance/savings/lending-rate-summary?ccy=USDC',
      fetchedAt,
      minAmount: 0,
      maxAmount: null,
      remainingCapacity: null,
      status: 'available',
      termDays: null,
      isFlexible: true,
      isPromo: false,
      newUserOnly: false,
      requiresAuth: false,
      regionNotes: [
        'OKX Simple Earn availability depends on account region',
      ],
      notes: 'Lending-market APR fallback',
    })
    expect(offers[0]?.tiers).toHaveLength(1)
    expect(offers[0]?.tiers[0]).toMatchObject({
      minAmount: 0,
      maxAmount: null,
      status: 'available',
    })
    expect(offers[0]?.tiers[0]?.apr).toBeCloseTo(2.6)
  })

  it('filters unsupported assets and invalid rates', () => {
    const offers = normalizeOkxLendingRateSummaries(
      [
        {
          ccy: 'BTC',
          estRate: '0.005',
        },
        {
          ccy: 'USDT',
          estRate: 'not-a-number',
        },
      ],
      fetchedAt
    )

    expect(offers).toEqual([])
  })

  it('fetches public OKX lending summaries with an injected fetcher', async () => {
    const summaries: OkxLendingRateSummary[] = [
      {
        ccy: 'USDT',
        estRate: '0.028',
      },
      {
        ccy: 'USDC',
        estRate: '0.026',
      },
    ]

    const offers = await fetchOkxLendingRateSummaryOffers({
      assets: ['USDT'],
      fetchedAt,
      fetch: async input => {
        expect(String(input)).toBe(OKX_LENDING_RATE_SUMMARY_URL)

        return new Response(
          JSON.stringify({
            code: 0,
            data: summaries,
          })
        )
      },
    })

    expect(offers).toHaveLength(1)
    expect(offers[0]?.asset).toBe('USDT')
    expect(offers[0]?.tiers[0]?.apr).toBeCloseTo(2.8)
  })
})

function createOkxFetchResponse(input: string | URL): Response {
  const url = new URL(String(input))

  if (url.toString() === OKX_SIMPLE_EARN_PAGE_URL) {
    return new Response(
      createSimpleEarnPageHtml([createUsdtSimpleEarnCurrency()])
    )
  }

  if (url.origin + url.pathname === OKX_SIMPLE_EARN_ESTIMATED_RATE_URL) {
    expect(url.searchParams.get('currencyId')).toBe('7')

    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          estimatedRateNum: {
            type: '2',
            value: '0.0232',
          },
        },
      })
    )
  }

  if (
    url.origin + url.pathname ===
    OKX_SIMPLE_EARN_COMPENSATION_CONFIG_URL
  ) {
    expect(url.searchParams.get('currencyId')).toBe('7')

    return new Response(
      JSON.stringify({
        code: 0,
        data: [
          {
            bonusLimit: 500,
            bonusRateNum: {
              type: '1',
              value: '10.00',
            },
            boostDay: 180,
            currencyId: 7,
            currencySymbol: 'USDT',
          },
        ],
      })
    )
  }

  throw new Error(`Unexpected OKX test URL: ${url.toString()}`)
}

function createSimpleEarnPageHtml(
  currencies: OkxSimpleEarnCurrency[]
): string {
  const appState = {
    appContext: {
      initialProps: {
        preData: {
          simpleEarnStore: {
            simpleEarnData: {
              allProducts: {
                currencies,
              },
            },
          },
        },
      },
    },
  }

  return `<script type="application/json" id="appState">${JSON.stringify(
    appState
  )}</script>`
}

function createUsdtSimpleEarnCurrency(): OkxSimpleEarnCurrency {
  return {
    investCurrency: {
      currencyId: 7,
      currencyName: 'USDT',
    },
    products: [
      {
        bonusDescription: '10% bonus for 180 days | New users only',
        productsType: 1,
        purchaseStatus: 1,
        rate: {
          rateNum: {
            type: '1',
            value: ['10.000000'],
          },
        },
        term: {
          type: 'DAY',
          value: 1,
        },
        type: 1,
      },
      {
        bonusDescription: '',
        productsType: 66,
        purchaseStatus: 2,
        rate: {
          rateNum: {
            type: '1',
            value: ['3.50'],
          },
        },
        term: {
          type: 'DAY',
          value: 90,
        },
        type: 90,
      },
    ],
  }
}
