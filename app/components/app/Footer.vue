<template>
  <footer class="footer">
    <p>{{ t('footer.copyright', { year }) }}</p>
    <SocialLinks />
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<style scoped>
@reference "tailwindcss";

.footer {
  @apply p-4;
  @apply flex items-center justify-between gap-4;
}
</style>
