<template>
  <div class="page">
    <AppHeader />

    <main class="main">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.page {
  @apply flex flex-col;
  @apply min-h-dvh;
}

.main {
  @apply container mx-auto px-4;
  @apply flex-grow;
}
</style>
