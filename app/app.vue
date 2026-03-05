<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const i18nHead = useLocaleHead({ seo: true })
const { t } = useI18n()

const siteName = computed(() => t('Roman Korenchuk'))
const siteRole = computed(() => t('Frontend Developer'))

useHead(() => ({
  titleTemplate: titleChunk =>
    titleChunk
      ? `${titleChunk} | ${siteName.value}`
      : `${siteName.value} | ${siteRole.value}`,
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
}))
</script>
