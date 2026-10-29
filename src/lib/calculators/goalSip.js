// Monthly SIP needed to reach an inflation-adjusted goal
export function calcGoalSIP({ goalToday, years, returnRate, inflation, lumpsum }) {
  const inflatedGoal = goalToday * Math.pow(1 + inflation / 100, years)
  const r = returnRate / 100 / 12
  const n = years * 12

  // Lumpsum grows to
  const lumpsumFV = lumpsum > 0 ? lumpsum * Math.pow(1 + returnRate / 100, years) : 0

  // SIP needed for remaining goal
  const remainingGoal = Math.max(inflatedGoal - lumpsumFV, 0)
  const sipNeeded = r > 0
    ? remainingGoal * r / ((Math.pow(1 + r, n) - 1) * (1 + r))
    : remainingGoal / n

  // Total invested
  const totalInvested = sipNeeded * n + lumpsum
  const totalReturns = inflatedGoal - totalInvested

  // Year-by-year chart
  const chartData = Array.from({ length: years }, (_, i) => {
    const yr = i + 1
    const nMo = yr * 12
    const sipCorpus = r > 0
      ? sipNeeded * ((Math.pow(1 + r, nMo) - 1) / r) * (1 + r)
      : sipNeeded * nMo
    const lumpsumCorpus = lumpsum > 0 ? lumpsum * Math.pow(1 + returnRate / 100, yr) : 0
    const goalAtYr = goalToday * Math.pow(1 + inflation / 100, yr)
    return {
      year: yr,
      corpus: Math.round(sipCorpus + lumpsumCorpus),
      invested: Math.round(sipNeeded * nMo + lumpsum),
      goal: Math.round(goalAtYr),
    }
  })

  // Affordability: SIP as % of typical salary brackets
  const brackets = [
    { label: '₹30K/mo take-home', salary: 30000 },
    { label: '₹60K/mo take-home', salary: 60000 },
    { label: '₹1L/mo take-home',  salary: 100000 },
  ].map(b => ({ ...b, pct: (sipNeeded / b.salary * 100).toFixed(1) }))

  return {
    inflatedGoal, sipNeeded, lumpsumFV,
    totalInvested, totalReturns,
    chartData, brackets,
    alreadyCovered: lumpsumFV >= inflatedGoal,
  }
}
