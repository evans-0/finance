import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623', blue: '#2196f3',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const INR  = '\u20b9'

const fmtIN = n => {
  if (!n || n === 0) return '0'
  const s = Math.round(Math.abs(n)).toString()
  if (s.length <= 3) return s
  const last3 = s.slice(-3)
  const rest  = s.slice(0, -3)
  const parts = []
  for (let i = rest.length; i > 0; i -= 2) parts.unshift(rest.slice(Math.max(0, i - 2), i))
  return parts.join(',') + ',' + last3
}
const fmt = n => INR + fmtIN(n)

function calcPayoff(balance, monthlyRate, payment) {
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

function InputField({ label, value, onChange, min, max, step, suffix, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: C.amber }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
          style={{ flex: 1, background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
        style={{ width: '100%', marginTop: 6, accentColor: C.red }} />
      {label.includes('BALANCE') && value > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>{fmt(value)}</div>}
    </div>
  )
}

function StatBox({ label, value, color, sub }) {
  return (
    <div style={{ background: C.bg, border: '1px solid ' + (color === C.red ? C.red : C.border), borderRadius: 3, padding: '14px 16px', flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 11, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export default function CreditCard() {
  const [balance,      setBalance]      = useState(50000)
  const [monthlyRate,  setMonthlyRate]  = useState(2)
  const [customPay,    setCustomPay]    = useState(3000)

  const minPayment    = Math.max(500, Math.round(balance * 0.05))   // 5% or min 500
  const interestOnly  = Math.round(balance * monthlyRate / 100)
  const effectiveAnnualRate = ((Math.pow(1 + monthlyRate / 100, 12) - 1) * 100).toFixed(2)

  const minResult    = useMemo(() => calcPayoff(balance, monthlyRate, minPayment),   [balance, monthlyRate, minPayment])
  const customResult = useMemo(() => calcPayoff(balance, monthlyRate, customPay),    [balance, monthlyRate, customPay])
  const fullResult   = { months: 1, totalInterest: balance * monthlyRate / 100 }

  const canPayOff = customPay > interestOnly

  // Merge chart data
  const maxMonths = Math.min(minResult.months, 240)
  const chartData = Array.from({ length: maxMonths + 1 }, (_, i) => {
    const minPt    = minResult.history.find(h => h.month === i)
    const custPt   = customResult.history.find(h => h.month === i)
    return {
      month: i,
      min:   minPt    ? minPt.balance    : undefined,
      custom: custPt  ? custPt.balance   : undefined,
    }
  }).filter(d => d.min !== undefined || d.custom !== undefined)

  const fmtMonths = m => m >= 12 ? Math.floor(m/12) + 'y ' + (m%12) + 'm' : m + ' months'

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Credit Card Interest</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>See the true cost of carrying a credit card balance</p>
        </div>

        {/* Education banner */}
        <div style={{ background: '#1a0a0a', border: '1px solid ' + C.red, borderRadius: 4, padding: '14px 16px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>{String.fromCodePoint(0x26A0)}</span>
          <div style={{ fontSize: 11, color: '#ffaaaa', lineHeight: 1.7 }}>
            <strong style={{ color: C.red }}>2% per month sounds small.</strong> It is actually {effectiveAnnualRate}% per year after compounding.
            Most people only pay the minimum — which barely covers the interest and keeps you in debt for years.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          {/* Inputs */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>YOUR SITUATION</div>
            <InputField label={'OUTSTANDING BALANCE (' + INR + ')'} value={balance} onChange={setBalance} min={1000} max={1000000} step={1000} />
            <InputField label="MONTHLY INTEREST RATE" value={monthlyRate} onChange={setMonthlyRate} min={0.5} max={4} step={0.1} suffix="% / mo"
              hint={'= ' + effectiveAnnualRate + '% p.a. effective'} />
            <InputField label={'CUSTOM MONTHLY PAYMENT (' + INR + ')'} value={customPay} onChange={setCustomPay} min={100} max={200000} step={500} />

            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 12, fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: C.textSec }}>Minimum payment (5%)</span>
                <span style={{ color: C.amber, fontWeight: 600 }}>{fmt(minPayment)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: C.textSec }}>Monthly interest charge</span>
                <span style={{ color: C.red, fontWeight: 600 }}>{fmt(interestOnly)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.textSec }}>Effective annual rate</span>
                <span style={{ color: C.red, fontWeight: 600 }}>{effectiveAnnualRate}%</span>
              </div>
            </div>

            {!canPayOff && (
              <div style={{ background: '#1a0505', border: '1px solid ' + C.red, borderRadius: 3, padding: 10, marginTop: 12, fontSize: 11, color: C.red }}>
                {String.fromCodePoint(0x26A0)} Your payment ({fmt(customPay)}) is less than the monthly interest ({fmt(interestOnly)}). The debt will NEVER be cleared — it will keep growing.
              </div>
            )}
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Minimum payment scenario */}
            <div style={{ background: C.panel, border: '1px solid ' + C.red, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.5, marginBottom: 12 }}>IF YOU PAY MINIMUM ONLY ({fmt(minPayment)}/mo)</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatBox label="TIME TO PAYOFF"    value={minResult.neverPaysOff ? 'Never' : fmtMonths(minResult.months)} color={C.red} />
                <StatBox label="TOTAL INTEREST"    value={fmt(minResult.totalInterest)} color={C.red} />
                <StatBox label="TOTAL PAID"        value={fmt(balance + minResult.totalInterest)} color={C.red} sub={'on a ' + fmt(balance) + ' balance'} />
              </div>
            </div>

            {/* Custom payment scenario */}
            <div style={{ background: C.panel, border: '1px solid ' + (canPayOff ? C.green : C.red), borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: canPayOff ? C.green : C.red, letterSpacing: 1.5, marginBottom: 12 }}>
                IF YOU PAY {fmt(customPay)}/mo
              </div>
              {canPayOff ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <StatBox label="TIME TO PAYOFF"   value={fmtMonths(customResult.months)} color={C.green} />
                  <StatBox label="TOTAL INTEREST"   value={fmt(customResult.totalInterest)} color={C.amber} />
                  <StatBox label="INTEREST SAVED"   value={fmt(minResult.totalInterest - customResult.totalInterest)} color={C.green}
                    sub={'vs minimum payments'} />
                </div>
              ) : (
                <div style={{ fontSize: 13, color: C.red }}>Debt grows indefinitely. Pay at least {fmt(interestOnly + 1)} to make progress.</div>
              )}
            </div>

            {/* Pay in full */}
            <div style={{ background: C.panel, border: '1px solid ' + C.green, borderRadius: 4, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5 }}>BEST: PAY IN FULL THIS MONTH</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{fmt(balance + interestOnly)}</div>
                <div style={{ fontSize: 10, color: C.textSec }}>Total due this cycle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 4 }}>BALANCE OVER TIME</div>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 16 }}>Minimum payment vs your payment — see how long the debt hangs around</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="month" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }}
                tickFormatter={v => v >= 12 ? Math.floor(v/12) + 'y' : v + 'm'} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80}
                tickFormatter={v => v >= 100000 ? INR+(v/100000).toFixed(1)+'L' : INR+(v/1000).toFixed(0)+'K'} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'min' ? 'Minimum Payment' : 'Your Payment']}
                labelFormatter={v => 'Month ' + v + (v >= 12 ? ' (' + Math.floor(v/12) + 'y ' + (v%12) + 'm)' : '')}
                contentStyle={{ background: '#0a1828', border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'min' ? 'Minimum Payment Only' : 'Your Payment (' + fmt(customPay) + '/mo)'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <ReferenceLine y={0} stroke={C.border} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="min"    stroke={C.red}   strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="custom" stroke={C.green} strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tips */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20, marginTop: 20 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 12 }}>HOW TO ESCAPE CREDIT CARD DEBT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 8 }}>
            {[
              ['Pay more than the minimum', 'Minimum payment is designed to keep you paying interest as long as possible.'],
              ['Pay in full every month', 'No balance carried forward means zero interest — the only winning move.'],
              ['Understand the real rate', '2% per month is 26.82% per year — higher than most personal loans.'],
              ['Avalanche method', 'If you have multiple cards, pay off the highest interest rate card first.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 12 }}>
                <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
