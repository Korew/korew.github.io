import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearStableEarnOffersCache,
  fetchStableEarnOffers,
} from '../../app/features/tools/stable-earn/server/offers'
import type { BybitEarnProduct } from '../../app/features/tools/stable-earn/server/providers/bybit'

const now = '2026-08-13T10:00:00.000Z'

describe('stable earn offers cache', () => {
  beforeEach(() => {
    clearStableEarnOffersCache()
  })

  it('serves fresh provider offers from cache within the ttl', async () => {
    const fetcher = vi.fn(async () => createBybitResponse())

    const firstResult = await fetchStableEarnOffers({
      providerIds: ['bybit'],
      assets: ['USDT'],
      fetch: fetcher,
      now,
      cacheTtlMs: 60_000,
    })
    const secondResult = await fetchStableEarnOffers({
      providerIds: ['bybit'],
      assets: ['USDT'],
      fetch: fetcher,
      now: '2026-08-13T10:00:30.000Z',
      cacheTtlMs: 60_000,
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(firstResult.meta.dataSource).toBe('live')
    expect(secondResult.meta.dataSource).toBe('cache')
    expect(secondResult.meta.cache.hit).toBe(true)
    expect(secondResult.offers[0]?.source).toBe('api')
  })

  it('uses stale cache when refresh fails after the ttl expires', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(createBybitResponse())
      .mockResolvedValueOnce(new Response('', { status: 503 }))

    await fetchStableEarnOffers({
      providerIds: ['bybit'],
      assets: ['USDT'],
      fetch: fetcher,
      now,
      cacheTtlMs: 1,
    })
    const staleResult = await fetchStableEarnOffers({
      providerIds: ['bybit'],
      assets: ['USDT'],
      fetch: fetcher,
      now: '2026-08-13T10:00:01.000Z',
      cacheTtlMs: 1,
    })

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(staleResult.meta.dataSource).toBe('stale_cache')
    expect(staleResult.meta.cache.hit).toBe(true)
    expect(staleResult.meta.fallbackReason).toContain('503')
    expect(staleResult.offers[0]?.source).toBe('api')
  })

  it('fails visibly when provider fetch fails without cached offers', async () => {
    await expect(
      fetchStableEarnOffers({
        providerIds: ['bybit'],
        assets: ['USDT'],
        fetch: async () => new Response('', { status: 503 }),
        now,
      })
    ).rejects.toThrow('503')
  })
})

function createBybitResponse() {
  const products: BybitEarnProduct[] = [
    {
      category: 'FlexibleSaving',
      estimateApr: '1.81%',
      coin: 'USDT',
      minStakeAmount: '1.5',
      maxStakeAmount: '100000000',
      productId: '1',
      status: 'Available',
      tierAprDetails: [
        { min: '0', max: '200', estimateApr: '6.81%' },
        { min: '200', max: '-1', estimateApr: '1.81%' },
      ],
      remainingPoolAmount: '-1',
    },
  ]

  return new Response(
    JSON.stringify({
      retCode: 0,
      result: { list: products },
      time: Date.parse(now),
    })
  )
}
