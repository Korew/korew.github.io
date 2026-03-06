<template>
  <div>
    <h1>{{ $t('pages.home.title') }}</h1>
    <p>{{ $t('pages.home.description') }}</p>
  </div>
</template>

<script setup>
useLocalizedSeo({
  titleKey: 'pages.home.title',
  descriptionKey: 'pages.home.description',
})
</script>
