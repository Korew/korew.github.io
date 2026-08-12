<template>
  <span class="sr-only">Redirecting to Stable Earn Planner...</span>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

await navigateTo(localePath('/tools/stable-earn'), {
  redirectCode: 301,
})
</script>
