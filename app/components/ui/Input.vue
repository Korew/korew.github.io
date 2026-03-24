<template>
  <input
    v-if="type === 'number'"
    v-model.number="model"
    class="ui-input"
    :type="type"
    v-bind="$attrs"
  />
  <input v-else v-model="model" class="ui-input" :type="type" v-bind="$attrs" />
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const { type = 'text' } = defineProps<{
  type?: string
}>()

const model = defineModel<string | number>()
</script>

<style scoped>
@reference "~/assets/css/main.css";

.ui-input {
  @apply w-full p-3;
  @apply rounded-xl border border-slate-300 bg-white;
  @apply focus:border-slate-500 focus:outline-none;
}
</style>
