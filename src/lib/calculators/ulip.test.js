import { describe, it, expect } from 'vitest'
import { getMortalityRate, calcULIP, calcTermPlusMF, estimateTermPremium } from './ulip.js'

describe('age-banded rates', () => {
  it('mortality and term premiums never fall with age', () => {
    for (let age = 18; age < 70; age++) {
      expect(getMortalityRate(age + 1)).toBeGreaterThanOrEqual(getMortalityRate(age))
      expect(estimateTermPremium(age + 1)).toBeGreaterThanOrEqual(estimateTermPremium(age))
    }
  })
})

describe('calcULIP', () => {
  it('with no charges and no cover, grows like an annual-start annuity', () => {
    const u = calcULIP(100000, 30, 10, 0, 10, 0, 0)
    const expected = 100000 * ((1.1 ** 10 - 1) / 0.1) * 1.1
    expect(u.maturity).toBe(Math.round(expected))
    expect(u.totalCharges).toBe(0)
  })

  it('deducts allocation and mortality charges each year', () => {
    // 1 year, age 30: 5% allocation (₹5,000) + 1Cr cover at 1.10/1000 (₹11,000)
    const u = calcULIP(100000, 30, 1, 10000000, 10, 5, 0)
    expect(u.totalCharges).toBe(16000)
    expect(u.maturity).toBe(Math.round(84000 * 1.1))
  })

  it('charges make the fund smaller than a charge-free one', () => {
    const charged = calcULIP(100000, 30, 20, 10000000, 10, 5, 1.35)
    const free    = calcULIP(100000, 30, 20, 0, 10, 0, 0)
    expect(charged.maturity).toBeLessThan(free.maturity)
    expect(charged.history).toHaveLength(20)
  })
})

describe('calcTermPlusMF', () => {
  it('invests what is left after the term premium and taxes gains above ₹1.25L', () => {
    const t = calcTermPlusMF(100000, 30, 20, 10000000, 12, 10000)
    expect(t.investAmount).toBe(90000)
    const gross = 90000 * ((1.12 ** 20 - 1) / 0.12) * 1.12
    expect(t.grossMaturity).toBe(Math.round(gross))
    expect(t.tax).toBe(Math.round((gross - 90000 * 20 - 125000) * 0.125))
    expect(t.maturity).toBe(Math.round(gross - (gross - 90000 * 20 - 125000) * 0.125))
  })
})
