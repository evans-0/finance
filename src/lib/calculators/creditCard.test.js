import { describe, it, expect } from 'vitest'
import { calcPayoff, minimumPayment, effectiveAnnualRate } from './creditCard.js'

describe('effectiveAnnualRate', () => {
  it('compounds the monthly rate', () => {
    expect(effectiveAnnualRate(2)).toBeCloseTo(26.8242, 4)
  })
})

describe('minimumPayment', () => {
  it('is 5% of the balance with a ₹500 floor', () => {
    expect(minimumPayment(50000)).toBe(2500)
    expect(minimumPayment(5000)).toBe(500)
  })
})

describe('calcPayoff', () => {
  it('pays off with no interest in balance / payment months', () => {
    const r = calcPayoff(12000, 0, 1000)
    expect(r.months).toBe(12)
    expect(r.totalInterest).toBe(0)
    expect(r.neverPaysOff).toBe(false)
  })

  it('agrees with the closed-form number of payments', () => {
    // n = −ln(1 − rB/P) / ln(1 + r)
    const B = 50000, r = 0.02, P = 3000
    const expected = Math.ceil(-Math.log(1 - r * B / P) / Math.log(1 + r))
    expect(calcPayoff(B, 2, P).months).toBe(expected)
  })

  it('total interest = total paid − balance', () => {
    const B = 50000, P = 3000
    const res = calcPayoff(B, 2, P)
    const lastPayment = B + res.totalInterest - P * (res.months - 1)
    expect(lastPayment).toBeGreaterThan(0)
    expect(lastPayment).toBeLessThanOrEqual(P + 1e-6)
  })

  it('flags a payment that only covers interest as never paying off', () => {
    const r = calcPayoff(50000, 2, 1000)
    expect(r.neverPaysOff).toBe(true)
    expect(r.months).toBe(600)
  })
})
