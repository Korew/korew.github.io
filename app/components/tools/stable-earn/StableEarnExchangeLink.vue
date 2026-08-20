<template>
  <component
    :is="referralUrl ? 'a' : 'span'"
    class="inline-flex items-center gap-2 text-slate-900"
    :class="{ 'hover:text-slate-600': referralUrl }"
    v-bind="linkAttrs"
  >
    <span
      v-if="imageSrc"
      aria-hidden="true"
      class="
        inline-flex size-8 shrink-0 items-center justify-center overflow-hidden
        rounded-md bg-white p-1 ring-1 ring-slate-200
      "
    >
      <img
        alt=""
        class="size-full rounded-[3px] object-contain"
        loading="lazy"
        :src="imageSrc"
      >
    </span>
    <span
      v-else
      aria-hidden="true"
      class="
        inline-flex size-8 shrink-0 items-center justify-center rounded-md
        bg-slate-100 text-[11px] font-bold text-slate-700 ring-1
        ring-slate-200
      "
    >
      {{ fallbackIcon }}
    </span>
    <span>{{ exchangeName }}</span>
  </component>
</template>

<script setup lang="ts">
import type {
  ExchangeId,
  ExchangeItem,
} from '../../../features/tools/stable-earn/types'

interface Props {
  exchangeId: ExchangeId
  exchanges: ExchangeItem[]
}

const props = defineProps<Props>()

const exchange = computed(() => {
  return props.exchanges.find(item => item.id === props.exchangeId)
})
const exchangeName = computed(() => exchange.value?.name ?? props.exchangeId)
const referralUrl = computed(() => exchange.value?.referralUrl ?? '')
const imageSrc = computed(() => getImageSrc(exchange.value?.icon))
const fallbackIcon = computed(() => {
  const icon = exchange.value?.icon

  if (typeof icon === 'string' && !icon.startsWith('/')) {
    return icon
  }

  return exchangeName.value.slice(0, 2).toUpperCase()
})
const linkAttrs = computed(() => {
  if (!referralUrl.value) {
    return {}
  }

  return {
    href: referralUrl.value,
    rel: 'nofollow noopener noreferrer',
    target: '_blank',
  }
})

function getImageSrc(asset: ExchangeItem['icon'] | undefined): string {
  if (typeof asset === 'string' && asset.startsWith('/')) {
    return asset
  }

  if (typeof asset === 'object') {
    return getImageSrc(asset.light)
  }

  return ''
}
</script>
