<template>
  <footer>
    <p>{{ t('footer.copyright', { year }) }}</p>
  </footer>
</template>

<script setup>
const { t } = useI18n()
const year = new Date().getFullYear()
</script>
