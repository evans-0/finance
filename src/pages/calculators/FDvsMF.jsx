import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
const fmt  = n => INR + fmtIN(n)
const fmtP = n => n.toFixed(2) + '%'

function InputField({ label, value, onChange, min, max, step, suffix, hint, color }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: color || C.amber }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
          style={{ flex: 1, background: C.bg, border: '1px solid ' + (color || C.border), color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
        style={{ width: '100%', marginTop: 6, accentColor: color || C.amber }} />
      {label.includes(INR) && value > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>{fmt(value)}</div>}
    </div>
  )
}

// FD: interest taxed as income every year (TDS at slab rate)
function calcFD(principal, rate, years, taxRate, inflation) {
  const netRate    = rate * (1 - taxRate / 100)       // post-tax annual rate
  const postTax    = principal * Math.pow(1 + netRate / 100, years)
  const realReturn = ((1 + netRate / 100) / (1 + inflation / 100) - 1) * 100
  const realValue  = principal * Math.pow(1 + realReturn / 100, years)
  return { postTax, realValue, netRate, gain: postTax - principal }
}

// Mutual Fund: LTCG 10% on gains above 1L (equity), no annual tax drag
function calcMF(principal, cagr, years, inflation) {
  const maturity   = principal * Math.pow(1 + cagr / 100, years)
  const gain       = maturity - principal
  const taxableGain = Math.max(0, gain - 125000)      // LTCG exemption ₹1.25L (Budget 2024)
  const tax        = taxableGain * 0.125                 // 12.5% LTCG rate
  const postTax    = maturity - tax
  const realReturn = ((1 + cagr / 100) / (1 + inflation / 100) - 1) * 100
  const realValue  = principal * Math.pow(1 + realReturn / 100, years)
  return { postTax, realValue, maturity, gain, tax, realReturn }
}

export default function FDvsMF() {
  const [principal,  setPrincipal]  = useState(500000)
  const [fdRate,     setFdRate]     = useState(7)
  const [mfCagr,     setMfCagr]     = useState(12)
  const [years,      setYears]      = useState(10)
  const [taxSlab,    setTaxSlab]    = useState(30)
  const [inflation,  setInflation]  = useState(6)

  const fd = calcFD(principal, fdRate, years, taxSlab, inflation)
  const mf = calcMF(principal, mfCagr, years, inflation)

  const mfAdvantage = mf.postTax - fd.postTax
  const mfWins      = mfAdvantage > 0

  // Breakeven CAGR where MF post-tax = FD post-tax
  let breakeven = null
  for (let r = 1; r <= 30; r += 0.1) {
    const test = calcMF(principal, r, years, inflation)
    if (test.postTax >= fd.postTax) { breakeven = r; break }
  }

  // Chart data year by year
  const chartData = Array.from({ length: years + 1 }, (_, i) => {
    const fdY = calcFD(principal, fdRate, i, taxSlab, inflation)
    const mfY = calcMF(principal, mfCagr, i, inflation)
    return {
      year:    'Yr ' + i,
      fd:      Math.round(fdY.postTax),
      mf:      Math.round(mfY.postTax),
      fdReal:  Math.round(fdY.realValue),
      mfReal:  Math.round(mfY.realValue),
    }
  })

  const tickFmt = v => v >= 10000000 ? INR+(v/10000000).toFixed(1)+'Cr' : v >= 100000 ? INR+(v/100000).toFixed(1)+'L' : INR+(v/1000).toFixed(0)+'K'

  const TAX_SLABS = [5, 10, 20, 30]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>FD vs Mutual Fund</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Post-tax, inflation-adjusted comparison — the number that actually matters</p>
        </div>

        <div style={{ background: '#0a0c10', border: '1px solid ' + C.amber, borderRadius: 4, padding: '14px 16px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>{String.fromCodePoint(0x1F4A1)}</span>
          <div style={{ fontSize: 11, color: '#ffd580', lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>FD interest is taxed every year at your income slab rate.</strong> Mutual fund gains are taxed only at redemption at a flat 10% LTCG (with ₹1L exemption). This tax timing difference makes a huge impact over long periods.
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Common */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 16 }}>COMMON</div>
            <InputField label={'INVESTMENT (' + INR + ')'} value={principal} onChange={setPrincipal} min={10000} max={10000000} step={10000} />
            <InputField label="TIME PERIOD" value={years} onChange={setYears} min={1} max={30} step={1} suffix="YRS" />
            <InputField label="INFLATION RATE" value={inflation} onChange={setInflation} min={2} max={12} step={0.5} suffix="% p.a." hint="India avg: 6%" />
          </div>

          {/* FD */}
          <div style={{ background: C.panel, border: '1px solid ' + C.blue, borderRadius: 4, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.blue, letterSpacing: 1.5, marginBottom: 16 }}>FIXED DEPOSIT</div>
            <InputField label="FD INTEREST RATE" value={fdRate} onChange={setFdRate} min={3} max={10} step={0.25} suffix="% p.a." color={C.blue} hint="SBI: 6.5-7%" />
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 8 }}>INCOME TAX SLAB</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 6 }}>
                {TAX_SLABS.map(t => (
                  <button key={t} onClick={() => setTaxSlab(t)} style={{
                    background: taxSlab === t ? C.blue : C.bg, color: taxSlab === t ? '#fff' : C.textSec,
                    border: '1px solid ' + (taxSlab === t ? C.blue : C.border), padding: '7px', fontSize: 11,
                    fontFamily: MONO, cursor: 'pointer', borderRadius: 3,
                  }}>{t}%</button>
                ))}
              </div>
            </div>
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 10, fontSize: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: C.textSec }}>Post-tax rate</span>
                <span style={{ color: C.blue }}>{fmtP(fd.netRate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.textSec }}>Real return</span>
                <span style={{ color: fd.netRate > inflation ? C.green : C.red }}>{fmtP(fd.netRate - inflation)}</span>
              </div>
            </div>
          </div>

          {/* MF */}
          <div style={{ background: C.panel, border: '1px solid ' + C.green, borderRadius: 4, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5, marginBottom: 16 }}>EQUITY MUTUAL FUND</div>
            <InputField label="EXPECTED CAGR" value={mfCagr} onChange={setMfCagr} min={5} max={25} step={0.5} suffix="% p.a." color={C.green} hint="Nifty 50: ~12-13%" />
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 10, fontSize: 10, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: C.textSec }}>Tax on gains</span>
                <span style={{ color: C.green }}>10% LTCG (above {fmt(100000)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: C.textSec }}>Tax amount</span>
                <span style={{ color: C.red }}>{fmt(mf.tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.textSec }}>Real return</span>
                <span style={{ color: mf.realReturn > 0 ? C.green : C.red }}>{fmtP(mf.realReturn)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner banner */}
        <div style={{ background: C.panel, border: '2px solid ' + (mfWins ? C.green : C.blue), borderRadius: 4, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.blue, letterSpacing: 1.5, marginBottom: 6 }}>FIXED DEPOSIT (POST-TAX)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.blue }}>{fmt(fd.postTax)}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>Gain: {fmt(fd.gain)} · Real: {fmt(fd.realValue)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{mfWins ? String.fromCodePoint(0x1F3C6) : String.fromCodePoint(0x1F3C6)}</div>
              <div style={{ fontSize: 11, color: mfWins ? C.green : C.blue, fontWeight: 700, marginTop: 4 }}>
                {mfWins ? 'MF WINS' : 'FD WINS'}
              </div>
              <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>by {fmt(Math.abs(mfAdvantage))}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5, marginBottom: 6 }}>MUTUAL FUND (POST-TAX)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{fmt(mf.postTax)}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>Gain: {fmt(mf.gain)} · Tax: {fmt(mf.tax)} · Real: {fmt(mf.realValue)}</div>
            </div>
          </div>
          {breakeven !== null && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: C.textSec }}>
              MF needs a CAGR of at least <span style={{ color: C.amber, fontWeight: 700 }}>{fmtP(breakeven)}</span> to beat this FD post-tax
            </div>
          )}
        </div>

        {/* Growth chart */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 4 }}>POST-TAX GROWTH OVER TIME</div>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 16 }}>The gap widens every year due to compounding and tax drag on FD</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} interval={Math.floor(years / 5)} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80} tickFormatter={tickFmt} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'fd' ? 'FD (post-tax)' : name === 'mf' ? 'MF (post-tax)' : name === 'fdReal' ? 'FD (real value)' : 'MF (real value)']}
                contentStyle={{ background: '#0a1828', border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'fd' ? 'FD post-tax' : v === 'mf' ? 'MF post-tax' : v === 'fdReal' ? 'FD real value' : 'MF real value'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <Line type="monotone" dataKey="fd"     stroke={C.blue}  strokeWidth={2}   dot={false} />
              <Line type="monotone" dataKey="mf"     stroke={C.green} strokeWidth={2}   dot={false} />
              <Line type="monotone" dataKey="fdReal" stroke={C.blue}  strokeWidth={1}   dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="mfReal" stroke={C.green} strokeWidth={1}   dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key insights */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 16 }}>KEY INSIGHTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 10 }}>
            {[
              ['Tax drag on FD', 'FD interest is added to your income every year and taxed at your slab rate. In the 30% slab, a 7% FD effectively yields only 4.9%.'],
              ['MF tax advantage', 'Equity MF gains are taxed only when you sell, at a flat 10% LTCG. The untaxed gains compound freely until redemption.'],
              ['The 1 lakh exemption', 'First ₹1.25 lakh of long-term capital gains each year is tax-free (Budget 2024). Strategic redemption and reinvestment can minimize tax further.'],
              ['Risk vs Return', 'FD returns are guaranteed. MF returns are not — market can deliver less than expected. Higher potential return comes with volatility.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 12 }}>
                <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
