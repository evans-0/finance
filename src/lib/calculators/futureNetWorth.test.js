import { describe, it, expect } from 'vitest'
import { computeFutureNetWorth } from './futureNetWorth.js'
import { calcEMI } from './loan.js'

const g = { monthlySavings: 0, savingsReturn: 12, years: 10 }

describe('computeFutureNetWorth', () => {
  it('grows each asset at its own rate', () => {
    const assets = [{ name: 'A', value: 100000, returnRate: 10 }, { name: 'B', value: 50000, returnRate: 0 }]
    const r = computeFutureNetWorth(assets, [], g, 'in')
    expect(r.futureNW).toBe(Math.round(100000 * 1.1 ** 10 + 50000))
    expect(r.assetBreakdown[0]).toEqual({ name: 'A', value: Math.round(100000 * 1.1 ** 10) })
  })

  it('accumulates monthly savings as an ordinary annuity', () => {
    const r = computeFutureNetWorth([], [], { ...g, monthlySavings: 10000 }, 'in')
    const i = 0.01, n = 120
    expect(r.futureNW).toBe(Math.round(10000 * ((1 + i) ** n - 1) / i))
  })

  it('a liability paid at its EMI reaches zero at the end of its term', () => {
    const emi = calcEMI(500000, 9, 60)
    const liab = [{ name: 'Car', balance: 500000, emi: emi + 1e-6, rate: 9 }]
    const r = computeFutureNetWorth([], liab, { ...g, years: 5 }, 'in')
    expect(r.chartData[5].liabilities).toBe(0)
    expect(r.chartData[0].liabilities).toBe(500000)
  })

  it('amortises the loan balance month by month', () => {
    const liab = [{ name: 'Home', balance: 3000000, emi: 25000, rate: 8.5 }]
    const r = computeFutureNetWorth([], liab, { ...g, years: 1 }, 'in')
    const i = 8.5 / 1200
    const expected = 3000000 * (1 + i) ** 12 - 25000 * ((1 + i) ** 12 - 1) / i
    expect(r.chartData[1].liabilities).toBe(Math.round(expected))
  })

  it('net worth = assets − liabilities each year', () => {
    const assets = [{ name: 'A', value: 1000000, returnRate: 8 }]
    const liab = [{ name: 'Home', balance: 3000000, emi: 25000, rate: 8.5 }]
    const r = computeFutureNetWorth(assets, liab, { ...g, monthlySavings: 20000 }, 'in')
    for (const row of r.chartData) expect(row.netWorth).toBeCloseTo(row.assets - row.liabilities, -1)
    expect(r.currentNW).toBe(-2000000)
    expect(r.cagr).toBe(0) // undefined for a negative starting net worth
  })

  it('net worth CAGR matches the single-asset rate', () => {
    const r = computeFutureNetWorth([{ name: 'A', value: 1000000, returnRate: 7 }], [], g, 'in')
    expect(r.cagr).toBeCloseTo(7, 4)
  })
})
