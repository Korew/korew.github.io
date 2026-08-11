import { describe, expect, it } from 'vitest'
import {
  buildInvoiceFilename,
  calculateInvoiceTotal,
  calculateLineTotal,
  composeCorkCompensatorName,
  formatMoneyUah,
  formatUkrainianCurrencyWords,
  formatUkrainianInvoiceDate,
  generateInvoiceNumber,
  integerToUkrainianWords,
} from '../../app/pages/tools/invoice-generator/_utils/invoice-generator'

describe('invoice generator utilities', () => {
  it('generates invoice numbers from local ISO dates', () => {
    expect(generateInvoiceNumber('2026-08-10')).toBe('1008')
    expect(generateInvoiceNumber('2026-01-03')).toBe('0301')
  })

  it('formats Ukrainian invoice dates without UTC parsing shifts', () => {
    expect(formatUkrainianInvoiceDate('2026-08-10')).toBe('10 серпня 2026 р.')
  })

  it('rounds line totals, invoice totals, and money display safely', () => {
    expect(calculateLineTotal({ quantity: 3, unitPrice: 0.335 })).toBe(1.01)
    expect(calculateInvoiceTotal([
      { quantity: 8, unitPrice: 200 },
      { quantity: 3, unitPrice: 0.335 },
      { quantity: null, unitPrice: 100 },
    ])).toBe(1601.01)
    expect(formatMoneyUah(12450.5)).toBe('12 450,50')
  })

  it('composes cork compensator names without empty dimensions', () => {
    expect(composeCorkCompensatorName('RG-107', '10×15×900')).toBe(
      'Корковий компенсатор RG-107 (10×15×900)'
    )
    expect(composeCorkCompensatorName('RG-107', '')).toBe(
      'Корковий компенсатор RG-107'
    )
    expect(composeCorkCompensatorName('', '10×15×900')).toBe(
      'Корковий компенсатор (10×15×900)'
    )
    expect(composeCorkCompensatorName('', '')).toBe('Корковий компенсатор')
  })

  it('formats Ukrainian integer words with thousand and million grammar', () => {
    expect(integerToUkrainianWords(0, 'feminine')).toBe('нуль')
    expect(integerToUkrainianWords(1, 'feminine')).toBe('одна')
    expect(integerToUkrainianWords(2, 'feminine')).toBe('дві')
    expect(integerToUkrainianWords(5, 'feminine')).toBe('п\'ять')
    expect(integerToUkrainianWords(21, 'feminine')).toBe('двадцять одна')
    expect(integerToUkrainianWords(22, 'feminine')).toBe('двадцять дві')
    expect(integerToUkrainianWords(25, 'feminine')).toBe('двадцять п\'ять')
    expect(integerToUkrainianWords(100, 'feminine')).toBe('сто')
    expect(integerToUkrainianWords(101, 'feminine')).toBe('сто одна')
    expect(integerToUkrainianWords(1000, 'feminine')).toBe('одна тисяча')
    expect(integerToUkrainianWords(2000, 'feminine')).toBe('дві тисячі')
    expect(integerToUkrainianWords(5000, 'feminine')).toBe('п\'ять тисяч')
    expect(integerToUkrainianWords(1600, 'feminine')).toBe('одна тисяча шістсот')
    expect(integerToUkrainianWords(1100, 'feminine')).toBe('одна тисяча сто')
    expect(integerToUkrainianWords(21000, 'feminine')).toBe(
      'двадцять одна тисяча'
    )
    expect(integerToUkrainianWords(1000000, 'feminine')).toBe('один мільйон')
  })

  it('formats Ukrainian currency words with hryvnia and kopiyka grammar', () => {
    expect(formatUkrainianCurrencyWords(1)).toBe('одна гривня 00 копійок')
    expect(formatUkrainianCurrencyWords(2)).toBe('дві гривні 00 копійок')
    expect(formatUkrainianCurrencyWords(5)).toBe('п\'ять гривень 00 копійок')
    expect(formatUkrainianCurrencyWords(21)).toBe(
      'двадцять одна гривня 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(22)).toBe(
      'двадцять дві гривні 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(25)).toBe(
      'двадцять п\'ять гривень 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(1000)).toBe(
      'одна тисяча гривень 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(2000)).toBe(
      'дві тисячі гривень 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(5000)).toBe(
      'п\'ять тисяч гривень 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(1600)).toBe(
      'одна тисяча шістсот гривень 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(1000000)).toBe(
      'один мільйон гривень 00 копійок'
    )
    expect(formatUkrainianCurrencyWords(100.05)).toBe(
      'сто гривень 05 копійок'
    )
    expect(formatUkrainianCurrencyWords(1.01)).toBe('одна гривня 01 копійка')
    expect(formatUkrainianCurrencyWords(2.02)).toBe('дві гривні 02 копійки')
    expect(formatUkrainianCurrencyWords(5.05)).toBe(
      'п\'ять гривень 05 копійок'
    )
  })

  it('builds Ukrainian PDF filenames and strips invalid characters', () => {
    expect(buildInvoiceFilename('Німащук В.М.', '2026-08-10')).toBe(
      'Рахунок_Німащук_В.М._2026-08-10.pdf'
    )
    expect(buildInvoiceFilename('', '2026-08-10')).toBe(
      'Рахунок_2026-08-10.pdf'
    )
    expect(buildInvoiceFilename('  А/Б:C*? "D" <E> | F  ', '2026-08-10'))
      .toBe('Рахунок_А_Б_C_D_E_F_2026-08-10.pdf')
  })
})
