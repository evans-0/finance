// Prepay the loan vs invest the same money, compared at the end of the original tenure
export function compareLoanVsInvest({ mode, balance, loanRate, tenure, extra, investReturn }) {
  const r = loanRate / 100 / 12
  const inv = investReturn / 100 / 12

  // Original EMI
  const emi = r > 0
    ? balance * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1)
    : balance / tenure

  // ── BASELINE: no extra payment ──────────────────────────────────────────
  let baseBal = balance
  let baseTotalInterest = 0
  for (let m = 0; m < tenure; m++) {
    const int = baseBal * r
    baseTotalInterest += int
    baseBal = Math.max(baseBal + int - emi, 0)
  }

  // ── PREPAYMENT PATH ─────────────────────────────────────────────────────
  let prepayBal = balance
  let prepayInterest = 0
  let prepayMonths = 0
  let prepayCorpus = 0  // money freed up after loan ends, invested

  if (mode === 'lump') {
    // Apply lump sum to principal immediately
    prepayBal = Math.max(balance - extra, 0)
  }

  const prepayChart = []
  for (let m = 0; m < tenure + 1; m++) {
    if (mode === 'monthly' && m > 0) {
      // Extra goes to principal each month
      prepayBal = Math.max(prepayBal - extra, 0)
    }
    prepayChart.push({ month: m, loanBal: Math.round(prepayBal) })

    if (prepayBal <= 0) {
      prepayMonths = m
      // After prepayment clears loan, invest EMI + extra for remaining months
      const remaining = tenure - m
      for (let k = 0; k < remaining; k++) {
        const monthlyFree = mode === 'monthly' ? emi + extra : emi
        prepayCorpus = prepayCorpus * (1 + inv) + monthlyFree
      }
      break
    }

    const int = prepayBal * r
    prepayInterest += int
    prepayBal = Math.max(prepayBal + int - emi, 0)

    if (m === tenure) prepayMonths = tenure
  }

  const interestSaved = baseTotalInterest - prepayInterest
  const monthsSaved = tenure - prepayMonths

  // ── INVESTMENT PATH ─────────────────────────────────────────────────────
  let investBal = balance
  let investCorpus = mode === 'lump' ? extra : 0
  let investInterest = 0

  const investChart = []
  for (let m = 0; m <= tenure; m++) {
    investChart.push({
      month: m,
      corpus: Math.round(investCorpus),
      loanBal: Math.round(investBal),
    })

    if (m === tenure) break

    // Loan continues normally
    const int = investBal * r
    investInterest += int
    investBal = Math.max(investBal + int - emi, 0)

    // Corpus grows
    investCorpus = investCorpus * (1 + inv)
    if (mode === 'monthly') investCorpus += extra
  }

  const extraInterestPaid = investInterest - prepayInterest

  // Net comparison at end of original tenure
  // Prepay: loan paid off early, then free cash invested → prepayCorpus
  // Invest: loan runs full tenure, corpus at end → investCorpus
  const prepayNetBenefit = prepayCorpus + interestSaved
  const investNetBenefit = investCorpus - extraInterestPaid

  const investWins = investCorpus > prepayCorpus + interestSaved
  const difference = Math.abs(investCorpus - (prepayCorpus + interestSaved))

  // Break-even return rate (≈ loan rate for monthly compounding)
  const breakevenRate = loanRate

  // Crossover point: when corpus > loan balance (invest path)
  let crossoverMonth = null
  for (const pt of investChart) {
    if (pt.corpus >= pt.loanBal && pt.loanBal > 0) {
      crossoverMonth = pt.month
      break
    }
  }

  // Merge chart data
  const chartData = investChart.map((pt, i) => ({
    month: pt.month,
    'Loan Balance': pt.loanBal,
    'Investment Corpus': pt.corpus,
  }))

  return {
    emi, baseTotalInterest, interestSaved, monthsSaved, prepayMonths,
    investCorpus, prepayCorpus, investWins, difference,
    breakevenRate, crossoverMonth, chartData,
    prepayNetBenefit, investNetBenefit,
  }
}
