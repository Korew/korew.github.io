<script setup lang="ts">
defineProps<{
  threshold: number
  isDragging?: boolean
}>()

const iconPath = [
  'M17.544.323a.55.55 0 0 0-.49-.149L14.66.653a1.64 1.64 0 0 0-.832.445',
  'L2.968 12.196l2.937 2.584L16.77 4.044c.228-.228.384-.516.445-.832',
  'l.479-2.4a.55.55 0 0 0-.15-.489M2.102 10.653l-.544.543a.54.54 0 0 0-.112.605',
  'l.934 2.107-1.909 1.909a.546.546 0 0 0 0 .768l.816.815c.21.211.557.211.767 0',
  'l1.91-1.91 2.105.935a.54.54 0 0 0 .605-.112l.543-.543a.546.546 0 0 0 0-.768',
  'l-4.348-4.35a.545.545 0 0 0-.767 0m12.34.703L12.72 9.633l-2.942 2.943',
  '1.723 1.722-.703.704a.546.546 0 0 0 0 .768l.543.543c.16.16.4.204.605.112',
  'l2.106-.934 1.909 1.91c.21.21.557.21.767 0l.816-.816a.546.546 0 0 0 0-.768',
  'l-1.91-1.91.935-2.106a.54.54 0 0 0-.112-.605l-.544-.543a.545.545 0 0 0-.768 0z',
  'M1.246 4.044l4.049 4.05 2.941-2.942-4.045-4.054a1.6 1.6 0 0 0-.832-.445',
  'L.96.174a.55.55 0 0 0-.492.15.55.55 0 0 0-.15.492l.483 2.392c.064.316.217.605.445.833z',
].join('')
</script>

<template>
  <div class="threshold-marker" :style="{ left: `${threshold}%` }">
    <div
      class="threshold-value"
      :class="{ 'threshold-value--dragging': isDragging }"
    >
      {{ threshold.toFixed(2) }}
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 18 18"
    >
      <g clip-path="url(#icon-duel-swords_svg__a)">
        <path :d="iconPath" />
      </g>
      <defs>
        <clipPath id="icon-duel-swords_svg__a">
          <path d="M.309.164h17.394v17.394H.309z" />
        </clipPath>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.threshold-marker {
  @apply absolute top-1/2 -translate-x-1/2 -translate-y-1/2;
  @apply flex items-center justify-center;
  @apply w-14 h-14;
  @apply rounded-full text-sm font-semibold text-slate-900;
  @apply bg-white;

  svg {
    @apply w-8 h-8;
  }
}

.threshold-value {
  @apply opacity-0;
  @apply absolute bottom-[calc(100%+.875rem)] left-1/2;
  @apply -translate-x-1/2;
  @apply w-16 px-3 py-2;
  @apply rounded-md bg-white text-center;
  @apply text-sm font-semibold text-slate-900;
  @apply transition-opacity duration-200;

  &::after {
    content: '';
    @apply absolute -bottom-[5px];
    @apply left-1/2 -translate-x-1/2;
    @apply w-2.5 h-2.5;
    @apply bg-inherit rotate-45;
  }
}

.threshold-value--dragging {
  @apply opacity-100;
}

.threshold-marker:hover .threshold-value {
  @apply opacity-100;
}
</style>
