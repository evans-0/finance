import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', blue: '#4fc3f7', green: '#00e676',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const fmtIN = n => {
  if (!n || n === 0) return '0'
  const abs = Math.abs(Math.round(n))
  if (abs >= 1e7) return (n / 1e7).toFixed(2) + ' Cr'
  if (abs >= 1e5) return (n / 1e5).toFixed(1) + ' L'
  const s = abs.toString()
  if (s.length <= 3) return s
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const parts = []
  for (let i = rest.length; i > 0; i -= 2) parts.unshift(rest.slice(Math.max(0, i - 2), i))
  return parts.join(',') + ',' + last3
}
const fmtUS = n => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return '$' + Math.round(n / 1e3) + 'K'
  return '$' + Math.round(n)
}

const DEFAULTS = {
  us: { price: 500000, down: 20, rate: 6.8, term: 30, propTax: 1.2, hoa: 0, insurance: 150, maintenance: 1, rent: 2800, rentGrowth: 3, appreciation: 4, investReturn: 8, years: 10 },
  in: { price: 8000000, down: 20, rate: 8.75, term: 20, stampDuty: 6, registration: 1, maintenance: 5000, sec24: true, taxBracket: 30, rent: 25000, rentGrowth: 5, appreciation: 7, investReturn: 12, years: 10 },
}

function calcEMI(principal, annualRate, months) {
  const r = annualRate / 100 / 12
  if (r === 0) return principal / months
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function computeUS(p) {
  const price = p.price
  const down = price * (p.down / 100)
  const loan = price - down
  const emi = calcEMI(loan, p.rate, p.term * 12)
  const propTaxMo = (price * p.propTax) / 100 / 12
  const maintMo = (price * p.maintenance) / 100 / 12
  const totalBuyMo = emi + propTaxMo + maintMo + p.hoa + p.insurance
  const invR = p.investReturn / 100
  const loanR = p.rate / 100 / 12
  let bal = loan, rentMo = p.rent
  const data = []
  for (let yr = 1; yr <= p.years; yr++) {
    for (let m = 0; m < 12; m++) { bal -= emi - bal * loanR }
    bal = Math.max(bal, 0)
    const homeVal = price * Math.pow(1 + p.appreciation / 100, yr)
    const buyNW = homeVal - bal
    const oppGrowth = down * Math.pow(1 + invR, yr)
    const savings = totalBuyMo - rentMo
    const rentNW = oppGrowth + (savings > 0 ? savings * 12 * (Math.pow(1 + invR, yr) - 1) / invR : 0)
    data.push({ year: `Yr ${yr}`, buyNW: Math.round(buyNW), rentNW: Math.round(rentNW) })
    rentMo *= (1 + p.rentGrowth / 100)
  }
  return { totalBuyMo, rent0: p.rent, down, data }
}

function computeIN(p) {
  const price = p.price
  const stampRegAmt = price * ((p.stampDuty + p.registration) / 100)
  const downCash = price * (p.down / 100)
  const totalUpfront = downCash + stampRegAmt
  const loan = price - downCash
  const emi = calcEMI(loan, p.rate, p.term * 12)
  const annualInterest = loan * (p.rate / 100)
  const sec24Benefit = p.sec24 ? (Math.min(annualInterest, 200000) * (p.taxBracket / 100)) / 12 : 0
  const totalBuyMo = emi + p.maintenance - sec24Benefit
  const invR = p.investReturn / 100
  const loanR = p.rate / 100 / 12
  let bal = loan, rentMo = p.rent
  const data = []
  for (let yr = 1; yr <= p.years; yr++) {
    for (let m = 0; m < 12; m++) { bal -= emi - bal * loanR }
    bal = Math.max(bal, 0)
    const homeVal = price * Math.pow(1 + p.appreciation / 100, yr)
    const buyNW = homeVal - bal
    const oppGrowth = totalUpfront * Math.pow(1 + invR, yr)
    const savings = totalBuyMo - rentMo
    const rentNW = oppGrowth + (savings > 0 ? savings * 12 * (Math.pow(1 + invR, yr) - 1) / invR : 0)
    data.push({ year: `Yr ${yr}`, buyNW: Math.round(buyNW), rentNW: Math.round(rentNW) })
    rentMo *= (1 + p.rentGrowth / 100)
  }
  return { totalBuyMo, rent0: p.rent, down: totalUpfront, data }
}

function InputField({ label, value, onChange, min, max, step = 1, suffix, isCurrency, mode }) {
  const displayVal = isCurrency
    ? (mode === 'in' ? '₹' + fmtIN(value) : fmtUS(value))
    : null
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} min={min} max={max} step={step}
          style={{ flex: 1, background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      {isCurrency && value > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>{displayVal}</div>}
      <input type="range" value={value} onChange={e => onChange(parseFloat(e.target.value))} min={min} max={max} step={step}
        style={{ width: '100%', marginTop: 6, accentColor: C.amber }} />
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '16px 20px' }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.amber }}>{value}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.panel, border: '1px solid ' + C.border, padding: '10px 14px', fontSize: 11, fontFamily: MONO }}>
      <div style={{ color: C.textSec, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name === 'buyNW' ? 'BUY' : 'RENT'}: {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function BuyVsRent() {
  const [mode, setMode] = useState('us')
  const [usP, setUsP] = useState(DEFAULTS.us)
  const [inP, setInP] = useState(DEFAULTS.in)

  const setUs = key => val => setUsP(p => ({ ...p, [key]: val }))
  const setIn = key => val => setInP(p => ({ ...p, [key]: val }))

  const result = useMemo(() => mode === 'us' ? computeUS(usP) : computeIN(inP), [mode, usP, inP])
  const { totalBuyMo, rent0, data } = result
  const years = mode === 'us' ? usP.years : inP.years
  const fmt = mode === 'us' ? fmtUS : n => '₹' + fmtIN(n)
  const last = data[data.length - 1] || {}
  const buyWins = (last.buyNW || 0) > (last.rentNW || 0)
  const gap = Math.abs((last.buyNW || 0) - (last.rentNW || 0))
  const breakEvenIdx = data.findIndex(d => d.buyNW >= d.rentNW)

  const sectionStyle = { fontSize: 10, color: C.amber, letterSpacing: 2, marginBottom: 14, marginTop: 28 }
  const divider = <div style={{ borderTop: '1px solid ' + C.border, margin: '24px 0' }} />

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginTop: 20, marginBottom: 10 }}>CALCULATORS</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>Buy vs Rent</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 600 }}>
            Compare the true cost of buying vs renting — including opportunity cost of your down payment, tax benefits, and net worth over time.
          </p>
        </div>

        {/* Country Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 36, border: '1px solid ' + C.border, borderRadius: 3, width: 'fit-content', overflow: 'hidden' }}>
          {[['us', '🇺🇸  United States'], ['in', '🇮🇳  India']].map(([key, label]) => (
            <button key={key} onClick={() => setMode(key)} style={{
              padding: '9px 24px', background: mode === key ? C.amber : 'transparent',
              color: mode === key ? C.bg : C.textSec, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: MONO, fontWeight: mode === key ? 700 : 400, letterSpacing: 1,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, alignItems: 'start' }}>

          {/* LEFT: Inputs */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>

            {mode === 'us' && <>
              <div style={sectionStyle}>PROPERTY</div>
              <InputField label="HOME PRICE ($)" value={usP.price} onChange={setUs('price')} min={50000} max={5000000} step={10000} isCurrency mode="us" />
              <InputField label="DOWN PAYMENT (%)" value={usP.down} onChange={setUs('down')} min={3} max={80} step={1} suffix="%" />
              <InputField label="MORTGAGE RATE (%)" value={usP.rate} onChange={setUs('rate')} min={2} max={15} step={0.1} suffix="%" />
              <InputField label="LOAN TERM (YRS)" value={usP.term} onChange={setUs('term')} min={10} max={30} step={5} suffix="yrs" />
              <InputField label="PROPERTY TAX (%/YR)" value={usP.propTax} onChange={setUs('propTax')} min={0} max={5} step={0.1} suffix="%" />
              <InputField label="HOA ($/MO)" value={usP.hoa} onChange={setUs('hoa')} min={0} max={2000} step={50} />
              <InputField label="INSURANCE ($/MO)" value={usP.insurance} onChange={setUs('insurance')} min={0} max={1000} step={10} />
              <InputField label="MAINTENANCE (%/YR)" value={usP.maintenance} onChange={setUs('maintenance')} min={0} max={3} step={0.1} suffix="%" />
              {divider}
              <div style={sectionStyle}>RENT & ASSUMPTIONS</div>
              <InputField label="MONTHLY RENT ($)" value={usP.rent} onChange={setUs('rent')} min={500} max={20000} step={100} isCurrency mode="us" />
              <InputField label="RENT GROWTH (%/YR)" value={usP.rentGrowth} onChange={setUs('rentGrowth')} min={0} max={10} step={0.5} suffix="%" />
              <InputField label="HOME APPRECIATION (%/YR)" value={usP.appreciation} onChange={setUs('appreciation')} min={0} max={10} step={0.5} suffix="%" />
              <InputField label="INVESTMENT RETURN (%/YR)" value={usP.investReturn} onChange={setUs('investReturn')} min={1} max={20} step={0.5} suffix="%" />
              <InputField label="TIME HORIZON (YRS)" value={usP.years} onChange={setUs('years')} min={1} max={30} step={1} suffix="yrs" />
            </>}

            {mode === 'in' && <>
              <div style={sectionStyle}>PROPERTY</div>
              <InputField label="PROPERTY PRICE (₹)" value={inP.price} onChange={setIn('price')} min={1000000} max={100000000} step={500000} isCurrency mode="in" />
              <InputField label="DOWN PAYMENT (%)" value={inP.down} onChange={setIn('down')} min={10} max={80} step={1} suffix="%" />
              <InputField label="HOME LOAN RATE (%)" value={inP.rate} onChange={setIn('rate')} min={6} max={15} step={0.1} suffix="%" />
              <InputField label="LOAN TERM (YRS)" value={inP.term} onChange={setIn('term')} min={5} max={30} step={5} suffix="yrs" />
              <InputField label="STAMP DUTY (%)" value={inP.stampDuty} onChange={setIn('stampDuty')} min={2} max={10} step={0.5} suffix="%" />
              <InputField label="REGISTRATION (%)" value={inP.registration} onChange={setIn('registration')} min={0} max={3} step={0.1} suffix="%" />
              <InputField label="MAINTENANCE (₹/MO)" value={inP.maintenance} onChange={setIn('maintenance')} min={0} max={50000} step={500} isCurrency mode="in" />

              {/* Section 24 toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', marginBottom: 12, borderBottom: '1px solid ' + C.border }}>
                <div>
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>SECTION 24 DEDUCTION</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>₹2L cap — self-occupied</div>
                </div>
                <div onClick={() => setIn('sec24')(!inP.sec24)} style={{ width: 42, height: 22, borderRadius: 11, cursor: 'pointer', background: inP.sec24 ? C.amber : C.border, position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: inP.sec24 ? C.bg : C.textSec, position: 'absolute', top: 2, left: inP.sec24 ? 22 : 2, transition: 'left 0.2s' }} />
                </div>
              </div>

              {/* Tax bracket */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>TAX BRACKET</label>
                <select value={inP.taxBracket} onChange={e => setIn('taxBracket')(parseInt(e.target.value))}
                  style={{ width: '100%', background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }}>
                  <option value={5}>5%</option>
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                </select>
              </div>

              {divider}
              <div style={sectionStyle}>RENT & ASSUMPTIONS</div>
              <InputField label="MONTHLY RENT (₹)" value={inP.rent} onChange={setIn('rent')} min={5000} max={500000} step={1000} isCurrency mode="in" />
              <InputField label="RENT GROWTH (%/YR)" value={inP.rentGrowth} onChange={setIn('rentGrowth')} min={0} max={15} step={0.5} suffix="%" />
              <InputField label="HOME APPRECIATION (%/YR)" value={inP.appreciation} onChange={setIn('appreciation')} min={0} max={15} step={0.5} suffix="%" />
              <InputField label="INVESTMENT RETURN (%/YR)" value={inP.investReturn} onChange={setIn('investReturn')} min={1} max={25} step={0.5} suffix="%" />
              <InputField label="TIME HORIZON (YRS)" value={inP.years} onChange={setIn('years')} min={1} max={30} step={1} suffix="yrs" />
            </>}
          </div>

          {/* RIGHT: Results */}
          <div>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <StatBox label="MONTHLY COST: BUY" value={fmt(totalBuyMo)} color={C.blue} />
              <StatBox label="MONTHLY COST: RENT" value={fmt(rent0)} color={C.green} />
              <StatBox label={`NET WORTH GAP · YR ${years}`} value={fmt(gap)} color={buyWins ? C.green : '#ef5350'} />
            </div>

            {/* Verdict */}
            <div style={{ background: C.panel, border: `1px solid ${buyWins ? C.green : '#ef5350'}`, borderRadius: 4, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: buyWins ? C.green : '#ef5350', marginBottom: 6 }}>
                {buyWins ? '▲ BUYING LEADS' : '▼ RENTING LEADS'} OVER {years} YEARS
              </div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
                {breakEvenIdx >= 0
                  ? `Buy breaks even at year ${breakEvenIdx + 1}. Net worth advantage at year ${years}: ${fmt(gap)}.`
                  : `Renting stays ahead for the full ${years}-year window. Down payment invested in the market outpaces home equity gain.`
                }
                {' '}{totalBuyMo > rent0
                  ? `Owning costs ${fmt(totalBuyMo - rent0)}/mo more.`
                  : `Owning costs ${fmt(rent0 - totalBuyMo)}/mo less.`
                }
              </div>
            </div>

            {/* Chart */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '20px 16px 12px' }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2, marginBottom: 16 }}>NET WORTH OVER TIME</div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                {[['BUY', C.blue], ['RENT', C.green]].map(([label, color]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSec }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                    {label}
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }} tickFormatter={v => fmt(v)} width={72} />
                  <Tooltip content={<CustomTooltip fmt={fmt} />} />
                  <Line type="monotone" dataKey="buyNW" stroke={C.blue} strokeWidth={2} dot={false} name="buyNW" />
                  <Line type="monotone" dataKey="rentNW" stroke={C.green} strokeWidth={2} dot={false} name="rentNW" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Opportunity cost note */}
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 12, lineHeight: 1.6 }}>
              * Opportunity cost: {fmt(result.down)} upfront deployed → invested at {mode === 'us' ? usP.investReturn : inP.investReturn}%/yr
              = {fmt(result.down * Math.pow(1 + (mode === 'us' ? usP.investReturn : inP.investReturn) / 100, years))} in {years} yrs.
              {mode === 'in' && ' Includes stamp duty + registration in upfront cost.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
