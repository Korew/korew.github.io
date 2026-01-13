<template>
  <footer>
    <p>{{ $t('footer.copyright', { year }) }}</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
