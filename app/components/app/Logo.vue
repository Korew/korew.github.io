<template>
  <div class="logo" :aria-label="fullName">
    <template v-for="(word, index) in words" :key="word">
      <span class="text-primary">{{ word.charAt(0) }}</span>
      <span class="text-secondary">{{
        `${word.slice(1)}${index < words.length - 1 ? ' ' : ''}`
      }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const fullName = computed(() => t('Roman Korenchuk'))
const words = computed(() => fullName.value.trim().split(/\s+/).filter(Boolean))
</script>

<style scoped>
@reference "tailwindcss";

.logo {
  @apply text-3xl md:text-4xl lg:text-5xl;
  @apply font-bold;
  @apply whitespace-nowrap;
}
</style>
