<template>
  <header>
    <nav>
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
