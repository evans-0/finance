// ── Computation ───────────────────────────────────────────────────────────────
export function computeFutureNetWorth(assets, liabilities, global, mode) {
  const { monthlySavings, savingsReturn, years } = global
  const rSavings = savingsReturn / 100 / 12

  // Snapshot liability state (mutable per year)
  let liabState = liabilities.map(l => ({ ...l, bal: l.balance }))

  // Future investments bucket starts at 0, grows with monthly contributions
  let futureInvest = 0

  const currentAssets = assets.reduce((s, a) => s + a.value, 0)
  const currentLiab = liabilities.reduce((s, l) => s + l.balance, 0)
  const currentNW = currentAssets - currentLiab

  const chartData = [{ year: 0, assets: Math.round(currentAssets), liabilities: Math.round(currentLiab), netWorth: Math.round(currentNW) }]

  for (let yr = 1; yr <= years; yr++) {
    // Grow each asset
    const totalAssets = assets.reduce((sum, a) => {
      return sum + a.value * Math.pow(1 + a.returnRate / 100, yr)
    }, 0)

    // Grow future investments bucket (monthly contributions)
    for (let m = 0; m < 12; m++) {
      futureInvest = futureInvest * (1 + rSavings) + monthlySavings
    }

    // Reduce each liability via amortisation
    for (const l of liabState) {
      if (l.bal <= 0) continue
      const rMo = l.rate / 100 / 12
      for (let m = 0; m < 12; m++) {
        if (l.bal <= 0) break
        const interest = l.bal * rMo
        const principal = Math.max(l.emi - interest, 0)
        l.bal = Math.max(l.bal - principal, 0)
      }
    }

    const totalLiab = liabState.reduce((s, l) => s + l.bal, 0)
    const totalA = totalAssets + futureInvest
    const nw = totalA - totalLiab

    chartData.push({
      year: yr,
      assets: Math.round(totalA),
      liabilities: Math.round(totalLiab),
      netWorth: Math.round(nw),
    })
  }

  const last = chartData[chartData.length - 1]
  const growth = last.netWorth - currentNW
  const cagr = currentNW > 0
    ? (Math.pow(last.netWorth / currentNW, 1 / years) - 1) * 100
    : 0

  // Largest asset at end
  const assetBreakdown = assets.map(a => ({
    name: a.name,
    value: Math.round(a.value * Math.pow(1 + a.returnRate / 100, years)),
  })).sort((a, b) => b.value - a.value)

  return { chartData, currentNW, futureNW: last.netWorth, growth, cagr, assetBreakdown, currentAssets, currentLiab }
}
