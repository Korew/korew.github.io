<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const i18nHead = useLocaleHead({ seo: true })
const { t } = useI18n()
const route = useRoute()

const siteName = computed(() => t('Roman Korenchuk'))
const siteRole = computed(() => t('Frontend Developer'))
const isHomeRoute = computed(() => {
  const normalizedPath = route.path.replace(/\/+$/, '') || '/'
  return normalizedPath === '/' || normalizedPath === '/uk'
})

const getTitleTemplate = (titleChunk?: string) => {
  if (!titleChunk) {
    return `${siteName.value} | ${siteRole.value}`
  }

  return isHomeRoute.value ? titleChunk : `${titleChunk} | ${siteName.value}`
}

useHead(() => ({
  titleTemplate: getTitleTemplate,
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: [
    ...(i18nHead.value.link ?? []),
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon-96x96.png',
      sizes: '96x96',
    },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'shortcut icon', href: '/favicon.ico' },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
  meta: [
    ...(i18nHead.value.meta ?? []),
    { name: 'apple-mobile-web-app-title', content: 'Roman Korenchuk' },
  ],
}))
</script>
