import { describe, it, expect } from 'vitest'
import { computeUS, computeIN } from './buyVsRent.js'
import { calcEMI } from './loan.js'

const US = { price: 500000, down: 20, rate: 6.8, term: 30, propTax: 1.2, hoa: 0, insurance: 150, maintenance: 1, rent: 2800, rentGrowth: 3, appreciation: 4, investReturn: 8, years: 10 }
const IN = { price: 8000000, down: 20, rate: 8.75, term: 20, stampDuty: 6, registration: 1, maintenance: 5000, sec24: true, taxBracket: 30, rent: 25000, rentGrowth: 5, appreciation: 7, investReturn: 12, years: 10 }

describe('computeUS', () => {
  const res = computeUS(US)

  it('monthly cost of owning = mortgage + tax + maintenance + HOA + insurance', () => {
    const emi = calcEMI(400000, 6.8, 360)
    expect(res.totalBuyMo).toBeCloseTo(emi + 500 + 416.6667 + 0 + 150, 3)
    expect(res.down).toBe(100000)
  })

  it('buy-side net worth = appreciated home − remaining loan', () => {
    const r = 6.8 / 1200, emi = calcEMI(400000, 6.8, 360)
    let bal = 400000
    for (let m = 0; m < 12; m++) bal = bal * (1 + r) - emi
    expect(res.data[0].buyNW).toBe(Math.round(500000 * 1.04 - bal))
  })

  it('returns one row per year', () => {
    expect(res.data).toHaveLength(10)
  })

  it('home equity equals the home value once the mortgage is paid off', () => {
    const d = computeUS({ ...US, term: 10, years: 10 }).data
    expect(d[9].buyNW).toBe(Math.round(500000 * 1.04 ** 10))
  })
})

describe('computeIN', () => {
  it('counts stamp duty and registration as upfront cash for the renter to invest', () => {
    const res = computeIN(IN)
    expect(res.down).toBe(1600000 + 560000)
  })

  it('Section 24 deduction is capped at ₹2L of interest a year', () => {
    const withSec24    = computeIN(IN).totalBuyMo
    const withoutSec24 = computeIN({ ...IN, sec24: false }).totalBuyMo
    // ₹64L × 8.75% interest > ₹2L cap → 2L × 30% / 12
    expect(withoutSec24 - withSec24).toBeCloseTo(5000, 6)
  })
})
