import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { C, MONO } from './markets/shared'

const TOPICS = [
  {
    to: '/how-markets-work/equity',
    icon: '📈',
    title: 'Equity Market',
    desc: 'What happens when you click Buy. Order flow, bid-ask spread, price discovery, order types, market participants, and NSE trading hours.',
    sections: ['Trade lifecycle', 'Order book', 'Price discovery', 'Order types', 'Market participants', 'Trading hours'],
    color: C.green,
  },
  {
    to: '/how-markets-work/bonds',
    icon: '🏛️',
    title: 'Bond Market',
    desc: 'How bonds work, why prices and interest rates move in opposite directions, and what Indian bonds you can actually buy.',
    sections: ['What is a bond', 'Yield vs price demo', 'G-Secs, T-Bills, SGBs', "RBI's role"],
    color: C.blue,
  },
  {
    to: '/how-markets-work/derivatives',
    icon: '⚖️',
    title: 'Derivatives',
    desc: 'Futures vs options, interactive payoff builder, margin and leverage, and why 89% of retail F&O traders lose money.',
    sections: ['Futures vs options', 'Payoff builder', 'How margins work', 'SEBI loss data', 'Legitimate use cases'],
    color: C.purple,
  },
  {
    to: '/how-markets-work/mutual-funds',
    icon: '🏢',
    title: 'Mutual Funds',
    desc: 'How pooled investing works, the expense ratio drag, SEBI fund categories, reading a factsheet, and direct vs regular plans.',
    sections: ['Fund structure', 'Active vs passive', 'SEBI categories', 'Reading a factsheet', 'Regular vs direct'],
    color: C.amber,
  },
  {
    to: '/how-markets-work/personal-finance',
    icon: '💰',
    title: 'Personal Finance',
    desc: 'The foundation before any investing: budgeting, emergency fund, debt payoff strategies, and insurance guide.',
    sections: ['50/30/20 rule', 'Emergency fund', 'Avalanche vs snowball', 'Insurance guide'],
    color: C.red,
  },
]

export default function HowMarketsWork() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>EDUCATION</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>How Markets Work</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            Five interactive explainers covering how financial markets actually function — from the moment you click "Buy" to understanding derivatives, mutual funds, and personal finance fundamentals.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TOPICS.map((topic, i) => (
            <Link key={topic.to} to={topic.to} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, transition: 'border-color 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = topic.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{topic.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 9, color: topic.color, letterSpacing: 2 }}>0{i + 1}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{topic.title}</div>
                      <div style={{ marginLeft: 'auto', fontSize: 11, color: topic.color }}>→</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, marginBottom: 14 }}>{topic.desc}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {topic.sections.map(s => (
                        <span key={s} style={{ fontSize: 10, color: C.textSec, border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 2, letterSpacing: 0.5 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Ready to apply this?</div>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 20 }}>Use our calculators to plan investments, or look up terms in the glossary.</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/calculators" style={{ background: C.amber, color: '#020c18', padding: '10px 24px', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, borderRadius: 3 }}>CALCULATORS →</Link>
            <Link to="/glossary"    style={{ background: 'transparent', color: C.amber, padding: '10px 24px', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, borderRadius: 3, border: `1px solid ${C.amber}` }}>GLOSSARY →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
