<script setup lang="ts">
definePageMeta({
  layout: 'empty',
})

const DEFAULTS = {
  topColor: '#245f73',
  bottomColor: '#6f3d8f',
  pageColor: '#f5f7f8',
  themeColor: '#245f73',
  metaFollowsTop: 'yes',
} as const

type SettingKey = keyof typeof DEFAULTS
type Preset = {
  label: string
  top: string
  bottom: string
  page: string
}

const route = useRoute()
const router = useRouter()

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/
const TOP_BAR_FALLBACK_HEIGHT = 176
const BOTTOM_BAR_FALLBACK_HEIGHT = 168
const isClient = import.meta.client

const presets: Preset[] = [
  { label: 'Dark', top: '#17202a', bottom: '#2d3642', page: '#f4f6f8' },
  { label: 'Light', top: '#e8eee9', bottom: '#c7d6cc', page: '#ffffff' },
  { label: 'Medium', top: '#2f6f73', bottom: '#82639a', page: '#f7f3ef' },
  { label: 'Warm', top: '#874f2a', bottom: '#c27845', page: '#fff6ed' },
  { label: 'Cool', top: '#1d4f7a', bottom: '#287271', page: '#eef7f8' },
  { label: 'High', top: '#050505', bottom: '#f2c14e', page: '#ffffff' },
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

const topBarRef = ref<HTMLElement | null>(null)
const bottomBarRef = ref<HTMLElement | null>(null)
const topBarHeight = ref(TOP_BAR_FALLBACK_HEIGHT)
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

const activeThemeColor = computed(() => {
  if (settings.metaFollowsTop === 'yes') {
    return safeColor(settings.topColor, DEFAULTS.topColor)
  }

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
  const top = safeColor(settings.topColor, DEFAULTS.topColor)
  const bottom = safeColor(settings.bottomColor, DEFAULTS.bottomColor)
  const page = safeColor(settings.pageColor, DEFAULTS.pageColor)

  return {
    '--probe-top': top,
    '--probe-top-text': contrastText(top),
    '--probe-bottom': bottom,
    '--probe-bottom-text': contrastText(bottom),
    '--probe-page': page,
    '--probe-page-text': contrastText(page),
    '--probe-theme': activeThemeColor.value,
    '--probe-top-height': `${topBarHeight.value}px`,
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

useHead(() => ({
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
  meta: [
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
    {
      key: 'theme-color',
      name: 'theme-color',
      content: activeThemeColor.value,
    },
  ],
  style: [
    {
      key: 'edge-color-probe-root',
      innerHTML: rootCss.value,
    },
  ],
}))

const measureBars = () => {
  if (!isClient) return

  topBarHeight.value = Math.ceil(
    topBarRef.value?.offsetHeight ?? TOP_BAR_FALLBACK_HEIGHT,
  )
  bottomBarHeight.value = Math.ceil(
    bottomBarRef.value?.offsetHeight ?? BOTTOM_BAR_FALLBACK_HEIGHT,
  )
}

const applyPreset = (preset: Preset) => {
  settings.topColor = preset.top
  settings.bottomColor = preset.bottom
  settings.pageColor = preset.page
  settings.themeColor = preset.top
  settings.metaFollowsTop = 'yes'

  void nextTick(measureBars)
}

const swapEdgeColors = () => {
  const top = settings.topColor

  settings.topColor = settings.bottomColor
  settings.bottomColor = top

  if (settings.metaFollowsTop === 'yes') {
    settings.themeColor = settings.topColor
  }

  void nextTick(measureBars)
}

const randomizeColors = () => {
  settings.topColor = randomHex()
  settings.bottomColor = randomHex()
  settings.pageColor = randomHex()
  settings.themeColor = settings.topColor
  settings.metaFollowsTop = 'yes'

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
    <header
      ref="topBarRef"
      class="top-edge"
    >
      <div class="top-edge__main">
        <div>
          <p>Browser Edge Probe</p>
          <h1>Fixed Header</h1>
        </div>

        <label class="color-field color-field--top">
          <span>Top</span>
          <input
            v-model="settings.topColor"
            type="color"
          >
          <code>{{ settings.topColor }}</code>
        </label>
      </div>

      <div class="preset-row">
        <button
          v-for="preset in presets"
          :key="preset.label"
          class="preset-button"
          type="button"
          @click="applyPreset(preset)"
        >
          <span
            class="preset-swatch"
            :style="{
              '--swatch-top': preset.top,
              '--swatch-bottom': preset.bottom,
              '--swatch-page': preset.page,
            }"
          />
          <span>{{ preset.label }}</span>
        </button>
      </div>
    </header>

    <section class="probe-content">
      <div class="readout">
        <div>
          <span>Header</span>
          <code>{{ settings.topColor }}</code>
        </div>
        <div>
          <span>Bottom</span>
          <code>{{ settings.bottomColor }}</code>
        </div>
        <div>
          <span>Page</span>
          <code>{{ settings.pageColor }}</code>
        </div>
        <div>
          <span>theme-color</span>
          <code>{{ activeThemeColor }}</code>
        </div>
      </div>

      <p class="hint">
        Change colors, scroll, then watch the iOS browser/status areas.
      </p>

      <div class="scroll-rows">
        <span
          v-for="index in 18"
          :key="index"
        >
          scroll test {{ index }}
        </span>
      </div>
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
        <input
          v-model="settings.themeColor"
          type="color"
          :disabled="settings.metaFollowsTop === 'yes'"
        >
        <code>{{ activeThemeColor }}</code>
      </label>

      <label class="toggle-field">
        <input
          v-model="settings.metaFollowsTop"
          type="checkbox"
          true-value="yes"
          false-value="no"
        >
        <span>Meta follows top</span>
      </label>

      <div class="button-row">
        <button
          type="button"
          @click="swapEdgeColors"
        >
          Swap
        </button>
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
  min-height: 220dvh;
  background:
    linear-gradient(
      180deg,
      var(--probe-page),
      color-mix(in srgb, var(--probe-page) 82%, var(--probe-bottom))
    );
  color: var(--probe-page-text);
  padding:
    calc(var(--probe-top-height, 176px) + 18px)
    max(16px, env(safe-area-inset-right))
    calc(var(--probe-bottom-height, 168px) + 18px)
    max(16px, env(safe-area-inset-left));
  -webkit-tap-highlight-color: color-mix(in srgb, var(--probe-top) 28%, transparent);
}

.edge-probe,
.edge-probe * {
  box-sizing: border-box;
}

.top-edge,
.bottom-edge {
  position: fixed;
  left: 0;
  width: 100%;
  border-color: color-mix(in srgb, currentColor 22%, transparent);
}

.top-edge {
  z-index: 30;
  top: 0;
  border-bottom: 1px solid;
  background: var(--probe-top);
  color: var(--probe-top-text);
  padding:
    max(12px, env(safe-area-inset-top))
    max(12px, env(safe-area-inset-right))
    12px
    max(12px, env(safe-area-inset-left));
  box-shadow: 0 10px 28px color-mix(in srgb, #000 18%, transparent);
}

.bottom-edge {
  z-index: 32;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
  border-top: 1px solid;
  background: var(--probe-bottom);
  color: var(--probe-bottom-text);
  padding:
    12px
    max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
  box-shadow: 0 -12px 32px color-mix(in srgb, #000 22%, transparent);
}

.top-edge__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.top-edge p,
h1,
.hint {
  margin: 0;
}

.top-edge p,
.color-field span,
.toggle-field,
.readout span {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(1.8rem, 8vw, 3.75rem);
  line-height: 0.92;
}

.preset-row,
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-row {
  margin-top: 12px;
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
  cursor: pointer;
}

.preset-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
}

.preset-swatch {
  width: 22px;
  height: 22px;
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  border-radius: 50%;
  background:
    linear-gradient(135deg, var(--swatch-top) 0 49%, transparent 50%),
    linear-gradient(315deg, var(--swatch-bottom) 0 49%, var(--swatch-page) 50%);
}

.color-field {
  display: grid;
  grid-template-columns: auto 34px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.color-field--top {
  min-width: min(230px, 48vw);
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

.toggle-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
}

.toggle-field input {
  width: 18px;
  height: 18px;
  accent-color: var(--probe-top);
}

.button-row {
  justify-content: flex-end;
}

.button-row button {
  flex: 1 1 70px;
  padding: 0 10px;
}

.probe-content {
  max-width: 760px;
  margin: 0 auto;
}

.readout {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.readout div,
.scroll-rows span {
  border: 1px solid color-mix(in srgb, var(--probe-page-text) 18%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--probe-page) 78%, transparent);
}

.readout div {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
}

.hint {
  max-width: 540px;
  padding: 28px 0;
  font-size: clamp(1.3rem, 5vw, 2.5rem);
  font-weight: 850;
  line-height: 1.05;
}

.scroll-rows {
  display: grid;
  gap: 10px;
}

.scroll-rows span {
  display: block;
  padding: 18px;
  font-weight: 800;
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
  .top-edge__main,
  .bottom-edge,
  .readout {
    grid-template-columns: 1fr;
  }

  .top-edge__main {
    align-items: flex-start;
    flex-direction: column;
  }

  .bottom-edge {
    align-items: stretch;
  }

  .button-row {
    justify-content: stretch;
  }
}
</style>
