<template>
  <article class="invoice-document" aria-label="Рахунок">
    <header class="invoice-document__header">
      <div class="invoice-document__parties">
        <p>
          <strong>Постачальник:</strong>
          <span>{{ supplier }}</span>
        </p>
        <p>
          <strong>Отримувач:</strong>
          <span>{{ recipient }}</span>
        </p>
      </div>
      <p class="invoice-document__date">
        {{ formattedDate }}
      </p>
    </header>

    <h2 class="invoice-document__title">Рахунок №{{ invoiceNumber }}</h2>

    <table class="invoice-table">
      <colgroup>
        <col class="invoice-table__col-number" />
        <col class="invoice-table__col-name" />
        <col class="invoice-table__col-unit" />
        <col class="invoice-table__col-quantity" />
        <col class="invoice-table__col-price" />
        <col class="invoice-table__col-total" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">№ з/п</th>
          <th scope="col">Найменування товару</th>
          <th scope="col">Од. вим.</th>
          <th scope="col">Кількість</th>
          <th scope="col">Ціна, грн</th>
          <th scope="col">Сума, грн</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in visibleItems" :key="item.id">
          <td class="invoice-table__center">
            {{ index + 1 }}
          </td>
          <td class="invoice-table__name">{{ item.name }}</td>
          <td class="invoice-table__center">
            {{ item.unit }}
          </td>
          <td class="invoice-table__number">
            {{ formatQuantity(item.quantity) }}
          </td>
          <td class="invoice-table__number">
            {{ formatNullableMoney(item.unitPrice) }}
          </td>
          <td class="invoice-table__number">
            {{ formatNullableLineTotal(item) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="invoice-total">
      <span>Разом:</span>
      <strong>{{ formattedTotal }}</strong>
    </div>

    <p class="invoice-document__amount">Усього до сплати: {{ amountWords }}.</p>
  </article>
</template>

<script setup lang="ts">
import type { InvoiceItem } from '../_utils/invoice-generator'
import {
  calculateInvoiceTotal,
  calculateLineTotal,
  formatMoneyUah,
  formatUkrainianCurrencyWords,
  formatUkrainianInvoiceDate,
  isInvoiceItemPopulated,
} from '../_utils/invoice-generator'

const props = defineProps<{
  supplier: string
  recipient: string
  date: string
  invoiceNumber: string
  items: readonly InvoiceItem[]
}>()

const visibleItems = computed(() => props.items.filter(isInvoiceItemPopulated))
const total = computed(() => calculateInvoiceTotal(visibleItems.value))
const formattedDate = computed(() => formatUkrainianInvoiceDate(props.date))
const formattedTotal = computed(() => formatMoneyUah(total.value))
const amountWords = computed(() => formatUkrainianCurrencyWords(total.value))

const formatQuantity = (value: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return ''
  }

  return Number.isInteger(value)
    ? String(value)
    : String(value).replace('.', ',')
}

const formatNullableMoney = (value: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return ''
  }

  return formatMoneyUah(value)
}

const formatNullableLineTotal = (item: InvoiceItem): string => {
  if (
    typeof item.quantity !== 'number' ||
    typeof item.unitPrice !== 'number' ||
    !Number.isFinite(item.quantity) ||
    !Number.isFinite(item.unitPrice)
  ) {
    return ''
  }

  return formatMoneyUah(calculateLineTotal(item))
}
</script>

<style scoped>
.invoice-document {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 16mm 14mm;
  background: #ffffff;
  color: #111111;
  box-shadow: 0 18px 44px rgb(17 24 39 / 16%);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 1.38;
}

.invoice-document__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 24px;
  align-items: end;
}

.invoice-document__parties {
  display: grid;
  gap: 8px;
}

.invoice-document__parties p {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.invoice-document__parties p,
.invoice-document__date,
.invoice-document__amount {
  margin: 0;
}

.invoice-document__date {
  white-space: nowrap;
}

.invoice-document__title {
  margin: 22px 0 18px;
  text-align: center;
  font-size: 22px;
  line-height: 1.2;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.invoice-table th,
.invoice-table td {
  border: 1px solid #111111;
  padding: 6px 7px;
  vertical-align: middle;
  word-break: normal;
  overflow-wrap: anywhere;
}

.invoice-table th {
  text-align: center;
  font-weight: 700;
}

.invoice-table tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.invoice-table__col-number {
  width: 11mm;
}

.invoice-table__col-name {
  width: auto;
}

.invoice-table__col-unit {
  width: 20mm;
}

.invoice-table__col-quantity,
.invoice-table__col-price,
.invoice-table__col-total {
  width: 27mm;
}

.invoice-table__center {
  text-align: center;
}

.invoice-table__name {
  text-align: left;
}

.invoice-table__number {
  text-align: right;
  white-space: nowrap;
}

.invoice-total {
  display: grid;
  grid-template-columns: max-content 25mm;
  justify-content: end;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  font-weight: 700;
}

.invoice-total strong {
  text-align: right;
}

.invoice-document__amount {
  margin-top: 28px;
  font-size: 14px;
}

@media print {
  .invoice-document {
    width: auto;
    min-height: auto;
    padding: 0;
    box-shadow: none;
    font-size: 12pt;
  }

  .invoice-table th,
  .invoice-table td {
    border-color: #000000;
  }
}
</style>
