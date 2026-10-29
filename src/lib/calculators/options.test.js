import { describe, it, expect } from 'vitest'
import { optionPnL, optionSummary, payoffCurve } from './options.js'

describe('optionPnL', () => {
  it('long call: loses the premium below strike, gains above', () => {
    expect(optionPnL('call', 18000, 150, 17500, 50)).toBe(-7500)
    expect(optionPnL('call', 18000, 150, 18200, 50)).toBe(2500)
  })

  it('long put: gains below strike, loses the premium above', () => {
    expect(optionPnL('put', 18000, 150, 17500, 50)).toBe(17500)
    expect(optionPnL('put', 18000, 150, 18500, 50)).toBe(-7500)
  })

  it('is zero at breakeven', () => {
    for (const type of ['call', 'put']) {
      const { breakeven } = optionSummary(type, 18000, 150, 50)
      expect(optionPnL(type, 18000, 150, breakeven, 50)).toBe(0)
    }
  })
})

describe('optionSummary', () => {
  it('call: unlimited profit, loss capped at premium', () => {
    expect(optionSummary('call', 18000, 150, 50)).toEqual({ breakeven: 18150, maxLoss: 7500, maxProfit: Infinity })
  })

  it('put: profit capped at strike minus premium', () => {
    expect(optionSummary('put', 18000, 150, 50)).toEqual({ breakeven: 17850, maxLoss: 7500, maxProfit: 892500 })
  })
})

describe('payoffCurve', () => {
  it('spans ±15% of the strike', () => {
    const pts = payoffCurve('call', 18000, 150, 50)
    expect(pts[0].price).toBe(15300)
    expect(pts[pts.length - 1].price).toBeLessThanOrEqual(20700)
    expect(pts.length).toBe(31)
  })

  it('never falls below the max loss', () => {
    for (const type of ['call', 'put']) {
      for (const p of payoffCurve(type, 18000, 150, 50)) expect(p.pnl).toBeGreaterThanOrEqual(-7500)
    }
  })
})
