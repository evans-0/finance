import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
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
        style={{ width: '100%', marginTop: 6, accentColor: C.amber }} />
      {label.includes(INR) && value > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>{fmt(value)}</div>}
    </div>
  )
}

function StatBox({ label, value, color, sub }) {
  return (
    <div style={{ background: C.bg, border: '1px solid ' + (color ? color : C.border), borderRadius: 3, padding: '14px 16px', flex: 1 }}>
      <div style={{ fontSize: 11, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

const COMMON_ITEMS = [
  { name: 'Monthly Groceries',     price: 8000   },
  { name: 'School Fees / year',    price: 80000  },
  { name: 'Medical Insurance',     price: 20000  },
  { name: 'Rent (2BHK city)',      price: 25000  },
  { name: 'Car (mid-segment)',     price: 1200000},
  { name: 'Home (metro, 2BHK)',    price: 8000000},
]

export default function Inflation() {
  const [amount,    setAmount]    = useState(100000)
  const [inflation, setInflation] = useState(6)
  const [returns,   setReturns]   = useState(6.5)
  const [years,     setYears]     = useState(20)
  const [goalCost,  setGoalCost]  = useState(500000)
  const [goalYears, setGoalYears] = useState(10)

  // Core calculations
  const futureValue      = amount * Math.pow(1 + inflation / 100, years)
  const purchasingPower  = amount / Math.pow(1 + inflation / 100, years)
  const realReturn       = ((1 + returns / 100) / (1 + inflation / 100) - 1) * 100
  const futureGoalCost   = goalCost * Math.pow(1 + inflation / 100, goalYears)
  const monthlySavingsNeeded = futureGoalCost * (inflation / 12 / 100) /
    (Math.pow(1 + inflation / 100 / 12, goalYears * 12) - 1) // SIP needed at inflation rate

  // Chart data: purchasing power decay + nominal value
  const chartData = Array.from({ length: years + 1 }, (_, i) => ({
    year:      'Yr ' + i,
    nominal:   Math.round(amount),
    real:      Math.round(amount / Math.pow(1 + inflation / 100, i)),
    savings:   Math.round(amount * Math.pow(1 + returns / 100, i)),
  }))

  const tickFmt = v => v >= 10000000 ? INR+(v/10000000).toFixed(1)+'Cr' : v >= 100000 ? INR+(v/100000).toFixed(1)+'L' : INR+(v/1000).toFixed(0)+'K'

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Inflation Impact</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>See how inflation silently erodes the value of your money over time</p>
        </div>

        {/* Education banner */}
        <div style={{ background: '#0a0c10', border: '1px solid ' + C.amber, borderRadius: 4, padding: '14px 16px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>{String.fromCodePoint(0x1F4C9)}</span>
          <div style={{ fontSize: 11, color: '#ffd580', lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>Inflation is the invisible tax.</strong> At 6% annual inflation,
            {' '}{fmt(amount)} today will have the purchasing power of just {fmt(Math.round(amount / Math.pow(1.06, years)))} in {years} years.
            Your money looks the same — but buys far less.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          {/* Inputs */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>INPUTS</div>
            <InputField label={'AMOUNT TODAY (' + INR + ')'} value={amount} onChange={setAmount} min={1000} max={10000000} step={10000} />
            <InputField label="INFLATION RATE" value={inflation} onChange={setInflation} min={1} max={15} step={0.5} suffix="% p.a."
              hint="India avg: 5-7%" />
            <InputField label="YOUR SAVINGS RETURN" value={returns} onChange={setReturns} min={1} max={20} step={0.5} suffix="% p.a."
              hint="FD: ~7%, MF: ~12%" />
            <InputField label="TIME PERIOD" value={years} onChange={setYears} min={1} max={40} step={1} suffix="YRS" />
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: C.panel, border: '1px solid ' + C.red, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.5, marginBottom: 12 }}>PURCHASING POWER AFTER {years} YEARS</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <StatBox label="TODAY'S VALUE"   value={fmt(amount)}                  />
                <StatBox label="FUTURE EQUIVALENT" value={fmt(purchasingPower)} color={C.red}
                  sub={'Lost ' + (100 - purchasingPower / amount * 100).toFixed(1) + '% of value'} />
              </div>
            </div>

            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 12 }}>TO MATCH INFLATION YOU NEED</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <StatBox label="NOMINAL AMOUNT NEEDED" value={fmt(futureValue)} color={C.amber}
                  sub={'= same buying power as ' + fmt(amount) + ' today'} />
                <StatBox label="REAL RETURN ON SAVINGS"
                  value={realReturn > 0 ? '+' + fmtP(realReturn) : fmtP(realReturn)}
                  color={realReturn > 0 ? C.green : C.red}
                  sub={returns + '% return - ' + inflation + '% inflation'} />
              </div>
            </div>

            {realReturn <= 0 && (
              <div style={{ background: '#1a0a0a', border: '1px solid ' + C.red, borderRadius: 3, padding: 12, fontSize: 11, color: '#ffaaaa', lineHeight: 1.7 }}>
                {String.fromCodePoint(0x26A0)} Your savings return ({returns}%) is below inflation ({inflation}%).
                You are <strong style={{ color: C.red }}>losing real wealth</strong> even while earning interest.
                Consider equity investments for inflation-beating returns.
              </div>
            )}

            {realReturn > 0 && (
              <div style={{ background: '#0a1a0a', border: '1px solid ' + C.green, borderRadius: 3, padding: 12, fontSize: 11, color: '#aaffaa', lineHeight: 1.7 }}>
                {String.fromCodePoint(0x2705)} Your savings are growing faster than inflation by {fmtP(realReturn)}.
                Over {years} years your {fmt(amount)} grows to {fmt(Math.round(amount * Math.pow(1 + returns/100, years)))} in nominal terms.
              </div>
            )}
          </div>
        </div>

        {/* Purchasing power chart */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 4 }}>PURCHASING POWER vs SAVINGS GROWTH</div>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 16 }}>
            Red = real value of {fmt(amount)} · Green = savings at {returns}% · Flat amber = nominal value (illusion)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} interval={Math.floor(years / 5)} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80} tickFormatter={tickFmt} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'real' ? 'Purchasing Power' : name === 'savings' ? 'Savings Value' : 'Nominal (unchanged)']}
                contentStyle={{ background: '#0a1828', border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'real' ? 'Purchasing Power' : v === 'savings' ? 'Savings at ' + returns + '%' : 'Nominal Value'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <Line type="monotone" dataKey="nominal" stroke={C.amber}  strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="real"    stroke={C.red}    strokeWidth={2}   dot={false} />
              <Line type="monotone" dataKey="savings" stroke={C.green}  strokeWidth={2}   dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goal cost inflator */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 4 }}>GOAL COST INFLATOR</div>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 20 }}>How much will something cost in the future?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
            <div>
              <InputField label={'CURRENT COST (' + INR + ')'} value={goalCost} onChange={setGoalCost} min={1000} max={50000000} step={10000} />
              <InputField label="YEARS FROM NOW" value={goalYears} onChange={setGoalYears} min={1} max={30} step={1} suffix="YRS" />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {COMMON_ITEMS.map(item => (
                  <button key={item.name} onClick={() => setGoalCost(item.price)}
                    style={{ background: C.bg, border: '1px solid ' + C.border, color: C.textSec, padding: '4px 8px', fontSize: 11, fontFamily: MONO, cursor: 'pointer', borderRadius: 2, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              <div style={{ background: C.bg, border: '1px solid ' + C.amber, borderRadius: 3, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>WILL COST IN {goalYears} YEARS</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>{fmt(Math.round(futureGoalCost))}</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
                  {((futureGoalCost / goalCost - 1) * 100).toFixed(0)}% more than today's {fmt(goalCost)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common items table */}
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 16 }}>EVERYDAY ITEMS — TODAY vs {goalYears} YEARS AT {inflation}% INFLATION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', overflowX: 'auto', gap: 0 }}>
            {['ITEM', 'TODAY', 'IN ' + goalYears + ' YEARS', 'INCREASE'].map(h => (
              <div key={h} style={{ fontSize: 11, color: C.textDim, padding: '6px 8px', borderBottom: '1px solid ' + C.border, letterSpacing: 0.5 }}>{h}</div>
            ))}
            {COMMON_ITEMS.map(item => {
              const future = Math.round(item.price * Math.pow(1 + inflation / 100, goalYears))
              return [
                <div key={item.name + '0'} style={{ fontSize: 11, color: C.text, padding: '8px 8px', borderBottom: '1px solid ' + C.border }}>{item.name}</div>,
                <div key={item.name + '1'} style={{ fontSize: 11, color: C.textSec, padding: '8px 8px', borderBottom: '1px solid ' + C.border }}>{fmt(item.price)}</div>,
                <div key={item.name + '2'} style={{ fontSize: 11, color: C.amber, padding: '8px 8px', borderBottom: '1px solid ' + C.border, fontWeight: 600 }}>{fmt(future)}</div>,
                <div key={item.name + '3'} style={{ fontSize: 11, color: C.red, padding: '8px 8px', borderBottom: '1px solid ' + C.border }}>+{((future / item.price - 1) * 100).toFixed(0)}%</div>,
              ]
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
