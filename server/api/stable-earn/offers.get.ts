import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, getQuery } from 'h3'
import {
  fetchStableEarnOffers,
  isStableEarnProviderId,
  type StableEarnProviderId,
} from '../../../app/features/tools/stable-earn/server/offers'
import { isStableEarnAsset } from '../../../app/features/tools/stable-earn/const'
import type { StableAsset } from '../../../app/features/tools/stable-earn/types'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const providerIds = parseProviderIds(query.providers ?? query.provider)
  const assets = parseAssets(query.assets ?? query.asset)
  const runtimeConfig = useRuntimeConfig(event)

  try {
    return await fetchStableEarnOffers({
      providerIds,
      assets,
      signal: event.node.req.signal,
      forceRefresh: parseBoolean(query.refresh),
      cacheTtlMs: parseCacheTtlMs(
        runtimeConfig.stableEarn.cacheTtlSeconds
      ),
    })
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage:
        error instanceof Error
          ? error.message
          : 'Failed to fetch stable earn offers',
    })
  }
})

function parseProviderIds(value: unknown): StableEarnProviderId[] | undefined {
  const providerIds = parseQueryList(value)

  if (providerIds.length === 0) {
    return undefined
  }

  const invalidProvider = providerIds.find(
    providerId => !isStableEarnProviderId(providerId)
  )

  if (invalidProvider) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported stable earn provider: ${invalidProvider}`,
    })
  }

  return providerIds
}

function parseAssets(value: unknown): StableAsset[] | undefined {
  const assets = parseQueryList(value).map(asset => asset.toUpperCase())

  if (assets.length === 0) {
    return undefined
  }

  const invalidAsset = assets.find(asset => !isStableEarnAsset(asset))

  if (invalidAsset) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported stable earn asset: ${invalidAsset}`,
    })
  }

  return assets
}

function parseQueryList(value: unknown): string[] {
  if (value === undefined || value === null) {
    return []
  }

  const values = Array.isArray(value) ? value : [value]

  return values
    .flatMap(item => String(item).split(','))
    .map(item => item.trim())
    .filter(Boolean)
}

function parseBoolean(value: unknown): boolean {
  const [firstValue] = parseQueryList(value)

  if (!firstValue) {
    return false
  }

  return ['1', 'true', 'yes'].includes(firstValue.toLowerCase())
}

function parseCacheTtlMs(value: unknown): number | undefined {
  const ttlSeconds = Number(value)

  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    return undefined
  }

  return ttlSeconds * 1000
}
