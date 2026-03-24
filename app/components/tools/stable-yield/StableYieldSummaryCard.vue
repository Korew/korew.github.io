<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-sm text-slate-500">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold text-slate-900">{{ value }}</p>
  </article>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string
}

defineProps<Props>()
</script>
