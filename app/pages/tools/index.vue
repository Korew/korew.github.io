<template>
  <section class="tools-page">
    <header>
      <h1>{{ t('pages.tools.title') }}</h1>
      <p>{{ t('pages.tools.description') }}</p>
    </header>

    <ul class="tools-list">
      <li>
        <NuxtLinkLocale class="tool-link" to="/tools/invoice-generator">
          <span class="tool-link__title">
            {{ t('pages.tools.items.invoiceGenerator.title') }}
          </span>
          <span class="tool-link__description">
            {{ t('pages.tools.items.invoiceGenerator.description') }}
          </span>
          <span class="tool-link__action">
            {{ t('pages.tools.items.invoiceGenerator.linkLabel') }}
          </span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

useLocalizedSeo({
  titleKey: 'pages.tools.title',
  descriptionKey: 'pages.tools.description',
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.tools-page {
  @apply max-w-7xl mx-auto px-4;

  padding-top: 32px;
  padding-bottom: 48px;
}

.tools-page h1 {
  margin: 0;
  color: #13261e;
  font-size: 36px;
  line-height: 1.12;
}

.tools-page p {
  margin: 12px 0 0;
  color: #405466;
  font-size: 17px;
  line-height: 1.55;
}

.tools-list {
  display: grid;
  gap: 14px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.tool-link {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #d8e0e7;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}

.tool-link:focus-visible,
.tool-link:hover {
  border-color: var(--primary);
  outline: 3px solid rgb(66 184 131 / 24%);
  outline-offset: 2px;
}

.tool-link__title {
  color: #182635;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
}

.tool-link__description {
  color: #405466;
  line-height: 1.5;
}

.tool-link__action {
  color: #1f7a55;
  font-weight: 700;
}
</style>
