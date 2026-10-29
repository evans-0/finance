import { describe, it, expect } from 'vitest'
import { mulberry32, generateZScores, runMonteCarlo, NUM_SIMS } from './monteCarlo.js'

const IN = { corpus: 30000000, monthlyW: 100000, expectedReturn: 10, volatility: 14, inflation: 6, inflAdj: true, years: 30 }

describe('random numbers', () => {
  it('mulberry32 is deterministic and in [0, 1)', () => {
    const a = mulberry32(42), b = mulberry32(42)
    for (let i = 0; i < 1000; i++) {
      const x = a()
      expect(x).toBe(b())
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('z-scores are roughly standard normal', () => {
    const z = generateZScores(1000, 30).flat()
    const mean = z.reduce((s, v) => s + v, 0) / z.length
    const sd = Math.sqrt(z.reduce((s, v) => s + (v - mean) ** 2, 0) / z.length)
    expect(Math.abs(mean)).toBeLessThan(0.03)
    expect(Math.abs(sd - 1)).toBeLessThan(0.03)
  })
})

describe('runMonteCarlo', () => {
  it('is deterministic across runs', () => {
    expect(runMonteCarlo(IN)).toEqual(runMonteCarlo(IN))
  })

  it('with zero volatility matches the deterministic path', () => {
    const p = { ...IN, volatility: 0, inflAdj: false }
    const r = runMonteCarlo(p)
    let bal = 30000000
    for (let y = 0; y < 30; y++) bal = bal * 1.10 - 1200000
    expect(r.medianFinal).toBe(Math.round(bal))
    expect(r.survivalRate).toBe(100)
  })

  it('percentile bands are ordered and stack up to P90', () => {
    for (const row of runMonteCarlo(IN).chartData) {
      expect(row.p10).toBeLessThanOrEqual(row.p25)
      expect(row.p25).toBeLessThanOrEqual(row.p50)
      expect(row.p50).toBeLessThanOrEqual(row.p75)
      expect(row.p75).toBeLessThanOrEqual(row.p90)
      expect(row.base + row.band1 + row.band2 + row.band3 + row.band4).toBe(Math.max(0, row.p90))
    }
  })

  it('higher withdrawal rates never survive more often', () => {
    const { sensitivity } = runMonteCarlo(IN)
    for (let i = 1; i < sensitivity.length; i++) {
      expect(sensitivity[i].survival).toBeLessThanOrEqual(sensitivity[i - 1].survival)
    }
  })

  it('a withdrawal larger than the corpus fails every simulation', () => {
    const r = runMonteCarlo({ ...IN, monthlyW: 30000000 })
    expect(r.survivalRate).toBe(0)
    expect(r.medianFinal).toBe(0)
  })

  it('reports the current withdrawal rate and runs NUM_SIMS trials', () => {
    const r = runMonteCarlo(IN)
    expect(r.currentRate).toBeCloseTo(4, 10)
    expect((r.survivalRate / 100) * NUM_SIMS % 1).toBe(0)
  })

  it('handles an empty corpus', () => {
    expect(runMonteCarlo({ ...IN, corpus: 0 }).survivalRate).toBe(0)
  })
})
