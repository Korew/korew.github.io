// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')
const siteUrl = env.NUXT_PUBLIC_SITE_URL
const enableA11y = env.NUXT_A11Y === 'true'
const enableHints = env.NUXT_HINTS === 'true'
const stableEarnCacheTtlSeconds = Number(
  env.NUXT_STABLE_EARN_CACHE_TTL_SECONDS ?? 900
)

type DevAnalysisModule = string | [string, { enabled: boolean }]

const enabledDevAnalysisModules: DevAnalysisModule[] = []

if (enableA11y) {
  enabledDevAnalysisModules.push(['@nuxt/a11y', { enabled: true }])
}

if (enableHints) {
  enabledDevAnalysisModules.push('@nuxt/hints')
}

type NuxtPageNode = {
  file?: string
  children?: NuxtPageNode[]
}

const stripInternalPages = (pages: NuxtPageNode[]) => {
  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index]!
    const segments = page.file?.split('/') ?? []

    if (segments.some(segment => segment.startsWith('_'))) {
      pages.splice(index, 1)
      continue
    }

    if (page.children) {
      stripInternalPages(page.children)
    }
  }
}

if (!siteUrl) {
  throw new Error('NUXT_PUBLIC_SITE_URL is required')
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    ...enabledDevAnalysisModules,
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/i18n',
  ],
  devtools: { enabled: false },

  css: ['./app/assets/css/main.css'],

  runtimeConfig: {
    stableEarn: {
      cacheTtlSeconds: Number.isFinite(stableEarnCacheTtlSeconds)
        ? stableEarnCacheTtlSeconds
        : 900,
    },
    public: {
      siteUrl,
    },
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
  hooks: {
    'pages:extend'(pages) {
      stripInternalPages(pages)
    },
  },

  eslint: {
    config: {
      stylistic: {
        semi: false,
        quoteProps: 'consistent',
      },
    },
  },

  i18n: {
    defaultLocale: 'en',
    baseUrl: siteUrl,
    trailingSlash: true,
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
      { code: 'uk', name: 'Українська', language: 'uk-UA', file: 'uk.json' },
    ],
    strategy: 'prefix_except_default',
  },

  icon: {
    fallbackToApi: false,
    clientBundle: {
      icons: [
        'lucide:arrow-right',
        'lucide:copy',
        'lucide:eraser',
        'lucide:file-plus',
        'lucide:languages',
        'lucide:plus',
        'lucide:printer',
        'lucide:trash-2',
        'simple-icons:github',
        'simple-icons:instagram',
        'simple-icons:telegram',
      ],
    },
  },
})
