export function calcStockReturn({ buyPrice, sellPrice, qty, brokerage, buyDate, sellDate }) {
  const investment = buyPrice  * qty * (1 + brokerage / 100)
  const proceeds   = sellPrice * qty * (1 - brokerage / 100)
  const pnl        = proceeds - investment
  const returnPct  = (pnl / investment) * 100

  const days  = Math.max((new Date(sellDate) - new Date(buyDate)) / (1000 * 86400), 1)
  const years = days / 365
  const cagr  = years > 0 ? (Math.pow(proceeds / investment, 1 / years) - 1) * 100 : 0

  return { investment, proceeds, pnl, returnPct, days, cagr }
}
