// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')
const siteUrl = env.NUXT_PUBLIC_SITE_URL

if (!siteUrl) {
  throw new Error('NUXT_PUBLIC_SITE_URL is required')
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
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
        'lucide:languages',
        'simple-icons:github',
        'simple-icons:instagram',
        'simple-icons:telegram',
      ],
    },
  },
})
