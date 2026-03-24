<template>
  <select v-model="model" class="ui-select" v-bind="$attrs">
    <slot />
  </select>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string | number>()
</script>

<style scoped>
@reference "~/assets/css/main.css";

.ui-select {
  @apply w-full p-3;
  @apply rounded-xl border border-slate-300 bg-white;
  @apply focus:border-slate-500 focus:outline-none;
}
</style>
