<template>
  <label class="checkbox-label">
    <input
      v-model="model"
      class="checkbox-input"
      type="checkbox"
      v-bind="$attrs"
    />
    <span v-if="label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  label?: string
}>()

const model = defineModel<boolean | Array<string | number>>()
</script>

<style scoped>
@reference "~/assets/css/main.css";

.checkbox-label {
  @apply flex items-center gap-2;
}

.checkbox-input {
  @apply h-4 w-4;
  @apply rounded border-slate-300;
}
</style>
