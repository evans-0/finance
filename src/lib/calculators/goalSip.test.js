import { describe, it, expect } from 'vitest'
import { calcGoalSIP } from './goalSip.js'
import { calcSIP } from './sip.js'

const base = { goalToday: 2000000, years: 7, returnRate: 12, inflation: 6, lumpsum: 0 }

describe('calcGoalSIP', () => {
  it('inflates the goal', () => {
    expect(calcGoalSIP(base).inflatedGoal).toBeCloseTo(2000000 * 1.06 ** 7, 6)
  })

  it('is the exact inverse of the SIP calculator', () => {
    const { sipNeeded, inflatedGoal } = calcGoalSIP(base)
    expect(calcSIP(sipNeeded, 12, 7, 0, false, 0).futureValue).toBeCloseTo(inflatedGoal, 4)
  })

  it('final chart year reaches the goal', () => {
    const { chartData, inflatedGoal } = calcGoalSIP(base)
    expect(chartData).toHaveLength(7)
    expect(chartData[6].corpus).toBe(Math.round(inflatedGoal))
  })

  it('existing savings reduce the SIP needed', () => {
    expect(calcGoalSIP({ ...base, lumpsum: 500000 }).sipNeeded).toBeLessThan(calcGoalSIP(base).sipNeeded)
  })

  it('needs no SIP when savings already cover the goal', () => {
    const r = calcGoalSIP({ ...base, lumpsum: 5000000 })
    expect(r.alreadyCovered).toBe(true)
    expect(r.sipNeeded).toBe(0)
  })
})
