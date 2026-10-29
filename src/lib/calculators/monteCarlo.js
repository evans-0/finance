// ── Seeded PRNG (Mulberry32) — deterministic results across re-renders ───────
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Generate standard-normal Z-scores via Box-Muller transform
export function generateZScores(numSims, years) {
  const rng = mulberry32(42)
  const z = []
  for (let s = 0; s < numSims; s++) {
    const row = []
    for (let y = 0; y < years; y++) {
      let u1 = 0, u2 = 0
      while (u1 === 0) u1 = rng()
      while (u2 === 0) u2 = rng()
      row.push(Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2))
    }
    z.push(row)
  }
  return z
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const NUM_SIMS = 1000

export const STRESS_RATES = [3, 3.5, 4, 4.5, 5, 5.5, 6]

// ── Core Monte Carlo engine ───────────────────────────────────────────────────
export function runMonteCarlo(p) {
  const { corpus, monthlyW, expectedReturn, volatility, inflation, inflAdj, years } = p
  if (corpus <= 0 || years <= 0) return {
    survivalRate: 0, medianFinal: 0, p10Final: 0, p90Final: 0,
    sustainableMonthly: 0, sustainableRate: null,
    chartData: [], sensitivity: [], currentRate: 0,
  }

  const annualW = monthlyW * 12
  const zScores = generateZScores(NUM_SIMS, years)

  // ─ Main simulation: 1,000 trajectories ─
  const trajectories = []
  let survived = 0

  for (let s = 0; s < NUM_SIMS; s++) {
    let bal = corpus
    let w = annualW
    const traj = [bal]

    for (let y = 0; y < years; y++) {
      const r = Math.max(-0.9, expectedReturn / 100 + (volatility / 100) * zScores[s][y])
      bal = bal * (1 + r) - w
      if (inflAdj) w *= (1 + inflation / 100)
      if (bal <= 0) {
        traj.push(0)
        for (let k = y + 1; k < years; k++) traj.push(0)
        bal = 0
        break
      }
      traj.push(Math.round(bal))
    }

    if (bal > 0) survived++
    trajectories.push(traj)
  }

  // ─ Percentiles at each year (for fan chart) ─
  const chartData = []
  for (let y = 0; y <= years; y++) {
    const vals = trajectories.map(t => t[y]).sort((a, b) => a - b)
    const pct = q => vals[Math.min(Math.floor(q * vals.length), vals.length - 1)]
    const p10 = pct(0.10), p25 = pct(0.25), p50 = pct(0.50), p75 = pct(0.75), p90 = pct(0.90)

    // Stacked band data: base + band1 + band2 + band3 + band4 = P90
    chartData.push({
      year: y,
      base: Math.max(0, p10),
      band1: Math.max(0, p25 - p10),
      band2: Math.max(0, p50 - p25),
      band3: Math.max(0, p75 - p50),
      band4: Math.max(0, p90 - p75),
      p10, p25, p50, p75, p90,
    })
  }

  // ─ Final corpus distribution ─
  const finals = trajectories.map(t => t[years]).sort((a, b) => a - b)
  const medianFinal = finals[Math.floor(0.5 * finals.length)]
  const p10Final = finals[Math.floor(0.1 * finals.length)]
  const p90Final = finals[Math.floor(0.9 * finals.length)]

  // ─ Stress test: survival at different withdrawal rates ─
  const sensitivity = STRESS_RATES.map(rate => {
    const testW = corpus * rate / 100
    let surv = 0
    for (let s = 0; s < NUM_SIMS; s++) {
      let bal = corpus, w = testW, dead = false
      for (let y = 0; y < years; y++) {
        if (dead) break
        const r = Math.max(-0.9, expectedReturn / 100 + (volatility / 100) * zScores[s][y])
        bal = bal * (1 + r) - w
        if (inflAdj) w *= (1 + inflation / 100)
        if (bal <= 0) dead = true
      }
      if (!dead) surv++
    }
    return { rate, monthlyW: Math.round(corpus * rate / 100 / 12), survival: (surv / NUM_SIMS) * 100 }
  })

  // ─ Sustainable rate: highest stress rate with ≥ 95% survival ─
  let sustainableRate = null
  for (const s of sensitivity) {
    if (s.survival >= 95) sustainableRate = s.rate
  }
  const sustainableMonthly = sustainableRate
    ? Math.round(corpus * sustainableRate / 100 / 12)
    : Math.round(corpus * Math.max(0, (expectedReturn - inflation) / 100) / 12)

  const currentRate = corpus > 0 ? (annualW / corpus) * 100 : 0

  return {
    survivalRate: (survived / NUM_SIMS) * 100,
    medianFinal, p10Final, p90Final,
    sustainableMonthly, sustainableRate,
    chartData, sensitivity, currentRate,
  }
}
