// ── Core calculation ──────────────────────────────────────────────────────────
export function computeFIRE(p, activeVariant, variants) {
  const annualExpensesToday = p.retireExpenses * 12
  const yearsToRetire = p.retireAge - p.currentAge
  // Inflate today's retirement expenses to what they'll cost at retirement date
  const annualExpenses = annualExpensesToday * Math.pow(1 + p.inflation / 100, yearsToRetire)
  const monthlySavings = p.monthlyIncome - p.monthlyExpenses
  const r = p.returnRate / 100
  const rMonthly = r / 12

  // FIRE numbers for each variant — all inflation-adjusted to retirement date
  const fireNumbers = variants.map(v => ({
    ...v,
    fireNumber: annualExpenses * v.mult,
  }))

  // Active variant drives all stats
  const activeV = variants.find(v => v.key === activeVariant) || variants[1]
  const mainFireNumber = annualExpenses * activeV.mult

  // Build year-by-year accumulation
  const maxAge = Math.max(p.retireAge + p.withdrawYears, p.currentAge + 60)
  let corpus = p.currentSavings
  const data = []
  let coastFireAge = null
  let fireAge = null

  for (let age = p.currentAge; age <= maxAge; age++) {
    const isAccumulating = age < p.retireAge

    if (isAccumulating) {
      // Coast FIRE: can we stop contributing now and growth alone hits the active target?
      const yearsLeft = p.retireAge - age
      const coastNumber = mainFireNumber / Math.pow(1 + r, yearsLeft)
      if (!coastFireAge && corpus >= coastNumber) coastFireAge = age

      // Grow corpus with contributions
      for (let m = 0; m < 12; m++) {
        corpus = corpus * (1 + rMonthly) + monthlySavings
      }

      if (!fireAge && corpus >= mainFireNumber) fireAge = age
    } else {
      // Withdrawal phase
      const withdrawR = p.retireReturn / 100
      const inflAdj = Math.pow(1 + p.inflation / 100, age - p.retireAge)
      const annualWithdraw = annualExpenses * inflAdj
      corpus = corpus * (1 + withdrawR) - annualWithdraw
      corpus = Math.max(corpus, 0)
    }

    const point = { age, corpus: Math.round(corpus) }
    fireNumbers.forEach(v => { point[v.key + 'Target'] = Math.round(v.fireNumber) })
    data.push(point)
  }

  const yearsToFire = fireAge ? fireAge - p.currentAge : null
  const savingsRate = monthlySavings > 0 ? (monthlySavings / p.monthlyIncome) * 100 : 0
  const progress = Math.min((p.currentSavings / mainFireNumber) * 100, 100)

  const monthsToRetire = yearsToRetire * 12
  const futureCorpusNeeded = mainFireNumber - p.currentSavings * Math.pow(1 + r, yearsToRetire)
  const alreadyFunded = futureCorpusNeeded <= 0
  const rawSavingsNeeded = alreadyFunded ? 0 : rMonthly > 0
    ? futureCorpusNeeded * rMonthly / (Math.pow(1 + rMonthly, monthsToRetire) - 1)
    : futureCorpusNeeded / monthsToRetire

  return {
    fireNumbers, mainFireNumber, data,
    yearsToFire, fireAge, coastFireAge,
    savingsRate, progress, alreadyFunded,
    monthlySavings, monthlySavingsNeeded: Math.max(rawSavingsNeeded, 0),
    retireAge: p.retireAge,
  }
}
