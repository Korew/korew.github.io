<template>
  <div>
    <h1>{{ t('pages.education.title') }}</h1>
    <p>{{ t('pages.education.description') }}</p>
  </div>
</template>

<script setup>
const { t } = useI18n()

useLocalizedSeo({
  titleKey: 'pages.education.title',
  descriptionKey: 'pages.education.description',
})
</script>
