<script setup lang="ts">
definePageMeta({
  layout: 'empty',
})

const DEFAULTS = {
  pageColor: '#f5f7f8',
  bottomColor: '#33424f',
  themeMode: 'off',
  themeColor: '#f5f7f8',
  headerOneColor: '#245f73',
  headerTwoColor: '#87522f',
  headerThreeColor: '#4f7234',
  headerFourColor: '#7a3f68',
  headerFiveColor: '#28384f',
} as const

type SettingKey = keyof typeof DEFAULTS
type HeaderColorKey =
  | 'headerOneColor'
  | 'headerTwoColor'
  | 'headerThreeColor'
  | 'headerFourColor'
  | 'headerFiveColor'

type StickyHeader = {
  label: string
  colorKey: HeaderColorKey
}

const route = useRoute()
const router = useRouter()

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/
const BOTTOM_BAR_FALLBACK_HEIGHT = 168
const isClient = import.meta.client
const themeModeOptions = ['off', 'manual']

const stickyHeaders: StickyHeader[] = [
  { label: 'Header 1', colorKey: 'headerOneColor' },
  { label: 'Header 2', colorKey: 'headerTwoColor' },
  { label: 'Header 3', colorKey: 'headerThreeColor' },
  { label: 'Header 4', colorKey: 'headerFourColor' },
  { label: 'Header 5', colorKey: 'headerFiveColor' },
]

const readQuerySetting = (key: SettingKey) => {
  const value = route.query[key]
  const queryValue = Array.isArray(value) ? value[0] : value

  return typeof queryValue === 'string' ? queryValue : DEFAULTS[key]
}

const settings = reactive(
  Object.fromEntries(
    (Object.keys(DEFAULTS) as SettingKey[]).map(key => [key, readQuerySetting(key)]),
  ) as Record<SettingKey, string>,
)

const bottomBarRef = ref<HTMLElement | null>(null)
const bottomBarHeight = ref(BOTTOM_BAR_FALLBACK_HEIGHT)
const copyState = ref('')

let copyTimer: ReturnType<typeof setTimeout> | undefined

const safeColor = (value: string, fallback: string) => {
  return HEX_COLOR_PATTERN.test(value) ? value : fallback
}

const contrastText = (color: string) => {
  const hex = safeColor(color, '#000000').slice(1)
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255

  return luminance > 0.62 ? '#101820' : '#ffffff'
}

const randomHex = () => {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`
}

const activeThemeMode = computed(() => {
  return themeModeOptions.includes(settings.themeMode)
    ? settings.themeMode
    : DEFAULTS.themeMode
})

const activeThemeColor = computed(() => {
  return safeColor(settings.themeColor, DEFAULTS.themeColor)
})

const encodedStateQuery = computed(() => {
  const query: Record<string, string> = {}

  for (const key of Object.keys(DEFAULTS) as SettingKey[]) {
    if (settings[key] !== DEFAULTS[key]) {
      query[key] = settings[key]
    }
  }

  return query
})

const queryString = computed(() => {
  return new URLSearchParams(encodedStateQuery.value).toString()
})

const currentPathWithQuery = computed(() => {
  return `${route.path}${queryString.value ? `?${queryString.value}` : ''}`
})

const directUrl = computed(() => {
  if (!isClient) return currentPathWithQuery.value

  return `${window.location.origin}${currentPathWithQuery.value}`
})

const pageStyle = computed<Record<string, string>>(() => {
  const bottom = safeColor(settings.bottomColor, DEFAULTS.bottomColor)
  const page = safeColor(settings.pageColor, DEFAULTS.pageColor)

  return {
    '--probe-bottom': bottom,
    '--probe-bottom-text': contrastText(bottom),
    '--probe-page': page,
    '--probe-page-text': contrastText(page),
    '--probe-bottom-height': `${bottomBarHeight.value}px`,
  }
})

const rootCss = computed(() => {
  const page = safeColor(settings.pageColor, DEFAULTS.pageColor)
  const text = contrastText(page)

  return `
html,
body,
#__nuxt {
  min-height: 100%;
  background: ${page};
  color: ${text};
  color-scheme: light dark;
}

body {
  margin: 0;
  overscroll-behavior-y: auto;
}
`
})

useHead(() => {
  const meta = [
    {
      key: 'viewport',
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
    {
      key: 'color-scheme',
      name: 'color-scheme',
      content: 'light dark',
    },
  ]

  if (activeThemeMode.value === 'manual') {
    meta.push({
      key: 'theme-color',
      name: 'theme-color',
      content: activeThemeColor.value,
    })
  }

  return {
    title: 'Browser Edge Color Probe',
    htmlAttrs: {
      style: [
        `background:${safeColor(settings.pageColor, DEFAULTS.pageColor)}`,
        'color-scheme:light dark',
      ].join(';'),
    },
    bodyAttrs: {
      class: 'edge-color-probe-body',
    },
    meta,
    style: [
      {
        key: 'edge-color-probe-root',
        innerHTML: rootCss.value,
      },
    ],
  }
})

const measureBars = () => {
  if (!isClient) return

  bottomBarHeight.value = Math.ceil(
    bottomBarRef.value?.offsetHeight ?? BOTTOM_BAR_FALLBACK_HEIGHT,
  )
}

const randomizeColors = () => {
  settings.headerOneColor = randomHex()
  settings.headerTwoColor = randomHex()
  settings.headerThreeColor = randomHex()
  settings.headerFourColor = randomHex()
  settings.headerFiveColor = randomHex()
  settings.bottomColor = randomHex()
  settings.pageColor = randomHex()
  settings.themeColor = randomHex()
  settings.themeMode = 'off'

  void nextTick(measureBars)
}

const copyDirectUrl = async () => {
  if (!isClient) return

  try {
    await window.navigator.clipboard.writeText(directUrl.value)
    copyState.value = 'URL copied'
  } catch {
    copyState.value = 'Copy failed'
  }

  if (copyTimer) clearTimeout(copyTimer)

  copyTimer = setTimeout(() => {
    copyState.value = ''
  }, 1600)
}

const resetColors = () => {
  Object.assign(settings, DEFAULTS)

  void nextTick(measureBars)
}

watch(
  encodedStateQuery,
  (query) => {
    if (!isClient) return

    void router.replace({
      path: route.path,
      query,
    })
  },
  { deep: true },
)

watch(
  settings,
  () => {
    void nextTick(measureBars)
  },
  { deep: true },
)

onMounted(() => {
  measureBars()
  window.addEventListener('resize', measureBars)
  window.addEventListener('orientationchange', measureBars)
})

onBeforeUnmount(() => {
  if (!isClient) return

  window.removeEventListener('resize', measureBars)
  window.removeEventListener('orientationchange', measureBars)

  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <main
    class="edge-probe"
    :style="pageStyle"
  >
    <section
      class="sticky-stack"
      aria-label="Sticky header color test"
    >
      <article
        v-for="(section, sectionIndex) in stickyHeaders"
        :key="section.colorKey"
        class="sticky-panel"
      >
        <header
          class="test-header"
          :style="{
            background: safeColor(settings[section.colorKey], DEFAULTS[section.colorKey]),
            color: contrastText(settings[section.colorKey]),
          }"
        >
          <div class="test-header__copy">
            <p>Browser Edge Probe</p>
            <h1>{{ section.label }}</h1>
          </div>

          <label class="color-field color-field--header">
            <span>Color</span>
            <input
              v-model="settings[section.colorKey]"
              type="color"
            >
            <code>{{ settings[section.colorKey] }}</code>
          </label>
        </header>

        <div class="scroll-rows">
          <span
            v-for="rowIndex in 8"
            :key="rowIndex"
          >
            section {{ sectionIndex + 1 }} / row {{ rowIndex }}
          </span>
        </div>
      </article>
    </section>

    <nav
      ref="bottomBarRef"
      class="bottom-edge"
      aria-label="Bottom color controls"
    >
      <label class="color-field">
        <span>Bottom</span>
        <input
          v-model="settings.bottomColor"
          type="color"
        >
        <code>{{ settings.bottomColor }}</code>
      </label>

      <label class="color-field">
        <span>Page</span>
        <input
          v-model="settings.pageColor"
          type="color"
        >
        <code>{{ settings.pageColor }}</code>
      </label>

      <label class="color-field">
        <span>Meta</span>
        <select v-model="settings.themeMode">
          <option
            v-for="mode in themeModeOptions"
            :key="mode"
            :value="mode"
          >
            {{ mode === 'off' ? 'Off' : 'Manual' }}
          </option>
        </select>
        <code>{{ activeThemeMode }}</code>
      </label>

      <label class="color-field">
        <span>Meta color</span>
        <input
          v-model="settings.themeColor"
          type="color"
          :disabled="activeThemeMode === 'off'"
        >
        <code>{{ activeThemeColor }}</code>
      </label>

      <div class="button-row">
        <button
          type="button"
          @click="randomizeColors"
        >
          Random
        </button>
        <button
          type="button"
          @click="resetColors"
        >
          Reset
        </button>
        <button
          type="button"
          @click="copyDirectUrl"
        >
          Copy URL
        </button>
      </div>
    </nav>

    <div
      v-if="copyState"
      class="copy-toast"
      role="status"
    >
      {{ copyState }}
    </div>
  </main>
</template>

<style scoped>
.edge-probe {
  box-sizing: border-box;
  min-height: 500dvh;
  background: var(--probe-page);
  color: var(--probe-page-text);
  padding:
    0
    max(16px, env(safe-area-inset-right))
    calc(var(--probe-bottom-height, 168px) + 18px)
    max(16px, env(safe-area-inset-left));
  -webkit-tap-highlight-color: color-mix(in srgb, var(--probe-bottom) 28%, transparent);
}

.edge-probe,
.edge-probe * {
  box-sizing: border-box;
}

.sticky-stack {
  max-width: 760px;
  margin: 0 auto;
}

.sticky-panel {
  display: grid;
  gap: 10px;
  align-content: start;
  min-height: calc(100dvh + 180px);
}

.test-header {
  position: sticky;
  z-index: 24;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100vw;
  min-height: 116px;
  margin-right: calc(50% - 50vw);
  margin-left: calc(50% - 50vw);
  border-bottom: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  padding:
    max(12px, env(safe-area-inset-top))
    max(12px, env(safe-area-inset-right))
    14px
    max(12px, env(safe-area-inset-left));
  box-shadow: 0 10px 28px color-mix(in srgb, #000 18%, transparent);
}

.test-header__copy {
  min-width: 0;
}

.test-header p,
.test-header h1 {
  margin: 0;
}

.test-header p,
.color-field span {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.test-header h1 {
  font-size: 2.6rem;
  line-height: 0.95;
}

.scroll-rows {
  display: grid;
  gap: 10px;
  padding: 10px 0 26px;
}

.scroll-rows span {
  display: block;
  border: 1px solid color-mix(in srgb, var(--probe-page-text) 18%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--probe-page) 78%, transparent);
  padding: 18px;
  font-weight: 800;
}

.bottom-edge {
  position: fixed;
  z-index: 32;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  align-items: end;
  border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  background: var(--probe-bottom);
  color: var(--probe-bottom-text);
  padding:
    12px
    max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
  box-shadow: 0 -12px 32px color-mix(in srgb, #000 22%, transparent);
}

.color-field {
  display: grid;
  grid-template-columns: auto 34px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.color-field--header {
  width: min(240px, 48vw);
}

input[type="color"] {
  width: 34px;
  height: 34px;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: 8px;
  background: transparent;
  padding: 2px;
}

input[type="color"]:disabled {
  opacity: 0.45;
}

select {
  min-width: 0;
  min-height: 34px;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: inherit;
  font: inherit;
  font-weight: 800;
  padding: 0 8px;
}

code {
  overflow: hidden;
  min-width: 0;
  border-radius: 6px;
  background: color-mix(in srgb, currentColor 11%, transparent);
  color: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 6px 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: 8px;
  justify-content: flex-end;
}

button {
  min-height: 38px;
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: inherit;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 0 12px;
  cursor: pointer;
}

.copy-toast {
  position: fixed;
  z-index: 40;
  right: max(16px, env(safe-area-inset-right));
  bottom: calc(var(--probe-bottom-height, 168px) + 18px);
  border-radius: 8px;
  background: #101820;
  color: #ffffff;
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 850;
  box-shadow: 0 14px 34px color-mix(in srgb, #000 25%, transparent);
}

@media (max-width: 820px) {
  .test-header {
    align-items: flex-start;
    flex-direction: column;
    min-height: 136px;
  }

  .test-header h1 {
    font-size: 2rem;
  }

  .color-field--header {
    width: 100%;
  }

  .bottom-edge {
    align-items: stretch;
  }

  .button-row {
    justify-content: stretch;
  }

  .button-row button {
    flex: 1 1 86px;
  }
}
</style>
