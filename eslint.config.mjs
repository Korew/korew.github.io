// @ts-nocheck
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': 'error',
    'max-len': ['error', { 'code': 80, 'tabWidth': 2 }],
    'vue/no-multiple-template-root': 'off',
    'vue/no-v-html': 'off',
    'no-empty': 'off',
    '@nuxt/nuxt/prefer-import-meta': 'off',
  },
}, {
  ignores: ['**/*.js'],
})
