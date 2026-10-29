import { describe, it, expect } from 'vitest'
import { calcSIP, calcLumpsumFV } from './sip.js'

describe('calcSIP', () => {
  it('matches the annuity-due future value for a plain SIP', () => {
    // ₹5,000/mo at 12% for 10 years, invested at the start of each month
    const { futureValue, invested } = calcSIP(5000, 12, 10, 0, false, 0)
    expect(futureValue).toBeCloseTo(1161695.38, 1)
    expect(invested).toBe(600000)
  })

  it('deducts the expense ratio from the return', () => {
    const { futureValue } = calcSIP(5000, 12, 10, 0, false, 0.3)
    expect(futureValue).toBeCloseTo(1141165.30, 1)
  })

  it('returns plain contributions at a 0% net return', () => {
    expect(calcSIP(5000, 1, 10, 0, false, 1)).toEqual({ futureValue: 600000, invested: 600000 })
  })

  it('never lets the expense ratio push the return negative', () => {
    expect(calcSIP(5000, 0.5, 5, 0, false, 2).futureValue).toBe(300000)
  })

  it('raises the contribution once a year with step-up', () => {
    // 10% step-up over 3 years: 12×1000 + 12×1100 + 12×1210
    const { invested } = calcSIP(1000, 12, 3, 10, true, 0)
    expect(invested).toBeCloseTo(39720, 6)
  })

  it('step-up grows faster than a flat SIP over the long run', () => {
    const flat = calcSIP(5000, 12, 20, 10, false, 0)
    const step = calcSIP(5000, 12, 20, 10, true, 0)
    expect(step.invested).toBeGreaterThan(flat.invested)
    expect(step.futureValue).toBeGreaterThan(flat.futureValue)
  })
})

describe('calcLumpsumFV', () => {
  it('compounds annually at the net-of-expense rate', () => {
    expect(calcLumpsumFV(100000, 12.3, 10, 0.3)).toBeCloseTo(100000 * 1.12 ** 10, 6)
  })

  it('is zero when there is no lumpsum', () => {
    expect(calcLumpsumFV(0, 12, 10, 0)).toBe(0)
  })
})
