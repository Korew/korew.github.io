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
.page {
  @apply flex flex-col;
  @apply min-h-dvh;
}

.main {
  @apply flex-grow;
}
</style>
