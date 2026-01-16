<template>
  <footer class="footer">
    {{ t('footer.copyright', { year }) }}
  </footer>
</template>

<script setup>
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<style scoped>
@reference "tailwindcss";
.footer {
  @apply p-4;
}
</style>
