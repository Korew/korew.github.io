<template>
  <div class="space-y-4">
    <h1>{{ t('pages.blog.title') }}</h1>
    <p>{{ t('pages.blog.description') }}</p>

    <ul class="space-y-6">
      <li v-for="post in posts" :key="post.path" class="space-y-2">
        <NuxtLink :to="localePath(post.path)">
          <h2>{{ post.title }}</h2>
        </NuxtLink>
        <p>{{ post.description }}</p>
        <p v-if="post.date">
          {{ formatDate(post.date) }}
        </p>
        <ul v-if="post.tags?.length" class="flex flex-wrap gap-2">
          <li
            v-for="tag in post.tags"
            :key="`${post.path}-${tag}`"
            class="text-sm opacity-80"
          >
            #{{ tag }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { queryCollection } from '#imports'

const { t } = useI18n()
const localePath = useLocalePath()
const { locale } = useI18n()

type BlogListItem = {
  path: string
  title?: string
  description?: string
  date?: string
  tags?: string[]
}

const currentCollection = computed<'content_en' | 'content_uk'>(() =>
  locale.value === 'uk' ? 'content_uk' : 'content_en'
)

const toBlogListItem = (item: Record<string, unknown>): BlogListItem => {
  const meta: Record<string, unknown> = {}
  if (typeof item.meta === 'object' && item.meta) {
    Object.assign(meta, item.meta as Record<string, unknown>)
  }

  let rawDate: string | undefined
  if (typeof item.date === 'string') {
    rawDate = item.date
  } else if (typeof meta.date === 'string') {
    rawDate = meta.date
  }

  let rawTags: unknown[] | undefined
  if (Array.isArray(item.tags)) {
    rawTags = item.tags
  } else if (Array.isArray(meta.tags)) {
    rawTags = meta.tags
  }

  return {
    path: String(item.path ?? ''),
    title: typeof item.title === 'string' ? item.title : undefined,
    description:
      typeof item.description === 'string' ? item.description : undefined,
    date: rawDate,
    tags: rawTags?.filter((tag): tag is string => typeof tag === 'string'),
  }
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

const { data: localizedPosts } = await useAsyncData(
  () => `blog-list-${locale.value}`,
  () =>
    queryCollection(currentCollection.value)
      .where('path', 'LIKE', '/blog/%')
      .all()
      .then(items =>
        items.map(item =>
          toBlogListItem(item as unknown as Record<string, unknown>)
        )
      ),
  { watch: [locale] }
)

const { data: englishPosts } = await useAsyncData('blog-list-en', () =>
  queryCollection('content_en')
    .where('path', 'LIKE', '/blog/%')
    .all()
    .then(items =>
      items.map(item =>
        toBlogListItem(item as unknown as Record<string, unknown>)
      )
    )
)

const posts = computed<BlogListItem[]>(() => {
  const localized = localizedPosts.value ?? []

  if (locale.value === 'en') {
    return [...localized].sort((a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '')
    )
  }

  const merged = new Map<string, BlogListItem>()

  for (const post of englishPosts.value ?? []) {
    merged.set(post.path, post)
  }

  for (const post of localized) {
    merged.set(post.path, post)
  }

  return [...merged.values()].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? '')
  )
})

useLocalizedSeo({
  titleKey: 'pages.blog.title',
  descriptionKey: 'pages.blog.description',
})
</script>
