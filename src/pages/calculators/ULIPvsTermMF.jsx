import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623', blue: '#2196f3', purple: '#a855f7',
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

// Mortality charges per 1000 sum assured (approximate industry rates)
function getMortalityRate(age) {
  if (age < 25) return 0.70
  if (age < 30) return 0.90
  if (age < 35) return 1.10
  if (age < 40) return 1.50
  if (age < 45) return 2.20
  if (age < 50) return 3.20
  return 5.00
}

function calcULIP(premium, age, years, coverage, cagr, allocCharge, fmc) {
  const r = cagr / 100
  let fund = 0
  let totalCharges = 0
  const history = []

  for (let y = 1; y <= years; y++) {
    const currentAge     = age + y - 1
    const investable     = premium * (1 - allocCharge / 100)           // after allocation charge
    const mortalityCharge = (coverage / 1000) * getMortalityRate(currentAge) // mortality per year
    const invested       = Math.max(0, investable - mortalityCharge)
    const fmcCharge      = fund * (fmc / 100)                           // fund mgmt on corpus

    fund = (fund + invested) * (1 + r) - fmcCharge
    totalCharges += (premium - investable) + mortalityCharge + fmcCharge
    history.push({ year: 'Yr ' + y, ulip: Math.round(fund) })
  }

  // LTCG 10% on gains above 1L (ULIPs are tax-free under 10(10D) if premium < 10% of SA)
  // Simplified: ULIP maturity is tax-free
  return { maturity: Math.round(fund), totalCharges: Math.round(totalCharges), history }
}

function calcTermPlusMF(premium, age, years, coverage, mfCagr, termPremium) {
  const investAmount = premium - termPremium                // leftover after paying term
  const r = mfCagr / 100
  let fund = 0
  const history = []

  for (let y = 1; y <= years; y++) {
    fund = (fund + investAmount) * (1 + r)
    history.push({ year: 'Yr ' + y, termMF: Math.round(fund) })
  }

  // LTCG 10% on gains above 1L
  const gain       = fund - (investAmount * years)
  const taxable    = Math.max(0, gain - 125000)  // LTCG exemption ₹1.25L (Budget 2024)
  const tax        = taxable * 0.125              // 12.5% LTCG rate
  const postTax    = fund - tax

  return { maturity: Math.round(postTax), grossMaturity: Math.round(fund), tax: Math.round(tax), termPremium, investAmount, history }
}

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

// Approximate annual term premium for 1Cr coverage
function estimateTermPremium(age) {
  if (age < 25) return 7000
  if (age < 30) return 8500
  if (age < 35) return 10000
  if (age < 40) return 14000
  if (age < 45) return 22000
  return 35000
}

export default function ULIPvsTermMF() {
  const [premium,    setPremium]    = useState(100000)
  const [age,        setAge]        = useState(30)
  const [years,      setYears]      = useState(20)
  const [coverage,   setCoverage]   = useState(10000000)  // 1 Cr
  const [mfCagr,     setMfCagr]     = useState(12)
  const [ulipCagr,   setUlipCagr]   = useState(10)        // lower due to charges
  const [allocCharge,setAllocCharge]= useState(5)
  const [fmc,        setFmc]        = useState(1.35)

  const termPremium = estimateTermPremium(age)
  const ulip        = calcULIP(premium, age, years, coverage, ulipCagr, allocCharge, fmc)
  const termMF      = calcTermPlusMF(premium, age, years, coverage, mfCagr, termPremium)

  const advantage   = termMF.maturity - ulip.maturity
  const termWins    = advantage > 0

  // Merge chart
  const chartData = Array.from({ length: years }, (_, i) => {
    const ulipPt  = ulip.history[i]
    const tmfPt   = termMF.history[i]
    return {
      year:   'Yr ' + (i + 1),
      ulip:   ulipPt ? ulipPt.ulip    : undefined,
      termMF: tmfPt  ? tmfPt.termMF   : undefined,
    }
  })

  const tickFmt = v => v >= 10000000 ? INR+(v/10000000).toFixed(1)+'Cr' : v >= 100000 ? INR+(v/100000).toFixed(1)+'L' : INR+(v/1000).toFixed(0)+'K'

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>ULIP vs Term + Mutual Fund</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Why mixing insurance with investment usually does both poorly</p>
        </div>

        {/* Education banner */}
        <div style={{ background: '#0d0a02', border: '1px solid ' + C.amber, borderRadius: 4, padding: '14px 16px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>{String.fromCodePoint(0x1F4A1)}</span>
          <div style={{ fontSize: 11, color: '#ffd580', lineHeight: 1.8 }}>
            <strong style={{ color: C.amber }}>ULIPs charge you to invest AND insure at the same time.</strong> Allocation charges, fund management charges and mortality charges eat into your premium before it even starts growing.
            The alternative: buy cheap term insurance separately, invest the rest in mutual funds. Same premium, same coverage — dramatically better outcome.
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Common */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 16 }}>YOUR DETAILS</div>
            <InputField label={'ANNUAL PREMIUM (' + INR + ')'} value={premium} onChange={setPremium} min={25000} max={1000000} step={25000} />
            <InputField label="AGE" value={age} onChange={setAge} min={20} max={55} step={1} suffix="YRS"
              hint={'Term premium: ' + fmt(termPremium) + '/yr'} />
            <InputField label={'COVERAGE (' + INR + ')'} value={coverage} onChange={setCoverage} min={1000000} max={50000000} step={1000000} />
            <InputField label="POLICY TERM" value={years} onChange={setYears} min={5} max={30} step={1} suffix="YRS" />
          </div>

          {/* ULIP */}
          <div style={{ background: C.panel, border: '1px solid ' + C.purple, borderRadius: 4, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.purple, letterSpacing: 1.5, marginBottom: 16 }}>ULIP</div>
            <InputField label="FUND CAGR (GROSS)" value={ulipCagr} onChange={setUlipCagr} min={4} max={18} step={0.5} suffix="%" color={C.purple}
              hint="Lower than MF due to charges" />
            <InputField label="ALLOCATION CHARGE" value={allocCharge} onChange={setAllocCharge} min={0} max={15} step={0.5} suffix="%" color={C.purple}
              hint="Deducted from premium upfront" />
            <InputField label="FUND MGMT CHARGE" value={fmc} onChange={setFmc} min={0.5} max={2.5} step={0.05} suffix="%" color={C.purple}
              hint="Annual charge on corpus" />
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 10, fontSize: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: C.textSec }}>Amount invested after alloc charge</span>
                <span style={{ color: C.purple }}>{fmt(Math.round(premium * (1 - allocCharge / 100)))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.textSec }}>Total charges (est.)</span>
                <span style={{ color: C.red }}>{fmt(ulip.totalCharges)}</span>
              </div>
            </div>
          </div>

          {/* Term + MF */}
          <div style={{ background: C.panel, border: '1px solid ' + C.green, borderRadius: 4, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5, marginBottom: 16 }}>TERM + MUTUAL FUND</div>
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>TERM INSURANCE (est.)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{fmt(termPremium)}<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec }}>/yr</span></div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{fmt(coverage)} cover · pure protection</div>
            </div>
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>INVESTED IN MF</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{fmt(premium - termPremium)}<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec }}>/yr</span></div>
            </div>
            <InputField label="MF EXPECTED CAGR" value={mfCagr} onChange={setMfCagr} min={6} max={20} step={0.5} suffix="%" color={C.green}
              hint="Nifty 50 hist: ~12-13%" />
          </div>
        </div>

        {/* Winner */}
        <div style={{ background: C.panel, border: '2px solid ' + (termWins ? C.green : C.purple), borderRadius: 4, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.purple, letterSpacing: 1.5, marginBottom: 6 }}>ULIP MATURITY VALUE</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.purple }}>{fmt(ulip.maturity)}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>Charges paid: {fmt(ulip.totalCharges)}</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>Tax-free (Sec 10(10D))</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{String.fromCodePoint(termWins ? 0x2705 : 0x1F3C6)}</div>
              <div style={{ fontSize: 11, color: termWins ? C.green : C.purple, fontWeight: 700 }}>
                {termWins ? 'TERM + MF WINS' : 'ULIP WINS'}
              </div>
              <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>by {fmt(Math.abs(advantage))}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5, marginBottom: 6 }}>TERM + MF MATURITY</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{fmt(termMF.maturity)}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>After LTCG tax: {fmt(termMF.tax)}</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>Same {fmt(coverage)} coverage</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 4 }}>CORPUS GROWTH OVER TIME</div>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 16 }}>Same annual premium, same life cover — watch the gap widen</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} interval={Math.floor(years / 5)} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80} tickFormatter={tickFmt} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'ulip' ? 'ULIP' : 'Term + MF']}
                contentStyle={{ background: '#0a1828', border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'ulip' ? 'ULIP corpus' : 'Term + MF corpus'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <Line type="monotone" dataKey="ulip"   stroke={C.purple} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="termMF" stroke={C.green}  strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key facts */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 16 }}>WHY TERM + MF ALMOST ALWAYS WINS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 10 }}>
            {[
              ['ULIP charges are layered', 'Premium allocation charge, fund management charge, mortality charge and policy admin charge all compound against you. Total charges over 20 years can exceed the original investment.'],
              ['Term insurance is cheap', 'A ₹1 Cr term cover for a 30-year-old costs under ₹10,000/year. ULIPs bundle expensive insurance you are overpaying for.'],
              ['Flexibility matters', 'With Term + MF you can switch funds, top up, withdraw partially or stop without penalties. ULIPs have 5-year lock-ins and surrender charges.'],
              ['When ULIP can make sense', 'If you have maxed out 80C and need tax-free maturity beyond ₹1.5L, ULIPs have niche use. For most people, Term + MF is clearly better.'],
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
