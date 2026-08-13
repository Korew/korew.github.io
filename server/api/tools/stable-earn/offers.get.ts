import { createError, defineEventHandler, getQuery } from 'h3'
import {
  defaultStableEarnProviderIds,
  fetchLiveStableEarnOffers,
  isStableEarnProviderId,
  type StableEarnProviderId,
} from '../../../../app/features/tools/stable-earn/server/offers'
import { isStableEarnAsset } from '../../../../app/features/tools/stable-earn/const'
import type { StableAsset } from '../../../../app/features/tools/stable-earn/types'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const providerIds = parseProviderIds(query.providers ?? query.provider)
  const assets = parseAssets(query.assets ?? query.asset)

  try {
    const offers = await fetchLiveStableEarnOffers({
      providerIds,
      assets,
      signal: event.node.req.signal,
    })

    return {
      offers,
      meta: {
        count: offers.length,
        providerIds,
        assets: assets ?? null,
        fetchedAt: new Date().toISOString(),
      },
    }
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

function parseProviderIds(value: unknown): StableEarnProviderId[] {
  const providerIds = parseQueryList(value)

  if (providerIds.length === 0) {
    return defaultStableEarnProviderIds
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
