import { describe, it, expect } from 'vitest'
import { compoundAmount } from './compound.js'

describe('compoundAmount', () => {
  it('compounds annually', () => {
    expect(compoundAmount(100000, 10, 10, 1)).toBeCloseTo(259374.25, 2)
  })

  it('compounds quarterly', () => {
    expect(compoundAmount(100000, 10, 10, 4)).toBeCloseTo(268506.38, 2)
  })

  it('more frequent compounding yields more, bounded by continuous compounding', () => {
    const [a, s, q, m] = [1, 2, 4, 12].map(n => compoundAmount(100000, 10, 10, n))
    expect(a).toBeLessThan(s)
    expect(s).toBeLessThan(q)
    expect(q).toBeLessThan(m)
    expect(m).toBeLessThan(100000 * Math.exp(1))
  })

  it('returns the principal at 0% or 0 years', () => {
    expect(compoundAmount(5000, 0, 10, 12)).toBe(5000)
    expect(compoundAmount(5000, 10, 0, 12)).toBe(5000)
  })
})
