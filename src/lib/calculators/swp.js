// Month-by-month withdrawal simulation, up to 50 years
export function simulateSWP({ corpus, monthly, returnRate, inflation, inflAdj }) {
  const monthlyRate = returnRate / 100 / 12
  const inflMonthly = inflation / 100 / 12
  let bal = corpus
  let withdrawal = monthly
  let totalWithdrawn = 0
  let depletionYear = null
  const data = [{ year: 0, corpus: bal }]

  for (let month = 1; month <= 600; month++) {
    // grow corpus
    bal = bal * (1 + monthlyRate)
    // withdraw
    bal -= withdrawal
    totalWithdrawn += withdrawal
    // increase withdrawal for inflation if enabled
    if (inflAdj) withdrawal *= (1 + inflMonthly)

    if (bal <= 0 && depletionYear === null) {
      depletionYear = Math.ceil(month / 12)
      bal = 0
    }

    if (month % 12 === 0) {
      const year = month / 12
      data.push({ year, corpus: Math.max(0, Math.round(bal)) })
      if (depletionYear && year >= depletionYear) break
      if (year >= 50) break
    }
  }

  // Sustainable monthly withdrawal (corpus never depletes)
  const sustainableMonthly = Math.round(corpus * monthlyRate)

  // Annual withdrawal rate
  const annualWithdrawalRate = ((monthly * 12) / corpus * 100).toFixed(1)

  // Corpus at 10, 20, 30 years
  const at10 = data.find(d => d.year === 10)?.corpus ?? 0
  const at20 = data.find(d => d.year === 20)?.corpus ?? 0
  const at30 = data.find(d => d.year === 30)?.corpus ?? 0

  return {
    data,
    depletionYear,
    totalWithdrawn,
    sustainableMonthly,
    annualWithdrawalRate,
    at10, at20, at30,
    lasts: !depletionYear,
  }
}
