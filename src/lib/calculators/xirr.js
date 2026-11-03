const DAY_MS = 86400000

// Cash flows are { date: 'YYYY-MM-DD', amount } with money paid in negative and money
// received (withdrawals, current value) positive — the same convention as Excel's XIRR.
// Years are counted as days / 365, also matching Excel.
const toYears = (flows) => {
  const t0 = Math.min(...flows.map(f => Date.parse(f.date)))
  return flows.map(f => (Date.parse(f.date) - t0) / DAY_MS / 365)
}

// Net present value of the flows at an annual rate
export function xnpv(rate, flows) {
  const t = toYears(flows)
  return flows.reduce((sum, f, i) => sum + f.amount / Math.pow(1 + rate, t[i]), 0)
}

function solve(flows) {
  const t = toYears(flows)
  const npv  = r => flows.reduce((s, f, i) => s + f.amount / Math.pow(1 + r, t[i]), 0)
  const dnpv = r => flows.reduce((s, f, i) => s - t[i] * f.amount / Math.pow(1 + r, t[i] + 1), 0)

  // Newton's method converges in a few steps for ordinary investment histories
  let r = 0.1
  for (let i = 0; i < 100; i++) {
    const f = npv(r), d = dnpv(r)
    if (!isFinite(f) || !isFinite(d) || d === 0) break
    const next = r - f / d
    if (next <= -1) break
    if (Math.abs(next - r) < 1e-10) return next
    r = next
  }

  // Fall back to bisection: find a rate range where NPV changes sign, then halve it
  let lo = -0.999999, hi = 1
  while (Math.sign(npv(lo)) === Math.sign(npv(hi)) && hi < 1e6) hi *= 2
  if (Math.sign(npv(lo)) === Math.sign(npv(hi))) return null
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2
    if (Math.sign(npv(mid)) === Math.sign(npv(lo))) lo = mid
    else hi = mid
    if (hi - lo < 1e-12) break
  }
  return (lo + hi) / 2
}

export function calcXIRR(flows) {
  const valid = flows.filter(f => f.amount !== 0)
  const totalInvested = -valid.filter(f => f.amount < 0).reduce((s, f) => s + f.amount, 0)
  const totalReceived =  valid.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0)
  const gain = totalReceived - totalInvested
  const absoluteReturn = totalInvested > 0 ? (gain / totalInvested) * 100 : 0
  const base = { xirr: null, totalInvested, totalReceived, gain, absoluteReturn, years: 0 }

  if (valid.some(f => isNaN(Date.parse(f.date)))) return { ...base, error: 'Every row needs a valid date.' }
  if (!valid.some(f => f.amount < 0)) return { ...base, error: 'Add at least one investment.' }
  if (!valid.some(f => f.amount > 0)) return { ...base, error: 'Add the current value or a withdrawal.' }

  const times = valid.map(f => Date.parse(f.date))
  const years = (Math.max(...times) - Math.min(...times)) / DAY_MS / 365
  if (years === 0) return { ...base, error: 'Cash flows must span more than one day.' }

  const rate = solve(valid)
  if (rate === null) return { ...base, years, error: 'No single rate fits these cash flows.' }
  return { ...base, years, xirr: rate * 100 }
}

// Monthly SIP rows: `months` instalments of `amount` starting on `startDate`
export function sipSchedule(amount, startDate, months) {
  const [y, m, d] = startDate.split('-').map(Number)
  return Array.from({ length: months }, (_, i) => {
    // Clamp the day so a 31st start date lands on the last day of shorter months
    const lastDay = new Date(Date.UTC(y, m - 1 + i + 1, 0)).getUTCDate()
    const date = new Date(Date.UTC(y, m - 1 + i, Math.min(d, lastDay)))
    return { date: date.toISOString().slice(0, 10), amount }
  })
}
