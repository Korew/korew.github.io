<template>
  <section class="invoice-tool">
    <header class="invoice-tool__intro">
      <nav
        class="locale-switcher"
        :aria-label="t('pages.tools.invoiceGenerator.languageSwitcher')"
      >
        <NuxtLink
          v-for="language in availableLocales"
          :key="language.code"
          class="locale-switcher__link"
          :class="{ 'locale-switcher__link--active': locale === language.code }"
          :to="localePath('/tools/invoice-generator', language.code)"
        >
          {{ language.code.toUpperCase() }}
        </NuxtLink>
      </nav>

      <div>
        <h1>{{ t('pages.tools.invoiceGenerator.title') }}</h1>
        <p>{{ t('pages.tools.invoiceGenerator.description') }}</p>
      </div>
    </header>

    <div class="invoice-tool__layout">
      <form
        class="invoice-tool__editor"
        novalidate
        @submit.prevent="printInvoice"
      >
        <section class="editor-section" aria-labelledby="invoice-details-title">
          <h2 id="invoice-details-title">
            {{ t('pages.tools.invoiceGenerator.sections.invoiceDetails') }}
          </h2>

          <div class="field-grid">
            <div class="field field--wide">
              <label for="invoice-supplier">
                {{ t('pages.tools.invoiceGenerator.fields.supplier') }}
              </label>
              <input
                id="invoice-supplier"
                v-model="draft.supplier"
                :aria-describedby="
                  isSupplierInvalid ? 'supplier-error' : undefined
                "
                :aria-invalid="isSupplierInvalid"
                type="text"
                autocomplete="organization"
              />
              <p
                v-if="isSupplierInvalid"
                id="supplier-error"
                class="field-error"
              >
                {{
                  t('pages.tools.invoiceGenerator.validation.supplierRequired')
                }}
              </p>
            </div>

            <div class="field field--wide">
              <label for="invoice-recipient">
                {{ t('pages.tools.invoiceGenerator.fields.recipient') }}
              </label>
              <input
                id="invoice-recipient"
                v-model="draft.recipient"
                :aria-describedby="
                  isRecipientInvalid ? 'recipient-error' : undefined
                "
                :aria-invalid="isRecipientInvalid"
                type="text"
                autocomplete="name"
              />
              <p
                v-if="isRecipientInvalid"
                id="recipient-error"
                class="field-error"
              >
                {{
                  t('pages.tools.invoiceGenerator.validation.recipientRequired')
                }}
              </p>
            </div>

            <div class="field">
              <label for="invoice-date">
                {{ t('pages.tools.invoiceGenerator.fields.date') }}
              </label>
              <input
                id="invoice-date"
                v-model="draft.date"
                :aria-describedby="isDateInvalid ? 'date-error' : undefined"
                :aria-invalid="isDateInvalid"
                type="date"
              />
              <p v-if="isDateInvalid" id="date-error" class="field-error">
                {{ t('pages.tools.invoiceGenerator.validation.dateRequired') }}
              </p>
            </div>

            <div class="field">
              <label for="invoice-number">
                {{ t('pages.tools.invoiceGenerator.fields.invoiceNumber') }}
              </label>
              <input
                id="invoice-number"
                :aria-describedby="
                  isInvoiceNumberInvalid ? 'invoice-number-error' : undefined
                "
                :aria-invalid="isInvoiceNumberInvalid"
                :value="draft.invoiceNumber"
                type="text"
                @input="updateInvoiceNumber"
              />
              <p
                v-if="isInvoiceNumberInvalid"
                id="invoice-number-error"
                class="field-error"
              >
                {{
                  t('pages.tools.invoiceGenerator.validation.numberRequired')
                }}
              </p>
            </div>
          </div>
        </section>

        <section class="editor-section" aria-labelledby="quick-add-title">
          <h2 id="quick-add-title">
            {{ t('pages.tools.invoiceGenerator.sections.quickAdd') }}
          </h2>

          <div class="quick-add">
            <div class="field">
              <label for="quick-product-code">
                {{ t('pages.tools.invoiceGenerator.fields.productCode') }}
              </label>
              <input
                id="quick-product-code"
                v-model="quickAdd.code"
                list="invoice-product-codes"
                type="text"
              />
              <datalist id="invoice-product-codes">
                <option
                  v-for="code in productCodes"
                  :key="code"
                  :value="code"
                />
              </datalist>
            </div>

            <div class="field">
              <label for="quick-product-dimensions">
                {{ t('pages.tools.invoiceGenerator.fields.dimensions') }}
              </label>
              <input
                id="quick-product-dimensions"
                v-model="quickAdd.dimensions"
                list="invoice-product-dimensions"
                type="text"
              />
              <datalist id="invoice-product-dimensions">
                <option
                  v-for="dimensions in productDimensions"
                  :key="dimensions"
                  :value="dimensions"
                />
              </datalist>
            </div>

            <button
              class="button button--icon quick-add__button"
              type="button"
              :aria-label="t('pages.tools.invoiceGenerator.actions.quickAdd')"
              @click="addQuickProduct"
            >
              <Icon
                class="button__icon"
                name="lucide:arrow-right"
                aria-hidden="true"
              />
            </button>
          </div>

          <p v-if="quickAddError" class="field-error">
            {{ quickAddError }}
          </p>
        </section>

        <section class="editor-section" aria-labelledby="products-title">
          <div class="section-heading">
            <div>
              <h2 id="products-title">
                {{ t('pages.tools.invoiceGenerator.sections.products') }}
              </h2>
              <p>{{ t('pages.tools.invoiceGenerator.productsIntro') }}</p>
            </div>
            <button
              class="button button--secondary"
              type="button"
              @click="addProduct"
            >
              <Icon
                class="button__icon"
                name="lucide:plus"
                aria-hidden="true"
              />
            </button>
          </div>

          <div class="invoice-items">
            <article
              v-for="(item, index) in draft.items"
              :key="item.id"
              class="invoice-item"
            >
              <header class="invoice-item__header">
                <h3>
                  {{
                    t('pages.tools.invoiceGenerator.itemHeading', {
                      number: index + 1,
                    })
                  }}
                </h3>
                <div class="invoice-item__actions">
                  <button
                    class="button button--icon"
                    type="button"
                    :aria-label="
                      t(
                        'pages.tools.invoiceGenerator.actions.duplicateItemAria',
                        { number: index + 1 }
                      )
                    "
                    @click="duplicateItem(item)"
                  >
                    <Icon
                      class="button__icon"
                      name="lucide:copy"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    class="button button--icon"
                    type="button"
                    :aria-label="
                      t('pages.tools.invoiceGenerator.actions.removeItemAria', {
                        number: index + 1,
                      })
                    "
                    @click="removeItem(item.id)"
                  >
                    <Icon
                      class="button__icon"
                      name="lucide:trash-2"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </header>

              <div class="item-grid">
                <div class="field field--wide">
                  <label :for="`product-name-${item.id}`">
                    {{ t('pages.tools.invoiceGenerator.fields.productName') }}
                  </label>
                  <input
                    :id="`product-name-${item.id}`"
                    v-model="item.name"
                    type="text"
                    :aria-invalid="isItemInvalid(item)"
                  />
                </div>

                <div class="field">
                  <label :for="`product-unit-${item.id}`">
                    {{ t('pages.tools.invoiceGenerator.fields.unit') }}
                  </label>
                  <input
                    :id="`product-unit-${item.id}`"
                    v-model="item.unit"
                    type="text"
                    :aria-invalid="isItemInvalid(item)"
                  />
                </div>

                <div class="field">
                  <label :for="`product-quantity-${item.id}`">
                    {{ t('pages.tools.invoiceGenerator.fields.quantity') }}
                  </label>
                  <input
                    :id="`product-quantity-${item.id}`"
                    :value="item.quantity ?? ''"
                    inputmode="decimal"
                    min="0"
                    step="1"
                    type="number"
                    :aria-invalid="isItemInvalid(item)"
                    @input="updateItemQuantity(item, $event)"
                  />
                </div>

                <div class="field">
                  <label :for="`product-price-${item.id}`">
                    {{ t('pages.tools.invoiceGenerator.fields.price') }}
                  </label>
                  <input
                    :id="`product-price-${item.id}`"
                    :value="item.unitPrice ?? ''"
                    inputmode="decimal"
                    min="0"
                    step="0.01"
                    type="number"
                    :aria-invalid="isItemInvalid(item)"
                    @input="updateItemPrice(item, $event)"
                  />
                </div>
              </div>

              <p v-if="isItemInvalid(item)" class="field-error">
                {{
                  t('pages.tools.invoiceGenerator.validation.itemInvalid', {
                    number: index + 1,
                  })
                }}
              </p>
            </article>
          </div>
        </section>

        <section
          class="editor-section editor-actions"
          :aria-label="t('pages.tools.invoiceGenerator.sections.actions')"
        >
          <div
            v-if="showValidation && validationMessages.length"
            ref="validationSummary"
            class="validation-summary"
            tabindex="-1"
            role="alert"
          >
            <p>
              {{ t('pages.tools.invoiceGenerator.validation.summaryTitle') }}
            </p>
            <ul>
              <li v-for="message in validationMessages" :key="message">
                {{ message }}
              </li>
            </ul>
          </div>

          <div class="action-row">
            <button
              class="button button--secondary"
              type="button"
              @click="newInvoice"
            >
              <Icon
                class="button__icon"
                name="lucide:file-plus"
                aria-hidden="true"
              />
              <span class="button__label">
                {{ t('pages.tools.invoiceGenerator.actions.newInvoice') }}
              </span>
            </button>
            <button
              class="button button--secondary"
              type="button"
              @click="clearSavedData"
            >
              <Icon
                class="button__icon"
                name="lucide:eraser"
                aria-hidden="true"
              />
              <span class="button__label">
                {{ t('pages.tools.invoiceGenerator.actions.clearSavedData') }}
              </span>
            </button>
            <button class="button button--primary" type="submit">
              <Icon
                class="button__icon"
                name="lucide:printer"
                aria-hidden="true"
              />
              <span class="button__label">
                {{ t('pages.tools.invoiceGenerator.actions.savePdf') }}
              </span>
            </button>
          </div>

          <p v-if="isDraftSavedLocally" class="save-state" aria-live="polite">
            {{ t('pages.tools.invoiceGenerator.draftSavedLocally') }}
          </p>
        </section>
      </form>

      <aside
        class="invoice-tool__preview"
        aria-labelledby="invoice-preview-title"
      >
        <div class="invoice-tool__preview-header">
          <h2 id="invoice-preview-title">
            {{ t('pages.tools.invoiceGenerator.preview') }}
          </h2>
        </div>
        <div
          ref="previewFrame"
          class="invoice-tool__preview-frame"
          :style="previewFrameStyle"
        >
          <div
            ref="previewPage"
            class="invoice-tool__preview-page"
            :style="previewPageStyle"
          >
            <InvoicePreview
              :date="draft.date"
              :invoice-number="draft.invoiceNumber"
              :items="draft.items"
              :recipient="draft.recipient"
              :supplier="draft.supplier"
            />
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import InvoicePreview from './_components/InvoicePreview.vue'
import type { InvoiceItem } from './_utils/invoice-generator'
import {
  DEFAULT_INVOICE_QUANTITY,
  DEFAULT_INVOICE_UNIT,
  buildInvoiceFilename,
  composeCorkCompensatorName,
  generateInvoiceNumber,
  getLocalDateInputValue,
  isInvoiceItemPopulated,
  isInvoiceItemValid,
  parseInvoiceDate,
} from './_utils/invoice-generator'

type InvoiceDraft = {
  supplier: string
  recipient: string
  date: string
  invoiceNumber: string
  isInvoiceNumberAutomatic: boolean
  items: InvoiceItem[]
}

const STORAGE_KEY = 'kpv-invoice-generator'
const LEGACY_STORAGE_KEYS = ['korew.tools.invoice-generator.v1'] as const
const PRODUCT_CODES = [
  'RG-101',
  'RG-102',
  'RG-103',
  'RG-104',
  'RG-105',
  'RG-106',
  'RG-107',
  'RG-108',
  'RG-109',
  'RG-110',
  'RG-111',
  'RG-112',
  'RG-113',
] as const
const PRODUCT_DIMENSIONS = ['7×15×900', '10×15×900'] as const

definePageMeta({
  layout: 'empty',
})

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const availableLocales = computed(() => locales.value)

useLocalizedSeo({
  titleKey: 'pages.tools.invoiceGenerator.seo.title',
  descriptionKey: 'pages.tools.invoiceGenerator.seo.description',
})

const createBlankItem = (id: string): InvoiceItem => ({
  id,
  name: '',
  unit: DEFAULT_INVOICE_UNIT,
  quantity: DEFAULT_INVOICE_QUANTITY,
  unitPrice: null,
})

const createDefaultDraft = (
  date: string,
  supplier = '',
  recipient = ''
): InvoiceDraft => ({
  supplier,
  recipient,
  date,
  invoiceNumber: generateInvoiceNumber(date),
  isInvoiceNumberAutomatic: true,
  items: [createBlankItem('item-1')],
})

const draft = reactive<InvoiceDraft>(createDefaultDraft(''))
const quickAdd = reactive({
  code: 'RG-101',
  dimensions: '7×15×900',
})
const productCodes = PRODUCT_CODES
const productDimensions = PRODUCT_DIMENSIONS
const showValidation = ref(false)
const hasRestoredDraft = ref(false)
const isDraftSavedLocally = ref(false)
const initialClientDate = ref('')
const quickAddError = ref('')
const validationSummary = ref<HTMLElement | null>(null)
const previewFrame = ref<HTMLElement | null>(null)
const previewPage = ref<HTMLElement | null>(null)
const previewScale = ref(1)
const previewPageWidth = ref(0)
const previewPageHeight = ref(0)
const nextItemIndex = ref(2)
let previewResizeObserver: ResizeObserver | null = null

const previewFrameStyle = computed(() => {
  if (previewPageWidth.value === 0 || previewPageHeight.value === 0) {
    return undefined
  }

  return {
    width: `${previewPageWidth.value * previewScale.value}px`,
    height: `${previewPageHeight.value * previewScale.value}px`,
  }
})

const previewPageStyle = computed(() => ({
  transform: `scale(${previewScale.value})`,
}))

const updatePreviewScale = () => {
  const frame = previewFrame.value
  const page = previewPage.value
  const documentElement = page?.querySelector<HTMLElement>('.invoice-document')

  if (!frame || !page || !documentElement) {
    return
  }

  const documentWidth = documentElement.offsetWidth
  const documentHeight = documentElement.offsetHeight

  if (documentWidth === 0 || documentHeight === 0) {
    return
  }

  const availableWidth = frame.parentElement?.clientWidth || documentWidth
  const nextScale = Math.min(1, availableWidth / documentWidth)

  previewScale.value = Number.isFinite(nextScale) ? nextScale : 1
  previewPageWidth.value = documentWidth
  previewPageHeight.value = documentHeight
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getStoredString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

const getStoredNumber = (value: unknown): number | null => {
  if (value === null) {
    return null
  }

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const normalizeStoredItem = (
  value: unknown,
  index: number
): InvoiceItem | null => {
  if (!isRecord(value)) {
    return null
  }

  const id =
    getStoredString(value.id, `item-${index + 1}`) || `item-${index + 1}`

  return {
    id,
    name: getStoredString(value.name, ''),
    unit:
      getStoredString(value.unit, DEFAULT_INVOICE_UNIT) || DEFAULT_INVOICE_UNIT,
    quantity: getStoredNumber(value.quantity),
    unitPrice: getStoredNumber(value.unitPrice),
  }
}

const normalizeStoredDraft = (
  value: unknown,
  fallbackDate: string
): InvoiceDraft | null => {
  if (!isRecord(value)) {
    return null
  }

  const storedDate = getStoredString(value.date, '')
  const date = parseInvoiceDate(storedDate) ? storedDate : fallbackDate
  const isInvoiceNumberAutomatic =
    typeof value.isInvoiceNumberAutomatic === 'boolean'
      ? value.isInvoiceNumberAutomatic
      : true
  const storedItems = Array.isArray(value.items)
    ? value.items
        .map(normalizeStoredItem)
        .filter((item): item is InvoiceItem => item !== null)
    : []
  const items =
    storedItems.length > 0 ? storedItems : [createBlankItem('item-1')]
  const invoiceNumber = isInvoiceNumberAutomatic
    ? generateInvoiceNumber(date)
    : getStoredString(value.invoiceNumber, '')

  return {
    supplier: getStoredString(value.supplier, ''),
    recipient: getStoredString(value.recipient, ''),
    date,
    invoiceNumber,
    isInvoiceNumberAutomatic,
    items,
  }
}

const serializeDraft = () => ({
  supplier: draft.supplier,
  recipient: draft.recipient,
  date: draft.date,
  invoiceNumber: draft.invoiceNumber,
  isInvoiceNumberAutomatic: draft.isInvoiceNumberAutomatic,
  items: draft.items.map(item => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
})

const isDraftPersistable = (value: InvoiceDraft): boolean => {
  const hasPartyData =
    value.supplier.trim().length > 0 || value.recipient.trim().length > 0
  const hasNonDefaultDate =
    initialClientDate.value !== '' && value.date !== initialClientDate.value
  const hasManualNumber =
    !value.isInvoiceNumberAutomatic &&
    value.invoiceNumber.trim().length > 0 &&
    value.invoiceNumber !== generateInvoiceNumber(value.date)
  const hasProductData = value.items.some(isInvoiceItemPopulated)

  return hasPartyData || hasNonDefaultDate || hasManualNumber || hasProductData
}

const syncNextItemIndex = () => {
  nextItemIndex.value = 1

  while (draft.items.some(item => item.id === `item-${nextItemIndex.value}`)) {
    nextItemIndex.value += 1
  }
}

const applyDraft = (nextDraft: InvoiceDraft) => {
  draft.supplier = nextDraft.supplier
  draft.recipient = nextDraft.recipient
  draft.date = nextDraft.date
  draft.invoiceNumber = nextDraft.invoiceNumber
  draft.isInvoiceNumberAutomatic = nextDraft.isInvoiceNumberAutomatic
  draft.items.splice(0, draft.items.length, ...nextDraft.items)
  syncNextItemIndex()
}

const getNextItemId = (): string => {
  let id = `item-${nextItemIndex.value}`

  while (draft.items.some(item => item.id === id)) {
    nextItemIndex.value += 1
    id = `item-${nextItemIndex.value}`
  }

  nextItemIndex.value += 1

  return id
}

const readStoredDraft = (fallbackDate: string): InvoiceDraft | null => {
  try {
    const rawDraft = window.localStorage.getItem(STORAGE_KEY)

    if (!rawDraft) {
      return null
    }

    const storedDraft = normalizeStoredDraft(JSON.parse(rawDraft), fallbackDate)

    return storedDraft && isDraftPersistable(storedDraft) ? storedDraft : null
  } catch {
    return null
  }
}

const persistDraft = (): boolean => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDraft()))
    return true
  } catch {}

  return false
}

const clearDraftStorage = (): boolean => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    LEGACY_STORAGE_KEYS.forEach(key => window.localStorage.removeItem(key))
    return true
  } catch {}

  return false
}

const parseNumberInput = (event: Event): number | null => {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return null
  }

  const value = target.value.trim()

  if (value === '') {
    return null
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

const updateInvoiceNumber = (event: Event) => {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  draft.isInvoiceNumberAutomatic = false
  draft.invoiceNumber = target.value
}

const updateItemQuantity = (item: InvoiceItem, event: Event) => {
  item.quantity = parseNumberInput(event)
}

const updateItemPrice = (item: InvoiceItem, event: Event) => {
  item.unitPrice = parseNumberInput(event)
}

const addProduct = () => {
  draft.items.push(createBlankItem(getNextItemId()))
}

const duplicateItem = (item: InvoiceItem) => {
  const itemIndex = draft.items.findIndex(candidate => candidate.id === item.id)
  const duplicate = {
    ...item,
    id: getNextItemId(),
  }

  if (itemIndex >= 0) {
    draft.items.splice(itemIndex + 1, 0, duplicate)
    return
  }

  draft.items.push(duplicate)
}

const removeItem = (id: string) => {
  if (draft.items.length === 1) {
    draft.items.splice(0, 1, createBlankItem(getNextItemId()))
    return
  }

  const itemIndex = draft.items.findIndex(item => item.id === id)

  if (itemIndex >= 0) {
    draft.items.splice(itemIndex, 1)
  }
}

const addQuickProduct = () => {
  const productName = composeCorkCompensatorName(
    quickAdd.code,
    quickAdd.dimensions
  )

  if (productName === 'Корковий компенсатор') {
    quickAddError.value = t(
      'pages.tools.invoiceGenerator.validation.quickAddRequired'
    )
    return
  }

  const productItem = {
    ...createBlankItem(getNextItemId()),
    name: productName,
  }
  const blankItemIndex = draft.items.findIndex(
    item => !isInvoiceItemPopulated(item)
  )

  quickAddError.value = ''

  if (blankItemIndex >= 0) {
    draft.items.splice(blankItemIndex, 1, productItem)
    return
  }

  draft.items.push(productItem)
}

const newInvoice = () => {
  const today = getLocalDateInputValue()

  showValidation.value = false
  quickAddError.value = ''
  applyDraft(createDefaultDraft(today, draft.supplier, draft.recipient))
}

const clearSavedData = async () => {
  if (
    !window.confirm(t('pages.tools.invoiceGenerator.confirmClearSavedData'))
  ) {
    return
  }

  const today = getLocalDateInputValue()

  clearDraftStorage()
  hasRestoredDraft.value = false
  isDraftSavedLocally.value = false
  showValidation.value = false
  quickAddError.value = ''
  applyDraft(createDefaultDraft(today))
  await nextTick()
  hasRestoredDraft.value = true
}

const isSupplierInvalid = computed(
  () => showValidation.value && draft.supplier.trim().length === 0
)
const isRecipientInvalid = computed(
  () => showValidation.value && draft.recipient.trim().length === 0
)
const isDateInvalid = computed(
  () => showValidation.value && parseInvoiceDate(draft.date) === null
)
const isInvoiceNumberInvalid = computed(
  () => showValidation.value && draft.invoiceNumber.trim().length === 0
)
const validItems = computed(() => draft.items.filter(isInvoiceItemValid))
const validationMessages = computed(() => {
  const messages: string[] = []

  if (draft.supplier.trim().length === 0) {
    messages.push(t('pages.tools.invoiceGenerator.validation.supplierRequired'))
  }

  if (draft.recipient.trim().length === 0) {
    messages.push(
      t('pages.tools.invoiceGenerator.validation.recipientRequired')
    )
  }

  if (parseInvoiceDate(draft.date) === null) {
    messages.push(t('pages.tools.invoiceGenerator.validation.dateRequired'))
  }

  if (draft.invoiceNumber.trim().length === 0) {
    messages.push(t('pages.tools.invoiceGenerator.validation.numberRequired'))
  }

  if (validItems.value.length === 0) {
    messages.push(
      t('pages.tools.invoiceGenerator.validation.validItemRequired')
    )
  }

  draft.items.forEach((item, index) => {
    if (isInvoiceItemPopulated(item) && !isInvoiceItemValid(item)) {
      messages.push(
        t('pages.tools.invoiceGenerator.validation.itemInvalid', {
          number: index + 1,
        })
      )
    }
  })

  return messages
})

const isItemInvalid = (item: InvoiceItem): boolean =>
  showValidation.value &&
  isInvoiceItemPopulated(item) &&
  !isInvoiceItemValid(item)

const printInvoice = async () => {
  showValidation.value = true

  if (validationMessages.value.length > 0) {
    await nextTick()
    validationSummary.value?.focus()
    return
  }

  const filename = buildInvoiceFilename(draft.recipient, draft.date)
  const titleStem = filename.replace(/\.pdf$/i, '')
  const previousTitle = document.title
  let isTitleRestored = false
  const restoreTitle = () => {
    if (isTitleRestored) {
      return
    }

    isTitleRestored = true
    document.title = previousTitle
    window.removeEventListener('afterprint', restoreTitle)
  }

  document.title = titleStem
  window.addEventListener('afterprint', restoreTitle, { once: true })
  window.print()
}

watch(
  () => draft.date,
  date => {
    if (draft.isInvoiceNumberAutomatic) {
      draft.invoiceNumber = generateInvoiceNumber(date)
    }
  }
)

watch(
  draft,
  () => {
    if (!import.meta.client || !hasRestoredDraft.value) {
      return
    }

    if (isDraftPersistable(draft)) {
      isDraftSavedLocally.value = persistDraft()
      return
    }

    isDraftSavedLocally.value = false
    clearDraftStorage()
  },
  { deep: true }
)

watch(
  draft,
  () => {
    if (import.meta.client) {
      void nextTick(updatePreviewScale)
    }
  },
  { deep: true, flush: 'post' }
)

onMounted(() => {
  const today = getLocalDateInputValue()
  initialClientDate.value = today
  const storedDraft = readStoredDraft(today)

  applyDraft(storedDraft ?? createDefaultDraft(today))
  hasRestoredDraft.value = true
  isDraftSavedLocally.value = storedDraft !== null

  void nextTick(() => {
    updatePreviewScale()

    const previewHost = previewFrame.value?.parentElement
    const documentElement =
      previewPage.value?.querySelector<HTMLElement>('.invoice-document')

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updatePreviewScale)
      return
    }

    previewResizeObserver = new ResizeObserver(() => {
      updatePreviewScale()
    })

    if (previewHost) {
      previewResizeObserver.observe(previewHost)
    }

    if (documentElement) {
      previewResizeObserver.observe(documentElement)
    }
  })
})

onBeforeUnmount(() => {
  previewResizeObserver?.disconnect()
  previewResizeObserver = null
  window.removeEventListener('resize', updatePreviewScale)
})
</script>

<style scoped>
:global(body) {
  background: #f6f8f9;
}

.invoice-tool {
  max-width: 1480px;
  margin: 0 auto;
  padding: 32px 20px 48px;
  min-height: 100dvh;
  color: #17202a;
  background: #f6f8f9;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Arial,
    sans-serif;
}

.invoice-tool__intro {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.invoice-tool__intro h1 {
  margin: 0;
  color: #13261e;
  font-size: 36px;
  line-height: 1.12;
}

.invoice-tool__intro p {
  margin: 12px 0 0;
  color: #405466;
  font-size: 17px;
  line-height: 1.55;
}

.locale-switcher {
  display: inline-flex;
  gap: 6px;
  order: 2;
  padding: 4px;
  border: 1px solid #c9d5dd;
  border-radius: 8px;
  background: #ffffff;
}

.locale-switcher__link {
  display: inline-flex;
  min-width: 44px;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  color: #405466;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
}

.locale-switcher__link:focus-visible {
  outline: 3px solid rgb(47 128 104 / 28%);
  outline-offset: 2px;
}

.locale-switcher__link--active {
  background: #24384a;
  color: #ffffff;
}

.invoice-tool__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 28px;
  align-items: start;
}

.invoice-tool__editor {
  display: grid;
  gap: 26px;
  min-width: 0;
}

.editor-section {
  display: grid;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #d8e0e7;
}

.editor-section:first-child {
  padding-top: 0;
  border-top: 0;
}

.editor-section h2,
.invoice-tool__preview-header h2 {
  margin: 0;
  color: #182635;
  font-size: 20px;
  line-height: 1.25;
}

.section-heading {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.section-heading p,
.editor-section > div > p,
.field-hint,
.save-state {
  margin: 6px 0 0;
  color: #5f7180;
  font-size: 14px;
  line-height: 1.45;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.quick-add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) max-content;
  gap: 14px;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field--wide {
  grid-column: 1 / -1;
}

.field label {
  color: #203040;
  font-size: 14px;
  font-weight: 700;
}

.field input {
  width: 100%;
  min-height: 42px;
  box-sizing: border-box;
  border: 1px solid #aeb9c5;
  border-radius: 6px;
  padding: 9px 10px;
  background: #ffffff;
  color: #17202a;
  font: inherit;
}

.field input:focus-visible,
.button:focus-visible,
.validation-summary:focus-visible {
  outline: 3px solid rgb(47 128 104 / 28%);
  outline-offset: 2px;
}

.field input[aria-invalid='true'] {
  border-color: #b42318;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  line-height: 1.2;
}

.button__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.button__label {
  white-space: nowrap;
}

.button--primary {
  border-color: #1f7a55;
  background: #1f7a55;
  color: #ffffff;
}

.button--secondary,
.button--icon {
  border-color: #aeb9c5;
  background: #ffffff;
  color: #24384a;
}

.button--icon {
  width: 38px;
  min-height: 38px;
  padding: 0;
}

.quick-add {
  align-items: end;
}

.quick-add__button {
  align-self: end;
  width: 42px;
  min-height: 42px;
  justify-self: end;
}

.invoice-items {
  display: grid;
  gap: 12px;
}

.invoice-item {
  display: grid;
  gap: 14px;
  padding: 14px;
  border: 1px solid #d8e0e7;
  border-radius: 8px;
  background: #fbfcfd;
}

.invoice-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.invoice-item__header h3 {
  min-width: 0;
  margin: 0;
  color: #203040;
  font-size: 16px;
  line-height: 1.25;
}

.invoice-item__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
}

.editor-actions {
  padding-bottom: 4px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field-error {
  margin: 0;
  color: #9f2419;
  font-size: 13px;
  line-height: 1.4;
}

.validation-summary {
  padding: 12px 14px;
  border: 1px solid #e58c84;
  border-radius: 6px;
  background: #fff4f2;
  color: #6f1d15;
}

.validation-summary p {
  margin: 0 0 8px;
  font-weight: 700;
}

.validation-summary ul {
  margin: 0;
  padding-left: 20px;
}

.invoice-tool__preview {
  position: sticky;
  top: 96px;
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
}

.invoice-tool__preview-header {
  margin-bottom: 12px;
}

.invoice-tool__preview-frame {
  width: 210mm;
  height: 297mm;
  max-width: 100%;
}

.invoice-tool__preview-page {
  width: 210mm;
  transform-origin: top left;
}

@media (max-width: 1279px) {
  .invoice-tool__layout {
    grid-template-columns: 1fr;
  }

  .invoice-tool__preview {
    position: static;
    overflow-x: auto;
  }
}

@media (max-width: 767px) {
  .invoice-tool {
    padding: 24px 14px 36px;
  }

  .invoice-tool__intro {
    flex-direction: column;
  }

  .locale-switcher {
    order: 0;
  }

  .invoice-tool__intro h1 {
    font-size: 30px;
  }

  .field-grid,
  .quick-add {
    grid-template-columns: 1fr;
  }

  .item-grid {
    gap: 10px;
  }

  .section-heading,
  .action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .button {
    width: 100%;
  }

  .button--icon {
    width: 38px;
  }

  .quick-add__button {
    width: 42px;
  }

  .invoice-tool__preview {
    width: 100%;
  }
}

@page {
  size: A4 portrait;
  margin: 12mm;
}

@media print {
  :global(body),
  .invoice-tool {
    background: #ffffff !important;
  }

  .invoice-tool {
    max-width: none;
    padding: 0;
  }

  .invoice-tool__intro,
  .invoice-tool__editor,
  .invoice-tool__preview-header {
    display: none !important;
  }

  .invoice-tool__layout {
    display: block;
  }

  .invoice-tool__preview {
    position: static;
    overflow: visible;
    width: auto;
    max-width: none;
  }

  .invoice-tool__preview-frame {
    width: auto !important;
    height: auto !important;
    max-width: none;
  }

  .invoice-tool__preview-page {
    width: auto;
    transform: none !important;
  }
}
</style>
