<template>
  <div>
    <h1>{{ t('pages.experience.title') }}</h1>
    <p>{{ t('pages.experience.description') }}</p>
  </div>
</template>

<script setup>
const { t } = useI18n()

useLocalizedSeo({
  titleKey: 'pages.experience.title',
  descriptionKey: 'pages.experience.description',
})
</script>
