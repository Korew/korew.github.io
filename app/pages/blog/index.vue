<template>
  <div>
    <h1>{{ t('pages.blog.title') }}</h1>
    <p>{{ t('pages.blog.description') }}</p>
  </div>
</template>

<script setup>
const { t } = useI18n()
</script>
