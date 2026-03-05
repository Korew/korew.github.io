<template>
  <div>
    <h1>{{ t('pages.skills.title') }}</h1>
    <p>{{ t('pages.skills.description') }}</p>
  </div>
</template>

<script setup>
const { t } = useI18n()

useLocalizedSeo({
  titleKey: 'pages.skills.title',
  descriptionKey: 'pages.skills.description',
})
</script>
