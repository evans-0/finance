// Mortality charges per 1000 sum assured (approximate industry rates)
export function getMortalityRate(age) {
  if (age < 25) return 0.70
  if (age < 30) return 0.90
  if (age < 35) return 1.10
  if (age < 40) return 1.50
  if (age < 45) return 2.20
  if (age < 50) return 3.20
  return 5.00
}

export function calcULIP(premium, age, years, coverage, cagr, allocCharge, fmc) {
  const r = cagr / 100
  let fund = 0
  let totalCharges = 0
  const history = []

  for (let y = 1; y <= years; y++) {
    const currentAge     = age + y - 1
    const investable     = premium * (1 - allocCharge / 100)           // after allocation charge
    const mortalityCharge = (coverage / 1000) * getMortalityRate(currentAge) // mortality per year
    const invested       = Math.max(0, investable - mortalityCharge)
    const fmcCharge      = fund * (fmc / 100)                           // fund mgmt on corpus

    fund = (fund + invested) * (1 + r) - fmcCharge
    totalCharges += (premium - investable) + mortalityCharge + fmcCharge
    history.push({ year: 'Yr ' + y, ulip: Math.round(fund) })
  }

  // LTCG 10% on gains above 1L (ULIPs are tax-free under 10(10D) if premium < 10% of SA)
  // Simplified: ULIP maturity is tax-free
  return { maturity: Math.round(fund), totalCharges: Math.round(totalCharges), history }
}

export function calcTermPlusMF(premium, age, years, coverage, mfCagr, termPremium) {
  const investAmount = premium - termPremium                // leftover after paying term
  const r = mfCagr / 100
  let fund = 0
  const history = []

  for (let y = 1; y <= years; y++) {
    fund = (fund + investAmount) * (1 + r)
    history.push({ year: 'Yr ' + y, termMF: Math.round(fund) })
  }

  // LTCG 10% on gains above 1L
  const gain       = fund - (investAmount * years)
  const taxable    = Math.max(0, gain - 125000)  // LTCG exemption ₹1.25L (Budget 2024)
  const tax        = taxable * 0.125              // 12.5% LTCG rate
  const postTax    = fund - tax

  return { maturity: Math.round(postTax), grossMaturity: Math.round(fund), tax: Math.round(tax), termPremium, investAmount, history }
}

// Approximate annual term premium for 1Cr coverage
export function estimateTermPremium(age) {
  if (age < 25) return 7000
  if (age < 30) return 8500
  if (age < 35) return 10000
  if (age < 40) return 14000
  if (age < 45) return 22000
  return 35000
}
