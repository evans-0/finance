import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const CALCULATORS = [
  {
    to: '/calculators/sip',
    icon: '📅',
    name: 'SIP Calculator',
    desc: 'Calculate the future value of your systematic investment plan. See how small monthly investments grow over time.',
    tags: ['Investing', 'Mutual Funds', 'Long Term'],
  },
  {
    to: '/calculators/emi',
    icon: '🏦',
    name: 'EMI Calculator',
    desc: 'Calculate your monthly loan repayments for home, car, or personal loans. Understand total interest payable.',
    tags: ['Loans', 'Debt', 'Banking'],
  },
  {
    to: '/calculators/compound',
    icon: '📈',
    name: 'Compound Interest',
    desc: 'See the power of compounding across different frequencies. Compare annual, quarterly and monthly compounding.',
    tags: ['Growth', 'Savings', 'FD/RD'],
  },
  {
    to: '/calculators/returns',
    icon: '💹',
    name: 'Stock Returns',
    desc: 'Analyse trade performance including brokerage, taxes. Calculate absolute return, CAGR and profit/loss.',
    tags: ['Stocks', 'Trading', 'P&L'],
  },
  {
    to: '/calculators/portfolio',
    icon: '🥧',
    name: 'Portfolio Allocator',
    desc: 'Enter your holdings and visualise allocation. See which stocks dominate your portfolio and rebalance.',
    tags: ['Portfolio', 'Allocation', 'Diversification'],
  },
  {
    to: '/calculators/options',
    icon: '⚖️',
    name: 'Options P&L',
    desc: 'Calculate call and put option payoffs at expiry. Find breakeven points and max profit/loss scenarios.',
    tags: ['Derivatives', 'Options', 'F&O'],
  },
]

export default function CalculatorsHub() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 10 }}>CALCULATORS</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>Financial Calculators</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
            Six calculators for investors and traders. Plan investments, analyse trades, and make better financial decisions.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {CALCULATORS.map(calc => (
            <Link key={calc.to} to={calc.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4,
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
                      fontSize: 9, color: C.textSec, border: `1px solid ${C.border}`,
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
