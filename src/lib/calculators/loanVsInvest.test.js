import { describe, it, expect } from 'vitest'
import { compareLoanVsInvest } from './loanVsInvest.js'
import { calcEMI } from './loan.js'

const lump    = { mode: 'lump',    balance: 3000000, loanRate: 8.5, tenure: 240, extra: 500000, investReturn: 12 }
const monthly = { mode: 'monthly', balance: 3000000, loanRate: 8.5, tenure: 240, extra: 10000,  investReturn: 12 }

describe('compareLoanVsInvest', () => {
  it('uses the standard EMI and total interest', () => {
    const r = compareLoanVsInvest(lump)
    const emi = calcEMI(3000000, 8.5, 240)
    expect(r.emi).toBeCloseTo(emi, 6)
    expect(r.baseTotalInterest).toBeCloseTo(emi * 240 - 3000000, 2)
  })

  it('lump-sum prepayment with the same EMI pays off sooner', () => {
    // Remaining ₹25L at the original EMI: n = −ln(1 − rP/EMI) / ln(1 + r)
    const r = compareLoanVsInvest(lump)
    const i = 8.5 / 1200, P = 2500000
    const n = Math.ceil(-Math.log(1 - i * P / r.emi) / Math.log(1 + i))
    expect(r.prepayMonths).toBe(n)
    expect(r.monthsSaved).toBe(240 - n)
    expect(r.interestSaved).toBeGreaterThan(0)
  })

  it('monthly prepayment shortens the loan and saves interest', () => {
    const r = compareLoanVsInvest(monthly)
    expect(r.prepayMonths).toBeLessThan(240)
    expect(r.interestSaved).toBeGreaterThan(0)
  })

  it('investing a lump sum compounds it monthly for the full tenure', () => {
    const r = compareLoanVsInvest(lump)
    expect(r.investCorpus).toBeCloseTo(500000 * (1 + 0.01) ** 240, 0)
  })

  it('investing at a return above the loan rate beats prepaying', () => {
    // Regression: interest saved used to be added on top of prepayCorpus, so 10–11% returns
    // against an 8.5% loan were wrongly reported as PREPAY
    for (const investReturn of [10, 11, 12]) {
      expect(compareLoanVsInvest({ ...lump, investReturn }).investWins).toBe(true)
      expect(compareLoanVsInvest({ ...monthly, investReturn }).investWins).toBe(true)
    }
  })

  it('investing at a return below the loan rate loses to prepaying', () => {
    expect(compareLoanVsInvest({ ...lump, investReturn: 6 }).investWins).toBe(false)
    expect(compareLoanVsInvest({ ...monthly, investReturn: 6 }).investWins).toBe(false)
  })

  it('at equal rates the two paths come out roughly level', () => {
    const r = compareLoanVsInvest({ ...lump, investReturn: 8.5 })
    expect(Math.abs(r.investCorpus - r.prepayCorpus) / r.investCorpus).toBeLessThan(0.02)
  })

  it('difference is the gap between the two final corpora', () => {
    const r = compareLoanVsInvest(lump)
    expect(r.difference).toBeCloseTo(Math.abs(r.investCorpus - r.prepayCorpus), 6)
  })

  it('a prepayment that clears the loan saves all the interest', () => {
    const r = compareLoanVsInvest({ ...lump, extra: 3000000 })
    expect(r.prepayMonths).toBe(0)
    expect(r.interestSaved).toBeCloseTo(r.baseTotalInterest, 6)
  })
})
