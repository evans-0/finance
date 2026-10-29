// P&L at expiry for a long call/put
export function optionPnL(type, strike, premium, price, qty) {
  const intrinsic = type === 'call' ? Math.max(0, price - strike) : Math.max(0, strike - price)
  return (intrinsic - premium) * qty
}

export function optionSummary(type, strike, premium, qty) {
  return {
    breakeven: type === 'call' ? strike + premium : strike - premium,
    maxLoss:   premium * qty,
    maxProfit: type === 'call' ? Infinity : (strike - premium) * qty,
  }
}

// P&L at ~31 price points spanning ±15% of the strike
export function payoffCurve(type, strike, premium, qty) {
  const low  = Math.round(strike * 0.85)
  const high = Math.round(strike * 1.15)
  const step = Math.max(1, Math.round((high - low) / 30))   // a 0 step would loop forever for strikes below ~50
  const points = []
  for (let p = low; p <= high; p += step) {
    points.push({ price: p, pnl: Math.round(optionPnL(type, strike, premium, p, qty)) })
  }
  return points
}
