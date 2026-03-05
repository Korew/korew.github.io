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
@reference "~/assets/css/main.css";

.footer {
  @apply flex flex-col md:flex-row;
  @apply items-center justify-between gap-4;
  @apply p-4;
  @apply text-secondary;
  @apply border-t border-secondary;
}
</style>
