<template>
  <div>
    <h1>{{ t('pages.tools.title') }}</h1>
    <p>{{ t('pages.tools.description') }}</p>
  </div>
</template>

<script setup>
const { t } = useI18n()

useLocalizedSeo({
  titleKey: 'pages.tools.title',
  descriptionKey: 'pages.tools.description',
})
</script>
