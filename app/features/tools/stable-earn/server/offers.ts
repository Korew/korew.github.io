import type { ExchangeId } from '../types'
import { bybitStableEarnProvider } from './providers/bybit'
import type {
  FetchStableEarnProviderOptions,
  StableEarnProvider,
} from './providers/types'

export const stableEarnProviders = [bybitStableEarnProvider] as const

export type StableEarnProviderId = (typeof stableEarnProviders)[number]['id']

export interface FetchLiveStableEarnOffersOptions
  extends Pick<FetchStableEarnProviderOptions, 'assets' | 'fetch' | 'signal'> {
  providerIds?: StableEarnProviderId[]
}

const stableEarnProviderById = new Map<ExchangeId, StableEarnProvider>(
  stableEarnProviders.map(provider => [provider.id, provider])
)

export const defaultStableEarnProviderIds: StableEarnProviderId[] = ['bybit']

export function isStableEarnProviderId(
  providerId: string
): providerId is StableEarnProviderId {
  return stableEarnProviderById.has(providerId as ExchangeId)
}

export async function fetchLiveStableEarnOffers(
  options: FetchLiveStableEarnOffersOptions = {}
) {
  const providerIds = options.providerIds ?? defaultStableEarnProviderIds
  const providers = providerIds.map(providerId => {
    const provider = stableEarnProviderById.get(providerId)

    if (!provider) {
      throw new Error(`Unsupported stable earn provider: ${providerId}`)
    }

    return provider
  })

  const providerOfferLists = await Promise.all(
    providers.map(provider =>
      provider.fetchOffers({
        assets: options.assets,
        fetch: options.fetch,
        signal: options.signal,
      })
    )
  )

  return providerOfferLists.flat()
}
