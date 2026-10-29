export function calcPayoff(balance, monthlyRate, payment) {
  const r = monthlyRate / 100
  let bal = balance, months = 0, totalInterest = 0
  const history = [{ month: 0, balance: Math.round(bal) }]
  while (bal > 0 && months < 600) {
    const interest = bal * r
    totalInterest += interest
    bal = bal + interest - payment
    months++
    if (bal < 0) bal = 0
    if (months <= 120 || months % 12 === 0) history.push({ month: months, balance: Math.round(bal) })
  }
  return { months, totalInterest, history, neverPaysOff: months >= 600 }
}

export const minimumPayment = balance => Math.max(500, Math.round(balance * 0.05))   // 5% or min 500

export const effectiveAnnualRate = monthlyRate => (Math.pow(1 + monthlyRate / 100, 12) - 1) * 100
