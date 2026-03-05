// @ts-nocheck
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'no-console': 'error',
      'max-len': ['error', { code: 100, tabWidth: 2 }],
      'comma-dangle': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/arrow-parens': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-v-html': 'off',
      'no-empty': 'off',
      '@nuxt/nuxt/prefer-import-meta': 'off',
    },
  },
  {
    ignores: ['**/*.js'],
  }
)
