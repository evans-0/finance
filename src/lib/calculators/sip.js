export function calcSIP(monthly, annualRate, years, stepUp, stepUpEnabled, expenseRatio) {
  const r = Math.max(0, annualRate - expenseRatio) / 12 / 100
  if (!stepUpEnabled) {
    const n = years * 12
    return { futureValue: r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthly * n, invested: monthly * n }
  }
  let balance = 0, invested = 0, current = monthly
  for (let y = 0; y < years; y++) {
    if (y > 0) current *= (1 + stepUp / 100)
    for (let m = 0; m < 12; m++) { balance = balance * (1 + r) + current; invested += current }
  }
  return { futureValue: balance, invested }
}

// Lumpsum compounds annually at the net-of-expense rate
export function calcLumpsumFV(lumpsum, annualRate, years, expenseRatio) {
  return lumpsum > 0 ? lumpsum * Math.pow(1 + Math.max(0, annualRate - expenseRatio) / 100, years) : 0
}
