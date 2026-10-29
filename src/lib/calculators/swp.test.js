import { describe, it, expect } from 'vitest'
import { simulateSWP } from './swp.js'

const base = { corpus: 10000000, monthly: 50000, returnRate: 10, inflation: 6, inflAdj: false }

describe('simulateSWP', () => {
  it('a withdrawal equal to monthly interest never depletes', () => {
    const r = simulateSWP({ ...base, monthly: 10000000 * 0.10 / 12 })
    expect(r.lasts).toBe(true)
    expect(r.at30).toBe(10000000)
    expect(r.sustainableMonthly).toBe(83333)
  })

  it('at 0% return the corpus lasts exactly corpus / withdrawal months', () => {
    // ₹1Cr ÷ ₹1L = 100 months → depletes in year 9
    const r = simulateSWP({ ...base, monthly: 100000, returnRate: 0 })
    expect(r.depletionYear).toBe(9)
    expect(r.lasts).toBe(false)
  })

  it('matches the closed-form balance after 10 years (no inflation)', () => {
    const i = 0.10 / 12, n = 120
    const expected = 10000000 * (1 + i) ** n - 50000 * ((1 + i) ** n - 1) / i
    expect(simulateSWP(base).at10).toBe(Math.round(expected))
  })

  it('inflation-adjusted withdrawals deplete sooner', () => {
    const flat = simulateSWP({ ...base, monthly: 80000 })
    const adj  = simulateSWP({ ...base, monthly: 80000, inflAdj: true })
    expect(adj.depletionYear).toBeLessThan(flat.depletionYear ?? Infinity)
  })

  it('reports the annual withdrawal rate', () => {
    expect(simulateSWP(base).annualWithdrawalRate).toBe('6.0')
  })
})
