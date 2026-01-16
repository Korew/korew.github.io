<template>
  <header class="header">
    <div class="header__title">
      <div class="header__name">{{ t('Roman Korenchuk') }}</div>
      <div class="header__role">{{ t('Frontend Developer') }}</div>
    </div>
    <nav class="nav">
      <NuxtLinkLocale to="/">{{ t('nav.home') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/contact">{{ t('nav.contact') }}</NuxtLinkLocale>
    </nav>
    <div class="language-switcher">
      <button
        v-for="loc in locales"
        :key="loc.code"
        :class="{ active: locale === loc.code }"
        @click="setLocale(loc.code)"
      >
        {{ loc.name }}
      </button>
    </div>
  </header>
</template>

<script setup>
const { t, locale, locales, setLocale } = useI18n()
</script>

<style scoped>
@reference "tailwindcss";

.header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between;
  @apply p-4;
}

.nav {
  @apply flex gap-2;
  @apply mt-4 md:mt-0;
}

.language-switcher {
  @apply flex gap-2;

  button {
    @apply cursor-pointer;

    &.active {
      @apply font-bold;
    }
  }
}
</style>
