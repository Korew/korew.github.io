<template>
  <div v-if="page" class="space-y-4">
    <p v-if="isFallback" class="text-sm opacity-80">
      Not available in Ukrainian, showing English.
    </p>
    <ContentRenderer :value="page" class="blog-content" />
  </div>
</template>

<script setup lang="ts">
import { queryCollection } from '#imports'

type BlogPage = {
  path?: string
  title?: string
  description?: string
} & Record<string, unknown>

const route = useRoute()
const { locale } = useI18n()

const slugValue = computed(() => {
  const slugParam = route.params.slug
  if (Array.isArray(slugParam)) {
    return slugParam
      .map(part => String(part).trim())
      .filter(Boolean)
      .join('/')
  }

  return String(slugParam ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
})

const contentPath = computed(() => {
  const normalized = slugValue.value.replace(/^\/+/, '')
  return `/blog/${normalized}`
})

const currentCollection = computed<'content_en' | 'content_uk'>(() =>
  locale.value === 'uk' ? 'content_uk' : 'content_en'
)

const { data: localizedPage } = await useAsyncData(
  () => `blog-page-${locale.value}-${contentPath.value}`,
  () =>
    queryCollection(currentCollection.value)
      .path(contentPath.value)
      .first() as Promise<BlogPage | null>,
  { watch: [locale, contentPath] }
)

const { data: englishPage } = await useAsyncData(
  () => `blog-page-en-${contentPath.value}`,
  () =>
    queryCollection('content_en')
      .path(contentPath.value)
      .first() as Promise<BlogPage | null>,
  { watch: [contentPath] }
)

const isFallback = computed(
  () => locale.value !== 'en' && !localizedPage.value && !!englishPage.value
)

const page = computed<BlogPage | null>(() => {
  if (localizedPage.value) {
    return localizedPage.value
  }

  if (locale.value !== 'en') {
    return englishPage.value ?? null
  }

  return null
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})
</script>
