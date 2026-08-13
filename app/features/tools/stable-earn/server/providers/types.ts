import type { EarnOffer, ExchangeId, StableAsset } from '../../types'

export type StableEarnProviderFetch = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>

export interface FetchStableEarnProviderOptions {
  assets?: StableAsset[]
  fetchedAt?: Date | string
  fetch?: StableEarnProviderFetch
  signal?: AbortSignal
}

export interface StableEarnProvider {
  id: ExchangeId
  name: string
  requiresAuth: boolean
  fetchOffers(options?: FetchStableEarnProviderOptions): Promise<EarnOffer[]>
}
