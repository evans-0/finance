// FD: interest taxed as income every year (TDS at slab rate)
export function calcFD(principal, rate, years, taxRate, inflation) {
  const netRate    = rate * (1 - taxRate / 100)       // post-tax annual rate
  const postTax    = principal * Math.pow(1 + netRate / 100, years)
  const realReturn = ((1 + netRate / 100) / (1 + inflation / 100) - 1) * 100
  const realValue  = principal * Math.pow(1 + realReturn / 100, years)
  return { postTax, realValue, netRate, gain: postTax - principal }
}

// Mutual Fund: LTCG 10% on gains above 1L (equity), no annual tax drag
export function calcMF(principal, cagr, years, inflation) {
  const maturity   = principal * Math.pow(1 + cagr / 100, years)
  const gain       = maturity - principal
  const taxableGain = Math.max(0, gain - 125000)      // LTCG exemption ₹1.25L (Budget 2024)
  const tax        = taxableGain * 0.125                 // 12.5% LTCG rate
  const postTax    = maturity - tax
  const realReturn = ((1 + cagr / 100) / (1 + inflation / 100) - 1) * 100
  const realValue  = principal * Math.pow(1 + realReturn / 100, years)
  return { postTax, realValue, maturity, gain, tax, realReturn }
}
