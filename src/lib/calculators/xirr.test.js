import { describe, it, expect } from 'vitest'
import { calcXIRR, xnpv, sipSchedule } from './xirr.js'

describe('calcXIRR', () => {
  it("matches Excel's documented XIRR example (37.34%)", () => {
    const flows = [
      { date: '2008-01-01', amount: -10000 },
      { date: '2008-03-01', amount: 2750 },
      { date: '2008-10-30', amount: 4250 },
      { date: '2009-02-15', amount: 3250 },
      { date: '2009-04-01', amount: 2750 },
    ]
    expect(calcXIRR(flows).xirr).toBeCloseTo(37.3362535, 5)
  })

  it('equals CAGR for a single investment and a single redemption', () => {
    // 730 days = exactly 2 years → √1.21 − 1 = 10%
    const r = calcXIRR([{ date: '2022-01-01', amount: -100000 }, { date: '2024-01-01', amount: 121000 }])
    expect(r.xirr).toBeCloseTo(10, 8)
    expect(r.years).toBeCloseTo(2, 10)
  })

  it('reports losses as a negative rate', () => {
    const r = calcXIRR([{ date: '2023-01-01', amount: -100000 }, { date: '2024-01-01', amount: 50000 }])
    expect(r.xirr).toBeCloseTo(-50, 8)
  })

  it('recovers the rate used to build a monthly SIP history', () => {
    const rate = 0.14
    const sip = sipSchedule(5000, '2021-04-05', 36).map(f => ({ ...f, amount: -f.amount }))
    const end = '2024-06-30'
    const yrs = d => (Date.parse(end) - Date.parse(d)) / 86400000 / 365
    const value = sip.reduce((s, f) => s - f.amount * (1 + rate) ** yrs(f.date), 0)
    expect(calcXIRR([...sip, { date: end, amount: value }]).xirr).toBeCloseTo(14, 6)
  })

  it('handles withdrawals in the middle', () => {
    const flows = [
      { date: '2020-01-01', amount: -100000 },
      { date: '2021-01-01', amount: 20000 },
      { date: '2023-01-01', amount: 120000 },
    ]
    const r = calcXIRR(flows)
    expect(xnpv(r.xirr / 100, flows)).toBeCloseTo(0, 4)
    expect(r.totalInvested).toBe(100000)
    expect(r.totalReceived).toBe(140000)
    expect(r.gain).toBe(40000)
    expect(r.absoluteReturn).toBeCloseTo(40, 10)
  })

  it('finds very high and very low rates', () => {
    expect(calcXIRR([{ date: '2024-01-01', amount: -1000 }, { date: '2024-02-01', amount: 2000 }]).xirr).toBeGreaterThan(1000)
    expect(calcXIRR([{ date: '2020-01-01', amount: -1000 }, { date: '2024-01-01', amount: 1 }]).xirr).toBeCloseTo(-82.2, 1)
  })

  it('explains what is missing instead of returning a rate', () => {
    expect(calcXIRR([{ date: '2024-01-01', amount: -1000 }]).error).toMatch(/current value/)
    expect(calcXIRR([{ date: '2024-01-01', amount: 1000 }]).error).toMatch(/investment/)
    expect(calcXIRR([{ date: '', amount: -1000 }, { date: '2024-01-01', amount: 1100 }]).error).toMatch(/date/)
    expect(calcXIRR([{ date: '2024-01-01', amount: -1000 }, { date: '2024-01-01', amount: 1100 }]).error).toMatch(/one day/)
  })

  it('ignores zero-amount rows', () => {
    const r = calcXIRR([
      { date: '2022-01-01', amount: -100000 },
      { date: '', amount: 0 },
      { date: '2024-01-01', amount: 121000 },
    ])
    expect(r.xirr).toBeCloseTo(10, 8)
  })
})

describe('sipSchedule', () => {
  it('creates one instalment per month', () => {
    const s = sipSchedule(5000, '2024-01-10', 3)
    expect(s).toEqual([
      { date: '2024-01-10', amount: 5000 },
      { date: '2024-02-10', amount: 5000 },
      { date: '2024-03-10', amount: 5000 },
    ])
  })

  it('moves a 31st start date to the last day of shorter months', () => {
    expect(sipSchedule(1000, '2024-01-31', 3).map(f => f.date)).toEqual(['2024-01-31', '2024-02-29', '2024-03-31'])
  })
})
