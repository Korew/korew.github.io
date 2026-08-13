import { describe, expect, it } from 'vitest'
import {
  bybitStableEarnProvider,
  normalizeBybitEarnProducts,
  type BybitEarnProduct,
} from '../../app/features/tools/stable-earn/server/providers/bybit'

const fetchedAt = '2026-08-12T15:34:45.000Z'

describe('Bybit stable earn provider', () => {
  it('normalizes tiered flexible savings products into earn offers', () => {
    const offers = normalizeBybitEarnProducts(
      [
        {
          category: 'FlexibleSaving',
          estimateApr: '1.81%',
          coin: 'USDT',
          minStakeAmount: '1.5',
          maxStakeAmount: '100000000',
          productId: '1',
          status: 'Available',
          bonusEvents: [],
          duration: '',
          term: 0,
          hasTieredApr: true,
          tierAprDetails: [
            { min: '0', max: '200', estimateApr: '6.81%' },
            { min: '200', max: '-1', estimateApr: '1.81%' },
          ],
          remainingPoolAmount: '-1',
        },
      ],
      fetchedAt
    )

    expect(offers).toHaveLength(1)
    expect(offers[0]).toMatchObject({
      id: 'bybit-flexible-saving-usdt-1',
      exchangeId: 'bybit',
      asset: 'USDT',
      productType: 'flexible',
      source: 'api',
      sourceUrl:
        'https://api.bybit.com/v5/earn/product?category=FlexibleSaving&coin=USDT',
      fetchedAt,
      minAmount: 1.5,
      maxAmount: 100000000,
      remainingCapacity: null,
      status: 'available',
      termDays: null,
      isFlexible: true,
      isPromo: false,
      newUserOnly: false,
      requiresAuth: false,
      regionNotes: [],
    })
    expect(offers[0]?.tiers).toHaveLength(2)
    expect(offers[0]?.tiers[0]).toMatchObject({
      minAmount: 0,
      maxAmount: 200,
      apr: 6.81,
      status: 'available',
    })
    expect(offers[0]?.tiers[1]).toMatchObject({
      minAmount: 200,
      maxAmount: 100000000,
      apr: 1.81,
      status: 'available',
    })
  })

  it('uses the documented single APR fields when tier details are absent', () => {
    const offers = normalizeBybitEarnProducts(
      [
        {
          category: 'FlexibleSaving',
          estimateApr: '2.15%',
          coin: 'RLUSD',
          minStakeAmount: '1',
          maxStakeAmount: '10000000',
          productId: '1102',
          status: 'Available',
          bonusEvents: [{ apr: '1%', coin: 'RLUSD' }],
          remainingPoolAmount: '999841325.05158732',
        },
      ],
      fetchedAt
    )

    expect(offers).toHaveLength(1)
    expect(offers[0]).toMatchObject({
      id: 'bybit-flexible-saving-rlusd-1102',
      asset: 'RLUSD',
      isPromo: true,
    })
    expect(offers[0]?.remainingCapacity).toBeCloseTo(
      Number('999841325.05158732')
    )
    expect(offers[0]?.tiers[0]).toMatchObject({
      minAmount: 1,
      maxAmount: 10000000,
      apr: 2.15,
    })
  })

  it('filters unsupported coins and invalid APR records', () => {
    const offers = normalizeBybitEarnProducts(
      [
        {
          coin: 'BTC',
          estimateApr: '1%',
          productId: '1',
        },
        {
          coin: 'USDC',
          estimateApr: '',
          productId: '2',
        },
      ],
      fetchedAt
    )

    expect(offers).toEqual([])
  })

  it('fetches public Bybit offers with an injected fetcher', async () => {
    const products: BybitEarnProduct[] = [
      {
        category: 'FlexibleSaving',
        estimateApr: '0.5%',
        coin: 'USD1',
        minStakeAmount: '1',
        maxStakeAmount: '1000000',
        productId: '1131',
        status: 'Available',
        tierAprDetails: [],
        remainingPoolAmount: '98969134.97272017',
      },
    ]

    const offers = await bybitStableEarnProvider.fetchOffers({
      fetchedAt,
      fetch: async input => {
        expect(String(input)).toBe(
          'https://api.bybit.com/v5/earn/product?category=FlexibleSaving'
        )

        return new Response(
          JSON.stringify({
            retCode: 0,
            result: { list: products },
          })
        )
      },
    })

    expect(offers.map(offer => offer.asset)).toEqual(['USD1'])
  })
})
