<template>
  <div>
    <h1>{{ t('pages.tools.inner.title', { slug: route.params.slug }) }}</h1>
    <p>{{ t('pages.tools.inner.description') }}</p>
  </div>
</template>

<script setup>
const route = useRoute()
const { t } = useI18n()
</script>
