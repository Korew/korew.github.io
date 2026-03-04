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
        <Icon :name="link.icon" class="size-5" />
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { socialLinks } from '../../data/social-links'
</script>

<style scoped>
@reference "tailwindcss";

.links {
  @apply flex items-center gap-3;
}

.link {
  @apply inline-flex p-1;
  @apply rounded-md transition-opacity;
  @apply opacity-80 hover:opacity-100;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current;
}
</style>
