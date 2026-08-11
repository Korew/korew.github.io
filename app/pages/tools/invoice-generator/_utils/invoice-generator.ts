export type InvoiceItem = {
  id: string
  name: string
  unit: string
  quantity: number | null
  unitPrice: number | null
}

type InvoiceDateParts = {
  year: number
  month: number
  day: number
}

type GrammaticalGender = 'masculine' | 'feminine'
type PluralForms = readonly [one: string, few: string, many: string]

export const DEFAULT_INVOICE_UNIT = 'шт.'
export const DEFAULT_INVOICE_QUANTITY = 1

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const INVALID_FILENAME_CHARACTERS = /[\\/:*?"<>|]+/g

const UKRAINIAN_MONTHS = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
] as const

const UNITS: Record<GrammaticalGender, readonly string[]> = {
  masculine: [
    '',
    'один',
    'два',
    'три',
    'чотири',
    "п'ять",
    'шість',
    'сім',
    'вісім',
    "дев'ять",
  ],
  feminine: [
    '',
    'одна',
    'дві',
    'три',
    'чотири',
    "п'ять",
    'шість',
    'сім',
    'вісім',
    "дев'ять",
  ],
}

const TEENS = [
  'десять',
  'одинадцять',
  'дванадцять',
  'тринадцять',
  'чотирнадцять',
  "п'ятнадцять",
  'шістнадцять',
  'сімнадцять',
  'вісімнадцять',
  "дев'ятнадцять",
] as const

const TENS = [
  '',
  '',
  'двадцять',
  'тридцять',
  'сорок',
  "п'ятдесят",
  'шістдесят',
  'сімдесят',
  'вісімдесят',
  "дев'яносто",
] as const

const HUNDREDS = [
  '',
  'сто',
  'двісті',
  'триста',
  'чотириста',
  "п'ятсот",
  'шістсот',
  'сімсот',
  'вісімсот',
  "дев'ятсот",
] as const

const LARGE_GROUPS: ReadonlyArray<{
  forms: PluralForms
  gender: GrammaticalGender
}> = [
  { forms: ['тисяча', 'тисячі', 'тисяч'], gender: 'feminine' },
  { forms: ['мільйон', 'мільйони', 'мільйонів'], gender: 'masculine' },
  { forms: ['мільярд', 'мільярди', 'мільярдів'], gender: 'masculine' },
]

const HRYVNIA_FORMS = ['гривня', 'гривні', 'гривень'] as const
const KOPIYKA_FORMS = ['копійка', 'копійки', 'копійок'] as const

const padTwo = (value: number): string => String(value).padStart(2, '0')

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

const getDaysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

const parseInteger = (value: string): number => Number.parseInt(value, 10)

export const parseInvoiceDate = (value: string): InvoiceDateParts | null => {
  const match = DATE_PATTERN.exec(value)

  if (!match) {
    return null
  }

  const [, yearValue, monthValue, dayValue] = match
  const year = parseInteger(yearValue!)
  const month = parseInteger(monthValue!)
  const day = parseInteger(dayValue!)

  if (year < 1 || month < 1 || month > 12) {
    return null
  }

  if (day < 1 || day > getDaysInMonth(year, month)) {
    return null
  }

  return { year, month, day }
}

export const getLocalDateInputValue = (date = new Date()): string => {
  const year = date.getFullYear()
  const month = padTwo(date.getMonth() + 1)
  const day = padTwo(date.getDate())

  return `${year}-${month}-${day}`
}

export const generateInvoiceNumber = (dateValue: string): string => {
  const parts = parseInvoiceDate(dateValue)

  if (!parts) {
    return ''
  }

  return `${padTwo(parts.day)}${padTwo(parts.month)}`
}

export const formatUkrainianInvoiceDate = (dateValue: string): string => {
  const parts = parseInvoiceDate(dateValue)

  if (!parts) {
    return ''
  }

  return `${parts.day} ${UKRAINIAN_MONTHS[parts.month - 1]} ${parts.year} р.`
}

export const toCurrencyMinorUnits = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.round((value + Number.EPSILON) * 100)
}

export const roundCurrency = (value: number): number =>
  toCurrencyMinorUnits(value) / 100

export const formatMoneyUah = (value: number): string => {
  const minorUnits = toCurrencyMinorUnits(value)
  const sign = minorUnits < 0 ? '-' : ''
  const absoluteMinorUnits = Math.abs(minorUnits)
  const whole = Math.floor(absoluteMinorUnits / 100)
  const kopiyky = absoluteMinorUnits % 100
  const formattedWhole = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return `${sign}${formattedWhole},${padTwo(kopiyky)}`
}

const getPluralForm = (value: number, forms: PluralForms): string => {
  const absolute = Math.abs(value)
  const lastTwoDigits = absolute % 100
  const lastDigit = absolute % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return forms[2]
  }

  if (lastDigit === 1) {
    return forms[0]
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1]
  }

  return forms[2]
}

const convertHundredsGroup = (
  value: number,
  gender: GrammaticalGender
): string => {
  const words: string[] = []
  const hundreds = Math.floor(value / 100)
  const lastTwoDigits = value % 100
  const tens = Math.floor(lastTwoDigits / 10)
  const unit = lastTwoDigits % 10

  if (hundreds > 0) {
    words.push(HUNDREDS[hundreds]!)
  }

  if (lastTwoDigits >= 10 && lastTwoDigits <= 19) {
    words.push(TEENS[lastTwoDigits - 10]!)
  } else {
    if (tens > 1) {
      words.push(TENS[tens]!)
    }

    if (unit > 0) {
      words.push(UNITS[gender][unit]!)
    }
  }

  return words.join(' ')
}

export const integerToUkrainianWords = (
  value: number,
  gender: GrammaticalGender = 'masculine'
): string => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Value must be a non-negative safe integer.')
  }

  if (value === 0) {
    return 'нуль'
  }

  const groups: number[] = []
  let remainingValue = value

  while (remainingValue > 0) {
    groups.push(remainingValue % 1000)
    remainingValue = Math.floor(remainingValue / 1000)
  }

  if (groups.length > LARGE_GROUPS.length + 1) {
    throw new RangeError('Value is too large to format safely.')
  }

  const words: string[] = []

  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const groupValue = groups[index]!

    if (groupValue === 0) {
      continue
    }

    if (index === 0) {
      words.push(convertHundredsGroup(groupValue, gender))
      continue
    }

    const group = LARGE_GROUPS[index - 1]!
    const groupWords = convertHundredsGroup(groupValue, group.gender)
    const groupName = getPluralForm(groupValue, group.forms)

    words.push(`${groupWords} ${groupName}`)
  }

  return words.join(' ')
}

export const formatUkrainianCurrencyWords = (value: number): string => {
  const minorUnits = Math.max(0, toCurrencyMinorUnits(value))
  const hryvni = Math.floor(minorUnits / 100)
  const kopiyky = minorUnits % 100
  const hryvniaWords = integerToUkrainianWords(hryvni, 'feminine')
  const hryvniaForm = getPluralForm(hryvni, HRYVNIA_FORMS)
  const kopiykaForm = getPluralForm(kopiyky, KOPIYKA_FORMS)

  return `${hryvniaWords} ${hryvniaForm} ${padTwo(kopiyky)} ${kopiykaForm}`
}

export const calculateLineTotal = (
  item: Pick<InvoiceItem, 'quantity' | 'unitPrice'>
): number => {
  if (
    typeof item.quantity !== 'number' ||
    typeof item.unitPrice !== 'number' ||
    !Number.isFinite(item.quantity) ||
    !Number.isFinite(item.unitPrice)
  ) {
    return 0
  }

  return roundCurrency(item.quantity * item.unitPrice)
}

export const calculateInvoiceTotal = (
  items: ReadonlyArray<Pick<InvoiceItem, 'quantity' | 'unitPrice'>>
): number => {
  const minorUnits = items.reduce((total, item) => {
    return total + toCurrencyMinorUnits(calculateLineTotal(item))
  }, 0)

  return minorUnits / 100
}

export const isInvoiceItemPopulated = (item: InvoiceItem): boolean => {
  const name = item.name.trim()
  const unit = item.unit.trim()
  const hasCustomUnit = unit !== '' && unit !== DEFAULT_INVOICE_UNIT
  const hasCustomQuantity =
    item.quantity !== null && item.quantity !== DEFAULT_INVOICE_QUANTITY

  return Boolean(
    name || hasCustomUnit || hasCustomQuantity || item.unitPrice !== null
  )
}

export const isInvoiceItemValid = (item: InvoiceItem): boolean =>
  item.name.trim().length > 0 &&
  item.unit.trim().length > 0 &&
  typeof item.quantity === 'number' &&
  Number.isFinite(item.quantity) &&
  item.quantity > 0 &&
  typeof item.unitPrice === 'number' &&
  Number.isFinite(item.unitPrice) &&
  item.unitPrice >= 0

const normalizeTextPart = (value: string): string =>
  value.replace(/\s+/g, ' ').trim()

export const composeCorkCompensatorName = (
  code: string,
  dimensions: string
): string => {
  return [
    'Корковий компенсатор',
    normalizeTextPart(code),
    `(${normalizeTextPart(dimensions)})`,
  ]
    .filter(Boolean)
    .join(' ')
}

export const buildInvoiceFilename = (
  recipient: string,
  dateValue: string
): string => {
  const sanitizedRecipient = normalizeTextPart(
    recipient.replace(INVALID_FILENAME_CHARACTERS, ' ')
  )
  const recipientPart = sanitizedRecipient.replace(/\s+/g, '_')
  const safeDate = normalizeTextPart(
    dateValue.replace(INVALID_FILENAME_CHARACTERS, '-')
  )
  const parts = ['Рахунок', recipientPart, safeDate].filter(Boolean)

  return `${parts.join('_')}.pdf`
}
