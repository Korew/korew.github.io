import { describe, expect, it } from 'vitest'
import {
  createStableEarnOffer,
  normalizeEarnRate,
} from '../../app/features/tools/stable-earn/helpers'

describe('stable earn rate normalization', () => {
  it('keeps percent APR values as APR', () => {
    const rate = normalizeEarnRate({
      value: '5.5%',
      kind: 'apr',
      valueFormat: 'percent',
    })

    expect(rate.annualRatePercent).toBe(5.5)
    expect(rate.apr).toBe(5.5)
  })

  it('converts decimal APR values into percent APR', () => {
    const rate = normalizeEarnRate({
      value: 0.0568,
      kind: 'apr',
      valueFormat: 'decimal',
    })

    expect(rate.apr).toBeCloseTo(5.68)
  })

  it('converts basis points into percent APR', () => {
    const rate = normalizeEarnRate({
      value: 250,
      kind: 'apr',
      valueFormat: 'basisPoints',
    })

    expect(rate.apr).toBe(2.5)
  })

  it('converts APY to an APR equivalent with explicit compounding', () => {
    const rate = normalizeEarnRate({
      value: 5,
      kind: 'apy',
      valueFormat: 'percent',
      compoundingPeriodsPerYear: 365,
    })

    expect(rate.apr).toBeLessThan(5)
    expect(rate.apr).toBeCloseTo(4.879, 3)
  })

  it('rejects APY values without compounding details', () => {
    expect(() =>
      normalizeEarnRate({
        value: 5,
        kind: 'apy',
        valueFormat: 'percent',
      })
    ).toThrow('APY normalization requires compoundingPeriodsPerYear')
  })

  it('creates complete manual offer records from compact input', () => {
    const offer = createStableEarnOffer({
      id: 'example-usdt-flex',
      exchangeId: 'binance',
      asset: 'USDT',
      productType: 'flexible',
      fetchedAt: '2026-03-12',
      tiers: [{ maxAmount: 200, apr: 3.84 }],
    })

    expect(offer.source).toBe('manual')
    expect(offer.fetchedAt).toBe('2026-03-12')
    expect(offer.status).toBe('available')
    expect(offer.isFlexible).toBe(true)
    expect(offer.newUserOnly).toBe(false)
    expect(offer.requiresAuth).toBe(false)
    expect(offer.regionNotes).toEqual([])
    expect(offer.tiers[0]?.rate.apr).toBe(3.84)
  })
})
