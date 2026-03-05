<template>
  <div>
    <h1>{{ t('pages.blog.inner.title', { slug: route.params.slug }) }}</h1>
    <p>{{ t('pages.blog.inner.description') }}</p>
  </div>
</template>

<script setup>
const route = useRoute()
const { t } = useI18n()

const slug = computed(() => String(route.params.slug ?? ''))
const titleParams = computed(() => ({ slug: slug.value }))

useLocalizedSeo({
  titleKey: 'pages.blog.inner.title',
  descriptionKey: 'pages.blog.inner.description',
  titleParams,
})
</script>
