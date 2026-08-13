// @ts-nocheck
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'no-console': 'error',
      'max-len': [
        'error',
        {
          code: 100,
          tabWidth: 2,
          ignorePattern: '\\bclass="[^"]*"',
        },
      ],
      'comma-dangle': 'off',
      '@stylistic/comma-dangle': 'off',
      'vue/comma-dangle': 'off',
      '@stylistic/quotes': [
        'error',
        'single',
        { allowTemplateLiterals: 'always', avoidEscape: true },
      ],
      '@stylistic/arrow-parens': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/indent': 'off',
      'quote-props': 'off',
      '@stylistic/quote-props': 'off',
      'operator-linebreak': 'off',
      '@stylistic/operator-linebreak': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any',
          },
        },
      ],
      'vue/no-v-html': 'off',
      'no-empty': 'off',
      '@nuxt/nuxt/prefer-import-meta': 'off',
    },
  },
  {
    ignores: ['**/*.js'],
  }
)
