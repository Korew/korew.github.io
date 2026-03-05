<template>
  <ul class="links" aria-label="Social links">
    <li v-for="link in socialLinks" :key="link.id">
      <a
        class="link"
        :href="link.href"
        :aria-label="link.label"
        :title="link.label"
        target="_blank"
        rel="noopener noreferrer me"
      >
        <Icon :name="link.icon" class="text-xl" />
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { socialLinks } from '../../data/social-links'
</script>

<style scoped>
@reference "~/assets/css/main.css";

.links {
  @apply flex items-center gap-3;
}

.link {
  @apply inline-flex p-1;
  @apply rounded-md transition-opacity;
  @apply text-secondary hover:text-primary;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current;
}
</style>
