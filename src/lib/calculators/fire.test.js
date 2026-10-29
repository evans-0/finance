import { describe, it, expect } from 'vitest'
import { computeFIRE } from './fire.js'

const VARIANTS = [
  { key: 'lean',    mult: 20 },
  { key: 'regular', mult: 25 },
  { key: 'fat',     mult: 33 },
]
const IN = { currentAge: 28, retireAge: 45, currentSavings: 1000000, monthlyIncome: 100000, monthlyExpenses: 50000, retireExpenses: 40000, returnRate: 12, retireReturn: 8, inflation: 6, withdrawYears: 35 }

describe('computeFIRE', () => {
  const r = computeFIRE(IN, 'regular', VARIANTS)

  it('FIRE number = 25× inflation-adjusted annual expenses', () => {
    const annual = 40000 * 12 * 1.06 ** 17
    expect(r.mainFireNumber).toBeCloseTo(annual * 25, 4)
    expect(r.fireNumbers.map(v => v.fireNumber)).toEqual([annual * 20, annual * 25, annual * 33].map(x => expect.closeTo(x, 4)))
  })

  it('savings rate is savings ÷ income', () => {
    expect(r.monthlySavings).toBe(50000)
    expect(r.savingsRate).toBe(50)
  })

  it('the monthly saving it asks for actually reaches the target', () => {
    const i = 0.12 / 12, n = 17 * 12
    const fv = 1000000 * 1.12 ** 17 + r.monthlySavingsNeeded * ((1 + i) ** n - 1) / i
    expect(fv).toBeCloseTo(r.mainFireNumber, 2)
  })

  it('a higher target takes at least as long to reach', () => {
    const lean = computeFIRE(IN, 'lean', VARIANTS)
    const fat  = computeFIRE(IN, 'fat', VARIANTS)
    expect(lean.fireAge).toBeLessThanOrEqual(r.fireAge ?? Infinity)
    expect(r.fireAge ?? Infinity).toBeLessThanOrEqual(fat.fireAge ?? Infinity)
  })

  it('is already funded when savings exceed the target', () => {
    const rich = computeFIRE({ ...IN, currentSavings: 1e9 }, 'regular', VARIANTS)
    expect(rich.alreadyFunded).toBe(true)
    expect(rich.monthlySavingsNeeded).toBe(0)
    expect(rich.progress).toBe(100)
    expect(rich.coastFireAge).toBe(28)
  })

  it('corpus never goes negative in the withdrawal phase', () => {
    const poor = computeFIRE({ ...IN, currentSavings: 0, monthlyIncome: 50000 }, 'regular', VARIANTS)
    for (const pt of poor.data) expect(pt.corpus).toBeGreaterThanOrEqual(0)
  })
})
