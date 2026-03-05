import type { Ref } from 'vue'

type TranslationParams = Record<string, unknown>
type TranslationParamsRef = TranslationParams | Ref<TranslationParams>

interface UseLocalizedSeoOptions {
  titleKey: string
  descriptionKey: string
  titleParams?: TranslationParamsRef
  descriptionParams?: TranslationParamsRef
}

export function useLocalizedSeo(options: UseLocalizedSeoOptions) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()

  const siteName = computed(() => t('Roman Korenchuk'))
  const titleParams = computed(() => unref(options.titleParams) ?? {})
  const descriptionParams = computed(
    () => unref(options.descriptionParams) ?? {}
  )

  const title = computed(() => t(options.titleKey, titleParams.value))
  const description = computed(() =>
    t(options.descriptionKey, descriptionParams.value)
  )

  const canonicalUrl = computed(() => {
    const path = route.fullPath.split('#')[0]
    const siteUrl = runtimeConfig.public.siteUrl?.replace(/\/$/, '')

    return siteUrl ? `${siteUrl}${path}` : path
  })

  useHead(() => ({
    title: title.value,
  }))

  useSeoMeta({
    description,
    robots: 'index, follow',
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: siteName,
    ogLocale: computed(() => (locale.value === 'uk' ? 'uk_UA' : 'en_US')),
    ogUrl: canonicalUrl,
    twitterCard: 'summary',
    twitterTitle: title,
    twitterDescription: description,
  })
}
