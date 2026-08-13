import { describe, expect, it } from 'vitest'
import {
  allocateStableEarn,
  createStableEarnOffer,
} from '../../app/features/tools/stable-earn/helpers'
import type { CreateEarnOfferInput } from '../../app/features/tools/stable-earn/types'

function createOffer(input: Partial<CreateEarnOfferInput> = {}) {
  return createStableEarnOffer({
    id: 'binance-usdt-flex',
    exchangeId: 'binance',
    asset: 'USDT',
    productType: 'flexible',
    source: 'temporary_test_data',
    fetchedAt: '2026-03-12',
    tiers: [{ maxAmount: null, apr: 5 }],
    ...input,
  })
}

describe('stable earn allocation', () => {
  it('treats an empty exchange filter as no allowed exchanges', () => {
    const result = allocateStableEarn({
      totalAmount: 1000,
      offers: [createOffer()],
      allowedExchangeIds: [],
    })

    expect(result.segments).toEqual([])
    expect(result.allocatedAmount).toBe(0)
    expect(result.unallocatedAmount).toBe(1000)
  })

  it('uses all exchanges when the exchange filter is omitted', () => {
    const result = allocateStableEarn({
      totalAmount: 1000,
      offers: [createOffer()],
    })

    expect(result.allocatedAmount).toBe(1000)
    expect(result.unallocatedAmount).toBe(0)
  })

  it('supports explicit multi-asset filters', () => {
    const result = allocateStableEarn({
      totalAmount: 1000,
      offers: [
        createOffer({ id: 'binance-usdt-flex', asset: 'USDT' }),
        createOffer({
          id: 'bybit-usdc-flex',
          exchangeId: 'bybit',
          asset: 'USDC',
          tiers: [{ maxAmount: null, apr: 8 }],
        }),
      ],
      assets: ['USDC'],
    })

    expect(result.segments).toHaveLength(1)
    expect(result.segments[0]?.asset).toBe('USDC')
    expect(result.weightedApr).toBe(8)
  })

  it('treats an empty asset filter as no allowed assets', () => {
    const result = allocateStableEarn({
      totalAmount: 1000,
      offers: [createOffer()],
      assets: [],
    })

    expect(result.segments).toEqual([])
    expect(result.unallocatedAmount).toBe(1000)
  })

  it('skips unavailable offers and tiers', () => {
    const result = allocateStableEarn({
      totalAmount: 1000,
      offers: [
        createOffer({
          id: 'paused-usdt-flex',
          status: 'paused',
          tiers: [{ maxAmount: null, apr: 50 }],
        }),
        createOffer({
          id: 'available-usdt-flex',
          tiers: [
            { maxAmount: 500, apr: 20, status: 'sold_out' },
            { maxAmount: null, apr: 4 },
          ],
        }),
      ],
    })

    expect(result.segments).toHaveLength(1)
    expect(result.segments[0]?.apr).toBe(4)
  })

  it('caps allocation by offer and tier remaining capacity', () => {
    const result = allocateStableEarn({
      totalAmount: 1000,
      offers: [
        createOffer({
          remainingCapacity: 250,
          tiers: [
            { maxAmount: 200, apr: 10 },
            { maxAmount: null, apr: 5, remainingCapacity: 100 },
          ],
        }),
      ],
    })

    expect(result.allocatedAmount).toBe(250)
    expect(result.unallocatedAmount).toBe(750)
    expect(result.segments.map(segment => segment.amount)).toEqual([200, 50])
  })

  it('does not allocate to an offer below its minimum amount', () => {
    const result = allocateStableEarn({
      totalAmount: 50,
      offers: [
        createOffer({
          minAmount: 100,
          tiers: [{ maxAmount: null, apr: 12 }],
        }),
      ],
    })

    expect(result.allocatedAmount).toBe(0)
    expect(result.unallocatedAmount).toBe(50)
  })
})
