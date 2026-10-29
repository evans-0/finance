import { describe, it, expect } from 'vitest'
import { calcEMI, amortizationByYear } from './loan.js'

describe('calcEMI', () => {
  it('matches the standard reducing-balance EMI', () => {
    // ₹10L at 8.5% for 20 years → ₹8,678.23
    expect(calcEMI(1000000, 8.5, 240)).toBeCloseTo(8678.23, 2)
  })

  it('splits the principal evenly at 0% interest', () => {
    expect(calcEMI(120000, 0, 12)).toBe(10000)
  })

  it('pays off the loan exactly over its term', () => {
    const P = 2500000, rate = 9, n = 180
    const emi = calcEMI(P, rate, n)
    let bal = P
    for (let m = 0; m < n; m++) bal = bal * (1 + rate / 1200) - emi
    expect(Math.abs(bal)).toBeLessThan(1e-4)
  })
})

describe('amortizationByYear', () => {
  const rows = amortizationByYear(1000000, 8.5, 20)

  it('has one row per year', () => {
    expect(rows).toHaveLength(20)
  })

  it('repays exactly the principal in total', () => {
    const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0)
    expect(totalPrincipal).toBeCloseTo(1000000, 2)
  })

  it('total paid equals EMI × months', () => {
    const totalPaid = rows.reduce((s, r) => s + r.principal + r.interest, 0)
    expect(totalPaid).toBeCloseTo(calcEMI(1000000, 8.5, 240) * 240, 2)
  })

  it('front-loads interest and back-loads principal', () => {
    expect(rows[0].interest).toBeGreaterThan(rows[0].principal)
    expect(rows[19].principal).toBeGreaterThan(rows[19].interest)
    for (let i = 1; i < rows.length; i++) expect(rows[i].interest).toBeLessThan(rows[i - 1].interest)
  })

  it('caps the chart at 30 years', () => {
    expect(amortizationByYear(1000000, 8.5, 35)).toHaveLength(30)
  })
})
