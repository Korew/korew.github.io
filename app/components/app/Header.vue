<template>
  <header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="header__inner">
      <NuxtLinkLocale to="/">
        <AppLogo />
      </NuxtLinkLocale>
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
        @click="toggleMenu"
      >
        <span class="menu-toggle__line" />
        <span class="menu-toggle__line" />
        <span class="menu-toggle__line" />
      </button>
      <div class="menu" :class="isMenuOpen ? 'menu--open' : 'menu--closed'">
        <button
          v-if="isMenuOpen"
          class="menu-close"
          type="button"
          aria-label="Close menu"
          @click="closeMenu"
        >
          ✕
        </button>
        <nav class="nav">
          <NuxtLinkLocale
            to="/skills"
            :class="{ active: isActive('/skills') }"
            @click="closeMenu"
          >
            {{ t('nav.skills') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/experience"
            :class="{ active: isActive('/experience') }"
            @click="closeMenu"
          >
            {{ t('nav.experience') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/education"
            :class="{ active: isActive('/education') }"
            @click="closeMenu"
          >
            {{ t('nav.education') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/tools"
            :class="{ active: isActive('/tools') }"
            @click="closeMenu"
          >
            {{ t('nav.tools') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/blog"
            :class="{ active: isActive('/blog') }"
            @click="closeMenu"
          >
            {{ t('nav.blog') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/contact"
            :class="{ active: isActive('/contact') }"
            @click="closeMenu"
          >
            {{ t('nav.contact') }}
          </NuxtLinkLocale>
        </nav>
        <div class="language-switcher">
          <span class="language-switcher__icon" aria-hidden="true">
            <Icon name="lucide:languages" class="size-4" />
          </span>
          <button
            v-for="loc in locales"
            :key="loc.code"
            :class="{ active: locale === loc.code }"
            @click="changeLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

const isScrolled = ref(false)
const isMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const closeMenu = () => {
  setTimeout(() => {
    isMenuOpen.value = false
  }, 0)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const changeLocale = (code: (typeof locales.value)[number]['code']) => {
  setLocale(code)
  closeMenu()
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

watch(
  () => route.path,
  () => {
    closeMenu()
  }
)

watch(isMenuOpen, value => {
  document.body.style.overflow = value ? 'hidden' : ''
})

const isActive = (path: string): boolean => {
  const target = localePath(path)

  return route.path === target || route.path.startsWith(`${target}/`)
}
</script>

<style scoped>
@reference "~/assets/css/main.css";

.header {
  @apply sticky top-0 z-50;
  @apply py-4 lg:py-8;
  @apply border-b border-secondary;
  @apply bg-white;
}

.header--scrolled {
  @apply border-transparent shadow-md;
}

.header__inner {
  @apply flex items-center gap-3;
  @apply px-4 max-w-7xl mx-auto;
}

.menu-toggle {
  @apply flex flex-col justify-center items-center gap-1.5;
  @apply ml-auto h-10 w-10;
  @apply text-secondary lg:hidden;
}

.menu-toggle__line {
  @apply block h-0.5 w-6 bg-current transition-transform duration-200;
}

.menu {
  @apply ml-auto items-center gap-2;
}

.menu--closed {
  @apply hidden lg:flex;
}

.menu--open {
  @apply fixed inset-0 z-40;
  @apply lg:static lg:z-auto;
  @apply flex flex-col justify-center gap-8 lg:gap-4;
  @apply lg:flex-row;
  @apply px-8 lg:px-0;
  @apply bg-white lg:bg-transparent;
}

.menu-close {
  @apply absolute right-4 top-4 flex h-10 w-10 items-center justify-center;
  @apply text-3xl leading-none text-secondary lg:hidden;
}

.nav {
  @apply flex;
}

.nav a {
  @apply px-2 py-1;
  @apply rounded hover:underline;
  @apply text-secondary font-semibold;
}

.nav a.active {
  @apply text-primary;
}

.language-switcher {
  @apply flex items-center gap-2;
}

.language-switcher__icon {
  @apply inline-flex text-secondary;
}

.language-switcher button {
  @apply cursor-pointer;
}

.language-switcher button.active {
  @apply font-bold;
  @apply text-primary;
}

.menu--open .nav {
  @apply mx-auto flex w-full max-w-sm flex-col items-center gap-4;
  @apply lg:mx-0 lg:w-auto lg:max-w-none lg:flex-row lg:gap-0;
}

.menu--open .nav a {
  @apply text-2xl;
  @apply lg:text-base;
}

.menu--open .language-switcher {
  @apply mx-auto flex items-center justify-center gap-4;
  @apply lg:mx-0 lg:justify-start lg:gap-2;
}

.menu--open .language-switcher button {
  @apply text-xl;
  @apply lg:text-base;
}
</style>
