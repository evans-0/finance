import { describe, it, expect } from 'vitest'
import { calcInflation } from './inflation.js'

const base = { amount: 100000, inflation: 6, returns: 6.5, years: 20, goalCost: 500000, goalYears: 10 }

describe('calcInflation', () => {
  const r = calcInflation(base)

  it('inflates cost and deflates purchasing power symmetrically', () => {
    expect(r.futureValue).toBeCloseTo(100000 * 1.06 ** 20, 6)
    expect(r.purchasingPower * r.futureValue).toBeCloseTo(100000 ** 2, 0)
  })

  it('uses the Fisher equation for real return, not a simple difference', () => {
    expect(r.realReturn).toBeCloseTo((1.065 / 1.06 - 1) * 100, 10)
    expect(r.realReturn).toBeLessThan(0.5)
  })

  it('inflates the goal cost', () => {
    expect(r.futureGoalCost).toBeCloseTo(500000 * 1.06 ** 10, 6)
  })

  it('monthly saving grows to the future goal cost at the inflation rate', () => {
    const i = 0.06 / 12
    const fv = r.monthlySavingsNeeded * ((1 + i) ** 120 - 1) / i
    expect(fv).toBeCloseTo(r.futureGoalCost, 4)
  })
})
