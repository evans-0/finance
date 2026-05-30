import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
  green: '#00e676', red: '#ff3c5c', blue: '#4fc3f7',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

// Map terms to relevant calculators on the site
const CALCULATOR_MAP = {
  'SIP': { label: 'SIP Calculator', to: '/calculators/sip' },
  'CAGR': { label: 'Stock Returns Calculator', to: '/calculators/stockreturn' },
  'EMI': { label: 'EMI Calculator', to: '/calculators/emi' },
  'Amortisation': { label: 'EMI Calculator', to: '/calculators/emi' },
  'Principal': { label: 'EMI Calculator', to: '/calculators/emi' },
  'Prepayment': { label: 'EMI Calculator', to: '/calculators/emi' },
  'Expense Ratio': { label: 'SIP Calculator', to: '/calculators/sip' },
  'NAV': { label: 'MF NAV Lookup', to: '/mf-nav' },
  'ELSS': { label: 'SIP Calculator', to: '/calculators/sip' },
  'Compounding': { label: 'Compound Interest Calculator', to: '/calculators/compound' },
  'Credit Score': { label: 'Credit Card Calculator', to: '/calculators/creditcard' },
  'Credit Utilisation': { label: 'Credit Card Calculator', to: '/calculators/creditcard' },
  'Options': { label: 'Options P&L Calculator', to: '/calculators/options' },
  'Call Option': { label: 'Options P&L Calculator', to: '/calculators/options' },
  'Put Option': { label: 'Options P&L Calculator', to: '/calculators/options' },
  'Futures': { label: 'Options P&L Calculator', to: '/calculators/options' },
  'Net Worth': { label: 'Net Worth Calculator', to: '/calculators/networth' },
  'FIRE': { label: 'FIRE Calculator', to: '/calculators/fire' },
  'Inflation': { label: 'Inflation Impact Calculator', to: '/calculators/inflation' },
  'Alpha': { label: 'Stock Returns Calculator', to: '/calculators/stockreturn' },
  'Beta': { label: 'Stock Returns Calculator', to: '/calculators/stockreturn' },
}

const TERMS = [
  // Investing
  { term: 'CAGR', full: 'Compound Annual Growth Rate', category: 'Investing', definition: 'The rate at which an investment grows each year over a given period, assuming profits are reinvested. Formula: (End Value / Start Value)^(1/Years) - 1. A ₹1 lakh investment growing to ₹2 lakh in 6 years has a CAGR of ~12.2%.' },
  { term: 'NAV', full: 'Net Asset Value', category: 'Investing', definition: 'The per-unit price of a mutual fund. Calculated as (Total Assets - Liabilities) / Number of Units. When you invest ₹5,000 in a fund with NAV of ₹50, you get 100 units.' },
  { term: 'Expense Ratio', full: 'Expense Ratio', category: 'Investing', definition: 'The annual fee a mutual fund charges to manage your money, expressed as a percentage of your investment. A 1% expense ratio on ₹1 lakh means ₹1,000 is deducted per year. Index funds typically charge 0.1–0.2%, active funds 1–2%.' },
  { term: 'SIP', full: 'Systematic Investment Plan', category: 'Investing', definition: 'A way to invest a fixed amount in mutual funds at regular intervals (weekly, monthly). Removes the need to time the market and builds discipline. ₹5,000/month for 20 years at 12% CAGR grows to over ₹49 lakhs.' },
  { term: 'Lumpsum', full: 'Lumpsum Investment', category: 'Investing', definition: 'Investing a large amount all at once instead of in instalments. Works better when markets are at lows. Riskier than SIP because bad timing can hurt returns significantly.' },
  { term: 'Diversification', full: 'Diversification', category: 'Investing', definition: 'Spreading investments across different assets, sectors, or geographies to reduce risk. If one investment falls, others may hold steady. "Don\'t put all your eggs in one basket."' },
  { term: 'Asset Allocation', full: 'Asset Allocation', category: 'Investing', definition: 'How you divide your portfolio among different asset classes — equity, debt, gold, real estate. A common rule: subtract your age from 100 to get your equity percentage. 30 years old = 70% equity.' },
  { term: 'Rebalancing', full: 'Portfolio Rebalancing', category: 'Investing', definition: 'Restoring your portfolio to its target allocation by selling over-performers and buying under-performers. If equity grows from 60% to 75% of your portfolio, you sell equity and buy debt to return to 60/40.' },
  { term: 'Benchmark', full: 'Benchmark Index', category: 'Investing', definition: 'A standard index used to measure a fund\'s performance. Nifty 50 is the benchmark for large-cap Indian funds. If a fund returns 10% while Nifty returned 14%, the fund underperformed its benchmark.' },
  { term: 'Alpha', full: 'Alpha', category: 'Investing', definition: 'The excess return of an investment above its benchmark. A fund with alpha of 3% beat its benchmark by 3%. Positive alpha means the fund manager added value; negative alpha means they destroyed it.' },
  { term: 'Beta', full: 'Beta', category: 'Investing', definition: 'A measure of how much an investment moves relative to the market. Beta of 1 = moves with the market. Beta of 1.5 = 50% more volatile. Beta of 0.5 = half as volatile. High beta = higher risk and higher potential reward.' },
  { term: 'XIRR', full: 'Extended Internal Rate of Return', category: 'Investing', definition: 'A more accurate way to calculate returns when investments are made at irregular intervals. More relevant than CAGR for SIP investments because it accounts for the timing of each instalment.' },

  // Stock Market
  { term: 'Bull Market', full: 'Bull Market', category: 'Stock Market', definition: 'A market condition where prices are rising or expected to rise, typically by 20% or more from recent lows. Characterized by investor optimism and strong economic indicators. Opposite of a bear market.' },
  { term: 'Bear Market', full: 'Bear Market', category: 'Stock Market', definition: 'A market decline of 20% or more from recent highs, lasting at least two months. Characterized by pessimism, fear, and economic slowdown. India\'s last major bear market was 2020 (COVID crash).' },
  { term: 'Market Cap', full: 'Market Capitalisation', category: 'Stock Market', definition: 'Total market value of a company\'s outstanding shares. Share Price × Total Shares = Market Cap. HDFC Bank\'s market cap of ₹12 lakh crore makes it one of India\'s most valuable companies. Large-cap: >₹20,000 crore.' },
  { term: 'P/E Ratio', full: 'Price to Earnings Ratio', category: 'Stock Market', definition: 'How much you pay for ₹1 of a company\'s earnings. P/E = Share Price / Earnings Per Share. A P/E of 20 means you pay ₹20 for every ₹1 of annual profit. Lower P/E = cheaper relative to earnings.' },
  { term: 'EPS', full: 'Earnings Per Share', category: 'Stock Market', definition: 'A company\'s net profit divided by its total number of shares. EPS of ₹50 means the company earned ₹50 for each share. Rising EPS generally drives share price higher.' },
  { term: 'Dividend', full: 'Dividend', category: 'Stock Market', definition: 'A portion of a company\'s profits distributed to shareholders. If you hold 100 shares of a company and it declares a ₹5 dividend per share, you receive ₹500. Not all companies pay dividends.' },
  { term: 'IPO', full: 'Initial Public Offering', category: 'Stock Market', definition: 'When a private company sells shares to the public for the first time. Companies raise capital, early investors exit. Indian IPO market has seen explosive growth — Zomato, Nykaa, LIC all went public via IPOs.' },
  { term: 'Circuit Breaker', full: 'Circuit Breaker', category: 'Stock Market', definition: 'An automatic halt to trading when a stock or index moves too far in one direction. NSE has 10%, 15%, and 20% circuit breakers. Prevents panic selling from spiralling out of control.' },
  { term: 'Bid-Ask Spread', full: 'Bid-Ask Spread', category: 'Stock Market', definition: 'The difference between what buyers will pay (bid) and sellers will accept (ask). A spread of ₹1 on a ₹100 stock is 1%. Liquid stocks have tight spreads (₹0.05); illiquid stocks have wide spreads.' },
  { term: 'Volume', full: 'Trading Volume', category: 'Stock Market', definition: 'The number of shares traded in a given period. High volume confirms price moves — a stock rising on high volume is more significant than one rising on low volume. Volume spikes often precede major price moves.' },

  // Mutual Funds
  { term: 'Equity Fund', full: 'Equity Mutual Fund', category: 'Mutual Funds', definition: 'A mutual fund that primarily invests in stocks. Higher risk, higher potential return. Suitable for goals 5+ years away. LTCG tax of 12.5% on gains above ₹1.25 lakh applies.' },
  { term: 'Debt Fund', full: 'Debt Mutual Fund', category: 'Mutual Funds', definition: 'A mutual fund investing in bonds, government securities, and fixed income instruments. Lower risk than equity. Returns are modest but more predictable. Suitable for short to medium-term goals.' },
  { term: 'Index Fund', full: 'Index Fund', category: 'Mutual Funds', definition: 'A passive fund that mirrors an index like Nifty 50 or Sensex. Very low expense ratio (0.1–0.2%). Most actively managed funds fail to beat index funds over the long term. Warren Buffett recommends them.' },
  { term: 'ELSS', full: 'Equity Linked Savings Scheme', category: 'Mutual Funds', definition: 'A tax-saving mutual fund with a 3-year lock-in. Investments up to ₹1.5 lakh qualify for 80C deduction under the old tax regime. Shortest lock-in among 80C investments, with equity-linked returns.' },
  { term: 'Exit Load', full: 'Exit Load', category: 'Mutual Funds', definition: 'A fee charged when you redeem mutual fund units before a specified period. A 1% exit load within 1 year means you lose 1% of your redemption value. Most equity funds waive exit load after 1 year.' },
  { term: 'AUM', full: 'Assets Under Management', category: 'Mutual Funds', definition: 'Total market value of investments managed by a fund house. Larger AUM indicates investor trust but can sometimes make it harder for a fund to generate alpha as it needs to buy large quantities.' },

  // Loans & Credit
  { term: 'EMI', full: 'Equated Monthly Instalment', category: 'Loans & Credit', definition: 'Fixed monthly payment for a loan covering both principal and interest. Early EMIs are mostly interest; later ones are mostly principal. A ₹30 lakh home loan at 8.5% for 20 years = EMI of ~₹26,000.' },
  { term: 'Principal', full: 'Principal Amount', category: 'Loans & Credit', definition: 'The original loan amount before interest. If you borrow ₹5 lakh, that\'s the principal. Each EMI reduces the principal slightly; the total interest you pay depends on how quickly you reduce it.' },
  { term: 'Amortisation', full: 'Loan Amortisation', category: 'Loans & Credit', definition: 'The process of paying off a loan through regular instalments. An amortisation schedule shows how each payment splits between interest and principal. Early payments are mostly interest; this flips over time.' },
  { term: 'Prepayment', full: 'Loan Prepayment', category: 'Loans & Credit', definition: 'Paying off part or all of a loan before it\'s due. Reduces the outstanding principal, cutting future interest significantly. Even one extra EMI per year can reduce a 20-year loan by 2–3 years.' },
  { term: 'Credit Score', full: 'Credit Score (CIBIL)', category: 'Loans & Credit', definition: 'A 3-digit number (300–900) representing your creditworthiness. Above 750 is considered good. Banks offer lower interest rates to high scorers. Affected by payment history, credit utilisation, and loan types.' },
  { term: 'Credit Utilisation', full: 'Credit Utilisation Ratio', category: 'Loans & Credit', definition: 'The percentage of your available credit limit you\'re using. Using ₹40,000 of a ₹1 lakh limit = 40% utilisation. Keeping it below 30% helps maintain a good credit score.' },
  { term: 'Moratorium', full: 'Loan Moratorium', category: 'Loans & Credit', definition: 'A temporary pause on loan repayments granted by a lender. Interest still accrues during moratorium. RBI offered a 6-month moratorium during COVID-19. Not the same as loan waiver.' },

  // Tax
  { term: 'LTCG', full: 'Long Term Capital Gains', category: 'Tax', definition: 'Profit from selling an asset held for over a year. For equity and mutual funds: 12.5% tax on gains above ₹1.25 lakh per year (Budget 2024). For real estate: 12.5% without indexation. Significantly lower than income tax rates.' },
  { term: 'STCG', full: 'Short Term Capital Gains', category: 'Tax', definition: 'Profit from selling an equity asset held for less than 1 year. Taxed at 20% (raised from 15% in Budget 2024). For debt funds held under 3 years, gains are added to income and taxed at your slab rate.' },
  { term: 'TDS', full: 'Tax Deducted at Source', category: 'Tax', definition: 'Tax automatically deducted by the payer before making a payment. Banks deduct 10% TDS on FD interest above ₹40,000 per year. You can claim it back if your total income is below the taxable limit.' },
  { term: '80C', full: 'Section 80C Deduction', category: 'Tax', definition: 'A tax deduction under the old regime allowing up to ₹1.5 lakh to be deducted from taxable income. Covers PPF, ELSS, EPF, home loan principal, life insurance premiums. Not available under the new tax regime.' },
  { term: 'HRA', full: 'House Rent Allowance', category: 'Tax', definition: 'A component of salary that can be partially or fully exempt from tax if you pay rent. Exemption is minimum of: actual HRA received, 50% of salary (metro) or 40% (non-metro), or actual rent minus 10% of salary.' },

  // Economics
  { term: 'Inflation', full: 'Inflation', category: 'Economics', definition: 'The rate at which the general price level of goods and services rises over time, eroding purchasing power. At 6% annual inflation, ₹1 lakh today will only buy what ₹74,726 buys today in 5 years.' },
  { term: 'Interest Rate', full: 'Interest Rate', category: 'Economics', definition: 'The cost of borrowing money or the return for lending it, expressed as a percentage. RBI\'s repo rate influences all borrowing costs in India. When RBI raises rates, home loan EMIs go up.' },
  { term: 'Repo Rate', full: 'Repo Rate', category: 'Economics', definition: 'The rate at which RBI lends money to commercial banks. A higher repo rate makes borrowing expensive for banks, which pass the cost to consumers. RBI uses it to control inflation.' },
  { term: 'Fiscal Deficit', full: 'Fiscal Deficit', category: 'Economics', definition: 'When a government spends more than it earns in a financial year. Expressed as a percentage of GDP. India\'s fiscal deficit target is typically 4–5% of GDP. Higher deficit can lead to inflation.' },
  { term: 'GDP', full: 'Gross Domestic Product', category: 'Economics', definition: 'The total monetary value of all goods and services produced in a country in a year. India\'s GDP growth of 7%+ makes it one of the fastest-growing major economies. Markets often rally on strong GDP data.' },
  { term: 'CPI', full: 'Consumer Price Index', category: 'Economics', definition: 'A measure of inflation tracking the price change of a basket of consumer goods. RBI targets CPI inflation of 4% (±2%). CPI data influences RBI\'s decision to raise or cut interest rates.' },

  // Derivatives
  { term: 'Options', full: 'Options Contract', category: 'Derivatives', definition: 'A contract giving you the right (but not obligation) to buy or sell an asset at a set price before a set date. Used for hedging or speculation. Complex instruments — not for beginners.' },
  { term: 'Futures', full: 'Futures Contract', category: 'Derivatives', definition: 'An agreement to buy or sell an asset at a predetermined price on a future date. Unlike options, both parties are obligated to fulfil the contract. Used by traders and companies to hedge price risk.' },
  { term: 'Derivatives', full: 'Derivatives', category: 'Derivatives', definition: 'Financial instruments whose value is derived from an underlying asset (stocks, commodities, currencies). Includes futures and options. India\'s NSE is the world\'s largest derivatives exchange by volume.' },
  { term: 'Call Option', full: 'Call Option', category: 'Derivatives', definition: 'The right to buy an asset at a fixed price (strike price) before expiry. You buy a call when you expect the price to rise. If it doesn\'t, you only lose the premium paid.' },
  { term: 'Put Option', full: 'Put Option', category: 'Derivatives', definition: 'The right to sell an asset at a fixed price before expiry. You buy a put when you expect the price to fall — it acts like insurance on a stock you own.' },
  { term: 'Strike Price', full: 'Strike Price', category: 'Derivatives', definition: 'The price at which an options contract can be exercised. A Nifty call option with strike 22,000 gives you the right to buy Nifty at 22,000 regardless of its actual price at expiry.' },
  { term: 'Expiry', full: 'Expiry Date', category: 'Derivatives', definition: 'The date on which a futures or options contract expires. In India, NSE weekly options expire every Thursday. After expiry, the contract is settled and ceases to exist.' },
  { term: 'Margin', full: 'Margin', category: 'Derivatives', definition: 'A deposit required to open and hold a leveraged position. Trading ₹10 lakh in futures may require only ₹1 lakh margin — 10x leverage. Losses beyond your margin trigger a margin call.' },
  { term: 'Hedging', full: 'Hedging', category: 'Derivatives', definition: 'Reducing risk by taking an offsetting position. An investor holding ₹10 lakh of Nifty stocks might buy put options to protect against a market crash — like buying insurance.' },
  { term: 'Short Selling', full: 'Short Selling', category: 'Derivatives', definition: 'Selling a stock you don\'t own, hoping to buy it back cheaper later. You profit if the price falls. High risk — losses are theoretically unlimited if the stock price rises instead.' },
  { term: 'Arbitrage', full: 'Arbitrage', category: 'Derivatives', definition: 'Profiting from price differences of the same asset in different markets. If a stock trades at ₹100 on NSE and ₹100.50 on BSE, buying on NSE and selling on BSE locks in a risk-free ₹0.50 profit per share.' },

  // Personal Finance
  { term: 'Liquidity', full: 'Liquidity', category: 'Personal Finance', definition: 'How quickly and easily an asset can be converted to cash without losing value. Cash is the most liquid. Real estate is illiquid — selling takes months. Always keep 3–6 months of expenses in liquid assets.' },
  { term: 'Volatility', full: 'Volatility', category: 'Personal Finance', definition: 'The degree of price fluctuation in an investment. High volatility = large price swings. Small-cap stocks are more volatile than large-caps. Higher volatility = higher risk and potentially higher returns.' },
  { term: 'Risk-Adjusted Return', full: 'Risk-Adjusted Return', category: 'Personal Finance', definition: 'Return measured relative to the risk taken. Two funds both returning 12% can have very different risk levels. The one with lower volatility has a better risk-adjusted return — measured by Sharpe Ratio.' },
  { term: 'Sharpe Ratio', full: 'Sharpe Ratio', category: 'Personal Finance', definition: 'A measure of return per unit of risk. Sharpe = (Return - Risk-Free Rate) / Standard Deviation. A Sharpe above 1 is good; above 2 is excellent. Use it to compare funds with similar returns.' },
  { term: 'Standard Deviation', full: 'Standard Deviation', category: 'Personal Finance', definition: 'A statistical measure of how spread out returns are around the average. A fund with 15% average return and high standard deviation swings wildly; one with low SD is more consistent.' },
  { term: 'Compounding', full: 'Compounding', category: 'Personal Finance', definition: 'Earning returns on your returns. ₹1 lakh at 12% for 30 years = ₹29.9 lakh. The same ₹1 lakh for 10 years = only ₹3.1 lakh. Time is the most powerful variable in compounding.' },
  { term: 'Time Value of Money', full: 'Time Value of Money', category: 'Personal Finance', definition: '₹1 today is worth more than ₹1 in the future because of its earning potential. ₹1 lakh today invested at 10% is worth ₹1.1 lakh next year. This principle underpins all financial calculations.' },
  { term: 'Opportunity Cost', full: 'Opportunity Cost', category: 'Personal Finance', definition: 'The value of the next best alternative you give up when making a choice. Keeping ₹5 lakh in a savings account at 3% when the market earns 12% means an annual opportunity cost of ₹45,000.' },
  { term: 'Sunk Cost', full: 'Sunk Cost', category: 'Personal Finance', definition: 'Money already spent that cannot be recovered. A stock down 50% is a sunk cost — the decision to hold or sell should be based on future prospects, not what you paid. The sunk cost fallacy leads to poor decisions.' },
  { term: 'Net Worth', full: 'Net Worth', category: 'Personal Finance', definition: 'Total assets minus total liabilities. If you own a ₹80 lakh flat, ₹10 lakh in investments, but owe ₹40 lakh on a home loan, your net worth is ₹50 lakh. Growing net worth is the foundation of wealth building.' },
  { term: 'FIRE', full: 'Financial Independence, Retire Early', category: 'Personal Finance', definition: 'A movement focused on aggressive saving and investing to retire decades before the traditional age. The core idea: build a corpus 25× your annual expenses, then withdraw 4% per year. Requires a high savings rate.' },
]

const CATEGORIES = ['All', ...Array.from(new Set(TERMS.map(t => t.category)))]

// ── Deep Dive Panel ───────────────────────────────────────────────────────────
function DeepDive({ term, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/explain?term=${encodeURIComponent(term.term)}&full=${encodeURIComponent(term.full)}&category=${encodeURIComponent(term.category)}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [term.term])

  const calc = CALCULATOR_MAP[term.term]
  const allTermKeys = new Set(TERMS.map(t => t.term))

  const panelStyle = {
    background: C.bg, border: `1px solid ${C.amber}`, borderRadius: 4,
    padding: '20px 22px', marginTop: 10,
  }

  if (loading) return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.textSec, fontSize: 12 }}>
        <span style={{ display: 'inline-block', width: 14, height: 14, border: `2px solid ${C.amber}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Generating deep dive...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ ...panelStyle, borderColor: C.red }}>
      <div style={{ fontSize: 12, color: C.red }}>{error}</div>
    </div>
  )

  if (!data) return null

  return (
    <div style={panelStyle}>
      {/* Explanation */}
      <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, marginBottom: 10 }}>DEEP DIVE</div>
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9, marginBottom: 18, whiteSpace: 'pre-line' }}>
        {data.explanation}
      </div>

      {/* Example */}
      {data.example && (
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}`, borderRadius: 3, padding: '12px 16px', marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: C.green, letterSpacing: 2, marginBottom: 6 }}>WORKED EXAMPLE</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>{data.example}</div>
        </div>
      )}

      {/* Common mistakes */}
      {data.mistakes?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: C.red, letterSpacing: 2, marginBottom: 10 }}>COMMON MISTAKES</div>
          {data.mistakes.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ color: C.red, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✕</span>
              <span style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>{m}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer: related terms + calculator link */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        {data.relatedTerms?.filter(t => allTermKeys.has(t) && t !== term.term).map(t => (
          <button key={t} onClick={onClose.bind(null, t)}
            style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.blue, padding: '4px 10px', fontSize: 11, fontFamily: MONO, borderRadius: 2, cursor: 'pointer', letterSpacing: 0.5 }}>
            {t} →
          </button>
        ))}
        {calc && (
          <Link to={calc.to} style={{ marginLeft: 'auto', background: C.amber, color: C.bg, padding: '5px 12px', fontSize: 11, fontFamily: MONO, fontWeight: 700, borderRadius: 2, textDecoration: 'none', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
            {calc.label} ↗
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Glossary() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [expandedTerm, setExpandedTerm] = useState(null)
  const cache = useRef(new Map())

  const filtered = TERMS.filter(t => {
    const matchCat = category === 'All' || t.category === category
    const matchQ = !query || t.term.toLowerCase().includes(query.toLowerCase()) ||
      t.full.toLowerCase().includes(query.toLowerCase()) ||
      t.definition.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  const toggleTerm = (term) => {
    setExpandedTerm(prev => prev === term ? null : term)
  }

  // Jump to a related term: clear filters, expand it
  const jumpToTerm = (termKey) => {
    setQuery('')
    setCategory('All')
    setExpandedTerm(termKey)
    setTimeout(() => {
      document.getElementById(`term-${termKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>REFERENCE</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Financial Glossary</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
            {TERMS.length} terms explained in plain English. Click any term for an AI-generated deep dive — worked examples, common mistakes, and related concepts.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search terms..." aria-label="Search financial glossary"
            style={{ width: '100%', background: C.panel, border: `1px solid ${query ? C.amber : C.border}`, color: C.text, padding: '10px 40px 10px 16px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
          {query
            ? <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: C.textSec, fontSize: 18, background: 'none', border: 'none', padding: 0 }}>×</button>
            : <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSec, fontSize: 12 }}>🔍</span>
          }
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              background: category === cat ? C.amber : C.panel,
              color: category === cat ? '#020c18' : C.textSec,
              border: `1px solid ${category === cat ? C.amber : C.border}`,
              padding: '4px 12px', fontSize: 10, fontFamily: MONO, cursor: 'pointer', borderRadius: 2,
              fontWeight: category === cat ? 700 : 400, letterSpacing: 0.5,
            }}>{cat}</button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ fontSize: 10, color: C.textSec, marginBottom: 20, letterSpacing: 1 }}>
          {filtered.length} {filtered.length === 1 ? 'TERM' : 'TERMS'}
          {category !== 'All' ? ` IN ${category.toUpperCase()}` : ''}
          {query ? ` MATCHING "${query.toUpperCase()}"` : ''}
        </div>

        {/* Terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(t => {
            const isOpen = expandedTerm === t.term
            return (
              <div key={t.term} id={`term-${t.term}`}>
                <div
                  onClick={() => toggleTerm(t.term)}
                  style={{
                    background: C.panel, border: `1px solid ${isOpen ? C.amber : C.border}`,
                    borderRadius: isOpen ? '3px 3px 0 0' : 3, padding: '16px 20px',
                    transition: 'border-color 0.15s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = C.textSec }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderColor = C.border }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>{t.term}</span>
                    {t.full !== t.term && <span style={{ fontSize: 11, color: C.textSec }}>{t.full}</span>}
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: C.textDim, border: `1px solid ${C.border}`, padding: '2px 6px', borderRadius: 2, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{t.category}</span>
                      <span style={{ fontSize: 10, color: isOpen ? C.amber : C.textSec, letterSpacing: 1 }}>{isOpen ? '▲ CLOSE' : '▼ DEEP DIVE'}</span>
                    </span>
                  </div>               <p style={{ fontSize: 12, color: C.text, lineHeight: 1.8, margin: 0 }}>{t.definition}</p>
                </div>

                {isOpen && (
                  <DeepDive term={t} onClose={jumpToTerm} />
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 12, color: C.textSec }}>
            No terms found for "{query}". Try a different search.
          </div>
        )}
      </div>
    </div>
  )
}
