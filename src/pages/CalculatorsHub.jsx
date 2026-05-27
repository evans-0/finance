import { Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const CALCULATORS = [
  {
    to: '/calculators/sip',
    icon: '\ud83d\udcc5',
    name: 'SIP Calculator',
    desc: 'Calculate the future value of your systematic investment plan. Includes step-up and expense ratio.',
    tags: ['Investing', 'Mutual Funds', 'Long Term'],
  },
  {
    to: '/calculators/emi',
    icon: '\ud83c\udfe6',
    name: 'EMI Calculator',
    desc: 'Calculate your monthly loan repayments for home, car, or personal loans. Understand total interest payable.',
    tags: ['Loans', 'Debt', 'Banking'],
  },
  {
    to: '/calculators/compound',
    icon: '\ud83d\udcc8',
    name: 'Compound Interest',
    desc: 'See the power of compounding across different frequencies. Compare annual, quarterly and monthly compounding.',
    tags: ['Growth', 'Savings', 'FD/RD'],
  },
  {
    to: '/calculators/returns',
    icon: '\ud83d\udcb9',
    name: 'Stock Returns',
    desc: 'Analyse trade performance including brokerage, taxes. Calculate absolute return, CAGR and profit/loss.',
    tags: ['Stocks', 'Trading', 'P&L'],
  },
  {
    to: '/calculators/portfolio',
    icon: '\ud83e\udd67',
    name: 'Portfolio Allocator',
    desc: 'Enter your holdings and visualise allocation. See which stocks dominate your portfolio and rebalance.',
    tags: ['Portfolio', 'Allocation', 'Diversification'],
  },
  {
    to: '/calculators/options',
    icon: '\u2696\ufe0f',
    name: 'Options P&L',
    desc: 'Calculate call and put option payoffs at expiry. Find breakeven points and max profit/loss scenarios.',
    tags: ['Derivatives', 'Options', 'F&O'],
  },
  {
    to: '/calculators/networth',
    icon: '\ud83d\udcb0',
    name: 'Net Worth Calculator',
    desc: 'Track assets and liabilities to know your true financial position. Visualise allocation with charts.',
    tags: ['Wealth', 'Personal Finance', 'Planning'],
  },
  {
    to: '/calculators/creditcard',
    icon: String.fromCodePoint(0x1F4B3),
    name: 'Credit Card Calculator',
    desc: 'See the true cost of carrying a balance. Understand why 2%/month is actually 26.82% per year.',
    tags: ['Credit Card', 'Debt', 'Financial Literacy'],
  },
  {
    to: '/calculators/inflation',
    icon: String.fromCodePoint(0x1F4C9),
    name: 'Inflation Impact',
    desc: 'See how inflation silently erodes your purchasing power. Understand real returns and goal inflation.',
    tags: ['Inflation', 'Purchasing Power', 'Financial Literacy'],
  },
  {
    to: '/calculators/fdvsmf',
    icon: String.fromCodePoint(0x1F4CA),
    name: 'FD vs Mutual Fund',
    desc: 'Post-tax, inflation-adjusted comparison. See why FD tax drag makes a massive difference over 10+ years.',
    tags: ['FD', 'Mutual Fund', 'Tax', 'Comparison'],
  },
  {
    to: '/calculators/ulipvstermmf',
    icon: String.fromCodePoint(0x1F6E1),
    name: 'ULIP vs Term + MF',
    desc: 'See why mixing insurance with investment costs you lakhs. Compare ULIP charges vs buying them separately.',
    tags: ['ULIP', 'Term Insurance', 'Financial Literacy'],
  },
  {
  to: '/calculators/buyvsrent',
  icon: String.fromCodePoint(0x1F3E0),
  name: 'Buy vs Rent',
  desc: 'Compare true cost of buying vs renting. Includes opportunity cost of down payment, tax benefits, and net worth trajectory. Supports US and India.',
  tags: ['Real Estate', 'Personal Finance', 'Planning'],
  },
  {
  to: '/calculators/fire',
  icon: String.fromCodePoint(0x1F525),
  name: 'FIRE Calculator',
  desc: 'Find your Financial Independence number. Includes Lean/Regular/Fat FIRE variants, Coast FIRE point, savings rate analysis, and corpus trajectory.',
  tags: ['FIRE', 'Retirement', 'Personal Finance'],
  },
  {
  to: '/calculators/futurenetworth',
  icon: String.fromCodePoint(0x1F4C8),
  name: 'Future Net Worth',
  desc: 'Full balance sheet projection. Each asset grows at its own rate, each liability amortises via EMI. See where you stand in 10, 20, 30 years.',
  tags: ['Net Worth', 'Planning', 'Personal Finance'],
  },
]

export default function CalculatorsHub() {
  const [query, setQuery] = useState('')
  const filtered = CALCULATORS.filter(c =>
    query === '' ||
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 10 }}>CALCULATORS</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>Financial Calculators</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
            Twelve calculators for investors and traders. Plan investments, analyse trades, and make better financial decisions.
          </p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search calculators..." aria-label="Search calculators"
            style={{ width: '100%', background: C.panel, border: `1px solid ${query ? C.amber : C.border}`, color: C.text, padding: '10px 40px 10px 16px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
          />
          {query
            ? <button onClick={() => setQuery('')} aria-label='Clear search' style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: C.textSec, fontSize: 16, background: 'none', border: 'none', padding: 0 }}>×</button>
            : <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSec, fontSize: 12 }}>🔍</span>
          }
        </div>
        {filtered.length === 0 && (
          <div style={{ fontSize: 12, color: C.textSec, textAlign: 'center', padding: '40px 0' }}>
            No calculators found for "{query}"
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(calc => (
            <Link key={calc.to} to={calc.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: C.panel, border: '1px solid ' + C.border, borderRadius: 4,
                padding: '24px', height: '100%', boxSizing: 'border-box', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.amber}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{calc.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.amber, marginBottom: 10 }}>{calc.name}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8, marginBottom: 16 }}>{calc.desc}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {calc.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, color: C.textSec, border: '1px solid ' + C.border,
                      padding: '2px 6px', borderRadius: 2, letterSpacing: 0.5,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
