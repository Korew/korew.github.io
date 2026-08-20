import { isStableEarnAsset } from '../../const'
import { createStableEarnOffer } from '../../helpers'
import type {
  CreateEarnOfferTierInput,
  EarnOffer,
  EarnOfferStatus,
  StableAsset,
} from '../../types'
import type {
  FetchStableEarnProviderOptions,
  StableEarnProvider,
  StableEarnProviderFetch,
} from './types'

export const OKX_SIMPLE_EARN_PAGE_URL =
  'https://www.okx.com/ua/earn/simple-earn'
export const OKX_SIMPLE_EARN_ESTIMATED_RATE_URL =
  'https://www.okx.com/priapi/v2/financial/earn/estimated-rate'
export const OKX_SIMPLE_EARN_COMPENSATION_CONFIG_URL =
  'https://www.okx.com/priapi/v2/financial/earn/compensation-config'
export const OKX_LENDING_RATE_SUMMARY_URL =
  'https://www.okx.com/api/v5/finance/savings/lending-rate-summary'

const OKX_SIMPLE_EARN_REGION_NOTE =
  'OKX Simple Earn availability depends on account region'

interface OkxRateNumber {
  type?: number | string
  value?: number | string | Array<number | string>
}

interface OkxRate {
  rateNum?: OkxRateNumber
  rateType?: string
}

interface OkxTerm {
  type?: string
  value?: number | string
}

export interface OkxSimpleEarnProduct {
  bonusDescription?: string
  productsType?: number | string
  purchaseStatus?: number | string
  rate?: OkxRate
  term?: OkxTerm
  type?: number | string
}

export interface OkxSimpleEarnCurrency {
  currencyId?: number | string
  currencyName?: string
  investCurrency?: {
    currencyId?: number | string
    currencyName?: string
  }
  products?: OkxSimpleEarnProduct[]
  rate?: OkxRate
}

export interface OkxSimpleEarnData {
  allProducts?: {
    currencies?: OkxSimpleEarnCurrency[]
  }
}

export interface OkxSimpleEarnEstimatedRate {
  estimatedRate?: number | string
  estimatedRateNum?: OkxRateNumber
}

interface OkxSimpleEarnEstimatedRateResponse {
  code?: number | string
  data?: OkxSimpleEarnEstimatedRate
  msg?: string
}

export interface OkxSimpleEarnCompensationConfig {
  bonusLimit?: number | string
  bonusRate?: string
  bonusRateNum?: OkxRateNumber
  boostDay?: number | string
  currencyId?: number | string
  currencySymbol?: string
}

interface OkxSimpleEarnCompensationConfigResponse {
  code?: number | string
  data?: OkxSimpleEarnCompensationConfig[]
  msg?: string
}

export interface OkxSimpleEarnSupplement {
  compensationConfigs: OkxSimpleEarnCompensationConfig[]
  estimatedRate: OkxSimpleEarnEstimatedRate | null
}

export interface OkxLendingRateSummary {
  avgAmt?: string
  avgAmtUsd?: string
  avgRate?: string
  ccy?: string
  estRate?: string
  preRate?: string
}

interface OkxLendingRateSummaryResponse {
  code?: number | string
  data?: OkxLendingRateSummary[]
  msg?: string
}

export const okxStableEarnProvider: StableEarnProvider = {
  id: 'okx',
  name: 'OKX',
  requiresAuth: false,
  async fetchOffers(options = {}) {
    return fetchOkxEarnOffers(options)
  },
}

export async function fetchOkxEarnOffers(
  options: FetchStableEarnProviderOptions = {}
): Promise<EarnOffer[]> {
  let simpleEarnError: unknown = null

  try {
    const simpleEarnOffers = await fetchOkxSimpleEarnOffers(options)

    if (simpleEarnOffers.length > 0) {
      return simpleEarnOffers
    }
  } catch (error) {
    simpleEarnError = error
  }

  try {
    return await fetchOkxLendingRateSummaryOffers(options)
  } catch (error) {
    if (simpleEarnError) {
      throw new Error(
        `OKX Simple Earn failed: ${getErrorMessage(simpleEarnError)}; ` +
        `OKX lending summary failed: ${getErrorMessage(error)}`
      )
    }

    throw error
  }
}

export async function fetchOkxSimpleEarnOffers(
  options: FetchStableEarnProviderOptions = {}
): Promise<EarnOffer[]> {
  const fetcher = options.fetch ?? globalThis.fetch
  const html = await fetchWithText(
    fetcher,
    new URL(OKX_SIMPLE_EARN_PAGE_URL),
    {
      signal: options.signal,
    }
  )
  const simpleEarnData = extractOkxSimpleEarnData(html)
  const currencies = simpleEarnData?.allProducts?.currencies ?? []
  const requestedAssets = options.assets
    ? new Set<StableAsset>(options.assets)
    : null
  const stableCurrencies = currencies.filter(currency => {
    const asset = normalizeOkxSimpleEarnAsset(currency)

    return asset && (!requestedAssets || requestedAssets.has(asset))
  })
  const fetchedAt = normalizeFetchedAt(options.fetchedAt ?? new Date())
  const supplementEntries = await Promise.all(
    stableCurrencies.map(async currency => {
      const asset = normalizeOkxSimpleEarnAsset(currency)
      const currencyId = normalizeOkxCurrencyId(currency)

      if (!asset || !currencyId) {
        return null
      }

      return [
        createOkxSimpleEarnSupplementKey(asset, currencyId),
        await fetchOkxSimpleEarnSupplement(fetcher, currencyId, options),
      ] as const
    })
  )
  const supplements = new Map(
    supplementEntries.filter(isOkxSupplementEntry)
  )

  return normalizeOkxSimpleEarnCurrencies(
    stableCurrencies,
    fetchedAt,
    supplements
  )
}

export function extractOkxSimpleEarnData(
  html: string
): OkxSimpleEarnData | null {
  const appState = extractOkxJsonScript(html, 'appState') as
    | {
        appContext?: {
          initialProps?: {
            preData?: {
              simpleEarnStore?: {
                simpleEarnData?: OkxSimpleEarnData
              }
            }
          }
        }
        simpleEarnData?: OkxSimpleEarnData
      }
      | null

  return (
    appState?.simpleEarnData ??
    appState?.appContext?.initialProps?.preData?.simpleEarnStore
      ?.simpleEarnData ??
      null
  )
}

export function normalizeOkxSimpleEarnCurrencies(
  currencies: OkxSimpleEarnCurrency[],
  fetchedAt: Date | string,
  supplements = new Map<string, OkxSimpleEarnSupplement>()
): EarnOffer[] {
  return currencies.flatMap(currency => {
    const asset = normalizeOkxSimpleEarnAsset(currency)
    const currencyId = normalizeOkxCurrencyId(currency)
    const products = currency.products ?? []

    if (!asset || !currencyId || products.length === 0) {
      return []
    }

    const supplement = supplements.get(
      createOkxSimpleEarnSupplementKey(asset, currencyId)
    ) ?? {
      compensationConfigs: [],
      estimatedRate: null,
    }
    const flexibleProducts = products.filter(isOkxFlexibleProduct)
    const fixedProducts = products.filter(isOkxFixedProduct)

    return [
      ...normalizeOkxSimpleEarnBaseOffers({
        asset,
        currencyId,
        fetchedAt: normalizeFetchedAt(fetchedAt),
        flexibleProducts,
        supplement,
      }),
      ...normalizeOkxSimpleEarnPromoOffers({
        asset,
        currencyId,
        fetchedAt: normalizeFetchedAt(fetchedAt),
        flexibleProducts,
        supplement,
      }),
      ...normalizeOkxSimpleEarnFixedOffers({
        asset,
        currencyId,
        fetchedAt: normalizeFetchedAt(fetchedAt),
        fixedProducts,
      }),
    ]
  })
}

export async function fetchOkxLendingRateSummaryOffers(
  options: FetchStableEarnProviderOptions = {}
): Promise<EarnOffer[]> {
  const url = new URL(OKX_LENDING_RATE_SUMMARY_URL)
  const fetcher = options.fetch ?? globalThis.fetch
  const response = await fetchWithJson<OkxLendingRateSummaryResponse>(
    fetcher,
    url,
    {
      signal: options.signal,
    }
  )

  if (String(response.code) !== '0') {
    throw new Error(
      `OKX lending rate summary error: ${
        response.msg || `code ${response.code}`
      }`
    )
  }

  const fetchedAt = normalizeFetchedAt(options.fetchedAt ?? new Date())
  const requestedAssets = options.assets
    ? new Set<StableAsset>(options.assets)
    : null

  return normalizeOkxLendingRateSummaries(
    response.data ?? [],
    fetchedAt
  ).filter(offer => {
    return requestedAssets ? requestedAssets.has(offer.asset) : true
  })
}

export function normalizeOkxLendingRateSummaries(
  summaries: OkxLendingRateSummary[],
  fetchedAt: Date | string
): EarnOffer[] {
  return summaries.flatMap(summary => {
    const asset = normalizeOkxStableAsset(summary.ccy)
    const tiers = createOkxLendingTierInputs(summary)

    if (!asset || tiers.length === 0) {
      return []
    }

    try {
      return [
        createStableEarnOffer({
          id: `okx-lending-summary-${asset.toLowerCase()}`,
          exchangeId: 'okx',
          asset,
          productType: 'flexible',
          source: 'api',
          sourceUrl: createOkxLendingSourceUrl(asset),
          fetchedAt: normalizeFetchedAt(fetchedAt),
          minAmount: 0,
          maxAmount: null,
          remainingCapacity: null,
          status: 'available',
          termDays: null,
          isFlexible: true,
          isPromo: false,
          newUserOnly: false,
          requiresAuth: false,
          regionNotes: [OKX_SIMPLE_EARN_REGION_NOTE],
          notes: 'Lending-market APR fallback',
          tiers,
        }),
      ]
    } catch {
      return []
    }
  })
}

function normalizeOkxSimpleEarnBaseOffers(options: {
  asset: StableAsset
  currencyId: string
  fetchedAt: string
  flexibleProducts: OkxSimpleEarnProduct[]
  supplement: OkxSimpleEarnSupplement
}): EarnOffer[] {
  const product = options.flexibleProducts[0]
  const estimatedRateInput = createOkxEstimatedRateInput(
    options.supplement.estimatedRate
  )
  const productRateInput =
    product && !isOkxPromoProduct(product)
      ? createOkxRateInput(product.rate)
      : null
  const tierRate = estimatedRateInput ?? productRateInput

  if (!product || !tierRate) {
    return []
  }

  try {
    return [
      createStableEarnOffer({
        id: `okx-simple-earn-flexible-${options.asset.toLowerCase()}`,
        exchangeId: 'okx',
        asset: options.asset,
        productType: 'flexible',
        source: 'scrape',
        sourceUrl: OKX_SIMPLE_EARN_PAGE_URL,
        fetchedAt: options.fetchedAt,
        minAmount: 0,
        maxAmount: null,
        remainingCapacity: null,
        status: normalizeOkxOfferStatus(product.purchaseStatus),
        termDays: null,
        isFlexible: true,
        isPromo: false,
        newUserOnly: false,
        requiresAuth: false,
        regionNotes: [OKX_SIMPLE_EARN_REGION_NOTE],
        notes: estimatedRateInput
          ? 'Simple Earn regular flexible APR'
          : 'Simple Earn flexible APR',
        tiers: [
          {
            minAmount: 0,
            maxAmount: null,
            rate: tierRate,
            status: normalizeOkxOfferStatus(product.purchaseStatus),
          },
        ],
      }),
    ]
  } catch {
    return []
  }
}

function normalizeOkxSimpleEarnPromoOffers(options: {
  asset: StableAsset
  currencyId: string
  fetchedAt: string
  flexibleProducts: OkxSimpleEarnProduct[]
  supplement: OkxSimpleEarnSupplement
}): EarnOffer[] {
  const promoProducts = options.flexibleProducts.filter(isOkxPromoProduct)

  return promoProducts.flatMap(product => {
    const compensationConfig = findOkxCompensationConfig(
      options.supplement.compensationConfigs,
      options.asset,
      options.currencyId
    )
    const maxAmount = normalizeOkxAmount(compensationConfig?.bonusLimit)
    const tierRate =
      createOkxRateInputFromRateNumber(compensationConfig?.bonusRateNum) ??
      createOkxPercentRateInput(compensationConfig?.bonusRate) ??
      createOkxRateInput(product.rate)

    if (!tierRate || !maxAmount || maxAmount <= 0) {
      return []
    }

    const boostDays = normalizeOkxAmount(compensationConfig?.boostDay)
    const notes = boostDays
      ? `New-user bonus for ${boostDays} days, capped at ${maxAmount} ${options.asset}`
      : `New-user bonus, capped at ${maxAmount} ${options.asset}`

    try {
      return [
        createStableEarnOffer({
          id: `okx-simple-earn-promo-${options.asset.toLowerCase()}`,
          exchangeId: 'okx',
          asset: options.asset,
          productType: 'flexible',
          source: 'scrape',
          sourceUrl: OKX_SIMPLE_EARN_PAGE_URL,
          fetchedAt: options.fetchedAt,
          minAmount: 0,
          maxAmount,
          remainingCapacity: null,
          status: normalizeOkxOfferStatus(product.purchaseStatus),
          termDays: null,
          isFlexible: true,
          isPromo: true,
          newUserOnly: true,
          requiresAuth: false,
          regionNotes: [OKX_SIMPLE_EARN_REGION_NOTE],
          notes,
          tiers: [
            {
              minAmount: 0,
              maxAmount,
              rate: tierRate,
              status: normalizeOkxOfferStatus(product.purchaseStatus),
            },
          ],
        }),
      ]
    } catch {
      return []
    }
  })
}

function normalizeOkxSimpleEarnFixedOffers(options: {
  asset: StableAsset
  currencyId: string
  fetchedAt: string
  fixedProducts: OkxSimpleEarnProduct[]
}): EarnOffer[] {
  return options.fixedProducts.flatMap(product => {
    const termDays = normalizeOkxTermDays(product)
    const tierRate = createOkxRateInput(product.rate)

    if (!termDays || !tierRate) {
      return []
    }

    const status = normalizeOkxOfferStatus(product.purchaseStatus)

    try {
      return [
        createStableEarnOffer({
          id:
            `okx-simple-earn-fixed-${options.asset.toLowerCase()}` +
            `-${termDays}`,
          exchangeId: 'okx',
          asset: options.asset,
          productType: 'fixed',
          source: 'scrape',
          sourceUrl: OKX_SIMPLE_EARN_PAGE_URL,
          fetchedAt: options.fetchedAt,
          minAmount: 0,
          maxAmount: null,
          remainingCapacity: null,
          status,
          termDays,
          isFlexible: false,
          isPromo: false,
          newUserOnly: false,
          requiresAuth: false,
          regionNotes: [OKX_SIMPLE_EARN_REGION_NOTE],
          notes:
            status === 'sold_out'
              ? 'Fixed Simple Earn is currently notify-only'
              : 'Fixed Simple Earn',
          tiers: [
            {
              minAmount: 0,
              maxAmount: null,
              rate: tierRate,
              status,
            },
          ],
        }),
      ]
    } catch {
      return []
    }
  })
}

async function fetchOkxSimpleEarnSupplement(
  fetcher: StableEarnProviderFetch,
  currencyId: string,
  options: FetchStableEarnProviderOptions
): Promise<OkxSimpleEarnSupplement> {
  const [estimatedRate, compensationConfigs] = await Promise.all([
    fetchOkxEstimatedRate(fetcher, currencyId, options).catch(() => null),
    fetchOkxCompensationConfigs(fetcher, currencyId, options).catch(() => []),
  ])

  return {
    compensationConfigs,
    estimatedRate,
  }
}

async function fetchOkxEstimatedRate(
  fetcher: StableEarnProviderFetch,
  currencyId: string,
  options: FetchStableEarnProviderOptions
): Promise<OkxSimpleEarnEstimatedRate | null> {
  const url = new URL(OKX_SIMPLE_EARN_ESTIMATED_RATE_URL)

  url.searchParams.set('currencyId', currencyId)

  const response = await fetchWithJson<OkxSimpleEarnEstimatedRateResponse>(
    fetcher,
    url,
    {
      signal: options.signal,
    }
  )

  if (String(response.code) !== '0') {
    throw new Error(
      `OKX estimated-rate error: ${response.msg || `code ${response.code}`}`
    )
  }

  return response.data ?? null
}

async function fetchOkxCompensationConfigs(
  fetcher: StableEarnProviderFetch,
  currencyId: string,
  options: FetchStableEarnProviderOptions
): Promise<OkxSimpleEarnCompensationConfig[]> {
  const url = new URL(OKX_SIMPLE_EARN_COMPENSATION_CONFIG_URL)

  url.searchParams.set('currencyId', currencyId)

  const response =
    await fetchWithJson<OkxSimpleEarnCompensationConfigResponse>(
      fetcher,
      url,
      {
        signal: options.signal,
      }
    )

  if (String(response.code) !== '0') {
    throw new Error(
      `OKX compensation-config error: ${
        response.msg || `code ${response.code}`
      }`
    )
  }

  return response.data ?? []
}

function createOkxLendingTierInputs(
  summary: OkxLendingRateSummary
): CreateEarnOfferTierInput[] {
  const rateValue = summary.estRate || summary.avgRate || summary.preRate

  if (!rateValue || !Number.isFinite(Number(rateValue))) {
    return []
  }

  return [
    {
      minAmount: 0,
      maxAmount: null,
      rate: {
        value: rateValue,
        kind: 'apr',
        valueFormat: 'decimal',
      },
    },
  ]
}

async function fetchWithJson<T>(
  fetcher: StableEarnProviderFetch,
  url: URL,
  init: RequestInit
): Promise<T> {
  const response = await fetcher(url.toString(), {
    ...init,
    headers: {
      'accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`OKX Earn API request failed with ${response.status}`)
  }

  return (await response.json()) as T
}

async function fetchWithText(
  fetcher: StableEarnProviderFetch,
  url: URL,
  init: RequestInit
): Promise<string> {
  const response = await fetcher(url.toString(), {
    ...init,
    headers: {
      'accept': 'text/html',
      'accept-language': 'uk-UA,uk;q=0.9,en;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`OKX Earn page request failed with ${response.status}`)
  }

  return response.text()
}

function extractOkxJsonScript(html: string, scriptId: string): unknown | null {
  const pattern = new RegExp(
    `<script[^>]*id=["']${scriptId}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    'i'
  )
  const match = html.match(pattern)
  const text = match?.[1]?.trim()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function normalizeOkxSimpleEarnAsset(
  currency: OkxSimpleEarnCurrency
): StableAsset | null {
  return normalizeOkxStableAsset(
    currency.investCurrency?.currencyName ?? currency.currencyName
  )
}

function normalizeOkxStableAsset(value?: string): StableAsset | null {
  const asset = value?.trim().toUpperCase()

  if (!asset || !isStableEarnAsset(asset)) {
    return null
  }

  return asset
}

function normalizeOkxCurrencyId(
  currency: OkxSimpleEarnCurrency
): string | null {
  const value = currency.investCurrency?.currencyId ?? currency.currencyId

  if (value === undefined || value === null || value === '') {
    return null
  }

  return String(value)
}

function createOkxSimpleEarnSupplementKey(
  asset: StableAsset,
  currencyId: string
): string {
  return `${asset}:${currencyId}`
}

function isOkxSupplementEntry(
  entry: readonly [string, OkxSimpleEarnSupplement] | null
): entry is readonly [string, OkxSimpleEarnSupplement] {
  return entry !== null
}

function isOkxFlexibleProduct(product: OkxSimpleEarnProduct): boolean {
  return normalizeOkxProductKind(product) === 'flexible'
}

function isOkxFixedProduct(product: OkxSimpleEarnProduct): boolean {
  return normalizeOkxProductKind(product) === 'fixed'
}

function normalizeOkxProductKind(
  product: OkxSimpleEarnProduct
): 'flexible' | 'fixed' {
  const productType = normalizeOkxAmount(product.productsType)
  const type = normalizeOkxAmount(product.type)
  const termDays = normalizeOkxTermDays(product)

  if (productType === 66 || (type !== null && type > 1)) {
    return 'fixed'
  }

  if (termDays !== null && termDays > 1) {
    return 'fixed'
  }

  return 'flexible'
}

function isOkxPromoProduct(product: OkxSimpleEarnProduct): boolean {
  return Boolean(product.bonusDescription?.trim())
}

function normalizeOkxOfferStatus(
  value: number | string | undefined
): EarnOfferStatus {
  const status = String(value ?? '').trim()

  if (status === '1') {
    return 'available'
  }

  if (status === '2') {
    return 'sold_out'
  }

  if (status === '3') {
    return 'paused'
  }

  return 'unknown'
}

function normalizeOkxTermDays(
  product: OkxSimpleEarnProduct
): number | null {
  if (product.term?.type && product.term.type.toUpperCase() !== 'DAY') {
    return null
  }

  const days = normalizeOkxAmount(product.term?.value)

  return days && days > 0 ? days : null
}

function findOkxCompensationConfig(
  configs: OkxSimpleEarnCompensationConfig[],
  asset: StableAsset,
  currencyId: string
): OkxSimpleEarnCompensationConfig | null {
  return (
    configs.find(config => {
      return (
        String(config.currencyId ?? '') === currencyId ||
        config.currencySymbol?.toUpperCase() === asset
      )
    }) ?? null
  )
}

function createOkxEstimatedRateInput(
  estimatedRate: OkxSimpleEarnEstimatedRate | null
): CreateEarnOfferTierInput['rate'] | null {
  return (
    createOkxRateInputFromRateNumber(estimatedRate?.estimatedRateNum) ??
    createOkxDecimalRateInput(estimatedRate?.estimatedRate)
  )
}

function createOkxRateInput(
  rate: OkxRate | undefined
): CreateEarnOfferTierInput['rate'] | null {
  return createOkxRateInputFromRateNumber(rate?.rateNum)
}

function createOkxRateInputFromRateNumber(
  rateNumber: OkxRateNumber | undefined
): CreateEarnOfferTierInput['rate'] | null {
  const value = normalizeOkxRateValue(rateNumber?.value)

  if (value === null) {
    return null
  }

  return {
    value,
    kind: 'apr',
    valueFormat: String(rateNumber?.type) === '2' ? 'decimal' : 'percent',
  }
}

function createOkxDecimalRateInput(
  value: number | string | undefined
): CreateEarnOfferTierInput['rate'] | null {
  if (!Number.isFinite(Number(value))) {
    return null
  }

  return {
    value: value as number | string,
    kind: 'apr',
    valueFormat: 'decimal',
  }
}

function createOkxPercentRateInput(
  value: string | undefined
): CreateEarnOfferTierInput['rate'] | null {
  const normalizedValue = value?.replace('%', '').trim()

  if (!normalizedValue || !Number.isFinite(Number(normalizedValue))) {
    return null
  }

  return {
    value: normalizedValue,
    kind: 'apr',
    valueFormat: 'percent',
  }
}

function normalizeOkxRateValue(
  value: OkxRateNumber['value'] | undefined
): number | string | null {
  const firstValue = Array.isArray(value) ? value[0] : value

  if (firstValue === undefined) {
    return null
  }

  if (!Number.isFinite(Number(firstValue))) {
    return null
  }

  return firstValue
}

function normalizeOkxAmount(
  value: number | string | undefined
): number | null {
  const amount = Number(value)

  return Number.isFinite(amount) ? amount : null
}

function createOkxLendingSourceUrl(asset: StableAsset): string {
  const url = new URL(OKX_LENDING_RATE_SUMMARY_URL)

  url.searchParams.set('ccy', asset)

  return url.toString()
}

function normalizeFetchedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown OKX Earn error'
}
