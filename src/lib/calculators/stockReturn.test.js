import { describe, it, expect } from 'vitest'
import { calcStockReturn } from './stockReturn.js'

const base = { buyPrice: 1000, sellPrice: 1250, qty: 100, brokerage: 0, buyDate: '2023-01-01', sellDate: '2024-01-01' }

describe('calcStockReturn', () => {
  it('computes P&L and return without brokerage', () => {
    const r = calcStockReturn(base)
    expect(r.investment).toBe(100000)
    expect(r.proceeds).toBe(125000)
    expect(r.pnl).toBe(25000)
    expect(r.returnPct).toBeCloseTo(25, 10)
  })

  it('charges brokerage on both legs', () => {
    const r = calcStockReturn({ ...base, brokerage: 0.1 })
    expect(r.investment).toBeCloseTo(100100, 6)
    expect(r.proceeds).toBeCloseTo(124875, 6)
    expect(r.pnl).toBeCloseTo(24775, 6)
  })

  it('CAGR equals the total return over a 365-day hold', () => {
    const r = calcStockReturn({ ...base, sellDate: '2024-01-01', buyDate: '2023-01-01' })
    expect(r.days).toBe(365)
    expect(r.cagr).toBeCloseTo(25, 6)
  })

  it('annualises a two-year hold', () => {
    const r = calcStockReturn({ ...base, sellPrice: 1210, buyDate: '2022-01-01', sellDate: '2024-01-01' })
    // 730 days = 2.0 years exactly → √1.21 − 1 = 10%
    expect(r.cagr).toBeCloseTo(10, 6)
  })

  it('reports a loss as negative', () => {
    const r = calcStockReturn({ ...base, sellPrice: 800 })
    expect(r.pnl).toBe(-20000)
    expect(r.cagr).toBeLessThan(0)
  })
})
