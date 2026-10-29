import { describe, it, expect } from 'vitest'
import { calcFD, calcMF } from './fdVsMf.js'

describe('calcFD', () => {
  it('compounds at the post-tax rate', () => {
    // 7% at the 30% slab → 4.9% net
    const fd = calcFD(500000, 7, 10, 30, 6)
    expect(fd.netRate).toBeCloseTo(4.9, 10)
    expect(fd.postTax).toBeCloseTo(806723.83, 1)
    expect(fd.gain).toBeCloseTo(fd.postTax - 500000, 6)
  })

  it('loses real value when the post-tax rate is below inflation', () => {
    expect(calcFD(500000, 7, 10, 30, 6).realValue).toBeLessThan(500000)
  })
})

describe('calcMF', () => {
  it('applies 12.5% LTCG above the ₹1.25L exemption', () => {
    const mf = calcMF(500000, 12, 10, 6)
    expect(mf.maturity).toBeCloseTo(1552924.10, 1)
    expect(mf.tax).toBeCloseTo((mf.gain - 125000) * 0.125, 6)
    expect(mf.postTax).toBeCloseTo(1436933.59, 1)
  })

  it('charges no tax when gains are within the exemption', () => {
    const mf = calcMF(100000, 10, 1, 6)
    expect(mf.gain).toBeCloseTo(10000, 6)
    expect(mf.tax).toBe(0)
    expect(mf.postTax).toBeCloseTo(110000, 6)
  })

  it('beats a same-rate FD for a high-slab investor', () => {
    expect(calcMF(500000, 7, 10, 6).postTax).toBeGreaterThan(calcFD(500000, 7, 10, 30, 6).postTax)
  })
})
