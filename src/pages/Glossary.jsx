import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
  green: '#00e676', red: '#ff3c5c',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

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
  { term: 'Indexation', full: 'Indexation Benefit', category: 'Tax', definition: 'Adjusting the purchase price of an asset for inflation to reduce taxable capital gains. If you bought property for ₹20 lakh in 2010 and sell for ₹50 lakh in 2024, indexation raises the cost to ₹38 lakh, reducing your taxable gain. Removed for real estate in Budget 2024.' },

  // Derivatives
  { term: 'Options', full: 'Options Contract', category: 'Derivatives', definition: 'A contract giving the buyer the right (not obligation) to buy or sell an asset at a predetermined price before expiry. Call option = right to buy. Put option = right to sell. Premium paid upfront is the maximum loss for the buyer.' },
  { term: 'Call Option', full: 'Call Option', category: 'Derivatives', definition: 'The right to buy an asset at the strike price before expiry. You buy a call when you expect the price to rise. If Nifty is at 22,000 and you buy a 22,500 call, you profit if Nifty rises above 22,500 + premium paid.' },
  { term: 'Put Option', full: 'Put Option', category: 'Derivatives', definition: 'The right to sell an asset at the strike price before expiry. You buy a put when you expect the price to fall. Used as insurance for portfolios — a put option can protect against market crashes.' },
  { term: 'Strike Price', full: 'Strike Price', category: 'Derivatives', definition: 'The predetermined price at which an option can be exercised. A Nifty 22,000 call has a strike price of 22,000. In-the-money if market is above strike (for calls) or below strike (for puts).' },
  { term: 'Premium', full: 'Option Premium', category: 'Derivatives', definition: 'The price paid to buy an options contract. For the buyer it\'s the maximum possible loss. For the seller it\'s the maximum possible gain. Premium is driven by intrinsic value + time value + implied volatility.' },
  { term: 'Futures', full: 'Futures Contract', category: 'Derivatives', definition: 'A legal obligation to buy or sell an asset at a predetermined price on a future date. Unlike options, both parties must fulfil the contract. Used for hedging and speculation. High leverage means high risk.' },
  { term: 'F&O', full: 'Futures & Options', category: 'Derivatives', definition: 'Derivative instruments traded on exchanges like NSE. India has one of the largest F&O markets in the world by volume. 90%+ of retail F&O traders lose money — SEBI data confirms this repeatedly.' },

  // Personal Finance
  { term: 'Net Worth', full: 'Net Worth', category: 'Personal Finance', definition: 'Total assets minus total liabilities. If you own assets worth ₹50 lakh and owe ₹20 lakh in loans, your net worth is ₹30 lakh. The most important measure of financial health.' },
  { term: 'Emergency Fund', full: 'Emergency Fund', category: 'Personal Finance', definition: '3–6 months of expenses kept in liquid, safe instruments. First rule of personal finance. Prevents you from selling investments at a loss during job loss, medical emergency, or unexpected expenses.' },
  { term: 'Inflation', full: 'Inflation', category: 'Personal Finance', definition: 'The rate at which prices rise over time, eroding purchasing power. India\'s average inflation is 5–7% per year. ₹1 lakh today will have the buying power of ~₹55,000 in 10 years at 6% inflation.' },
  { term: 'FIRE', full: 'Financial Independence, Retire Early', category: 'Personal Finance', definition: 'A movement focused on saving aggressively (50–70% of income) to build a corpus large enough to live off investment returns indefinitely. The 4% rule states you can withdraw 4% annually from your corpus without running out.' },
  { term: 'Compound Interest', full: 'Compound Interest', category: 'Personal Finance', definition: 'Earning interest on your interest. ₹1 lakh at 12% simple interest = ₹1.12 lakh after 1 year. At compound interest after 10 years = ₹3.1 lakh. Einstein allegedly called it the eighth wonder of the world.' },
  { term: '50/30/20 Rule', full: '50/30/20 Budgeting Rule', category: 'Personal Finance', definition: 'A popular budgeting framework: 50% of income on needs (rent, food, bills), 30% on wants (entertainment, dining out), 20% on savings and debt repayment. A starting point — adjust ratios to your situation.' },

  // Insurance
  { term: 'Term Insurance', full: 'Term Life Insurance', category: 'Insurance', definition: 'Pure life insurance with no investment component. Pays a lump sum to your family if you die during the policy term. A ₹1 crore cover for a 30-year-old costs ~₹8,000–10,000 per year. Cheapest way to protect your family.' },
  { term: 'ULIP', full: 'Unit Linked Insurance Plan', category: 'Insurance', definition: 'A product combining insurance and investment. Part of your premium pays for life cover, the rest is invested in funds. High charges (allocation, fund management, mortality) make it inferior to buying term + MF separately for most people.' },
  { term: 'Sum Assured', full: 'Sum Assured', category: 'Insurance', definition: 'The fixed amount your insurer will pay on a claim. If your term insurance has a sum assured of ₹1 crore, your family receives ₹1 crore on your death. Rule of thumb: 10–15x your annual income.' },
  { term: 'Premium', full: 'Insurance Premium', category: 'Insurance', definition: 'The amount you pay to keep your insurance policy active — monthly, quarterly, or annually. Missing a premium payment can lapse your policy. Term insurance premiums are low; ULIPs charge far more.' },
  { term: 'Claim Settlement Ratio', full: 'Claim Settlement Ratio', category: 'Insurance', definition: 'The percentage of claims an insurer paid out of total claims received. A ratio of 98% means the insurer settled 98 out of 100 claims. Choose insurers with CSR above 95% for life insurance.' },
]

const CATEGORIES = ['All', ...Array.from(new Set(TERMS.map(t => t.category)))]

export default function Glossary() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('All')

  const filtered = TERMS.filter(t => {
    const matchCat = category === 'All' || t.category === category
    const matchQ   = query === '' ||
      t.term.toLowerCase().includes(query.toLowerCase()) ||
      t.full.toLowerCase().includes(query.toLowerCase()) ||
      t.definition.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  }).sort((a, b) => a.term.localeCompare(b.term))

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>REFERENCE</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Financial Glossary</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>{TERMS.length} terms explained in plain English — no jargon, no fluff.</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search terms..." aria-label="Search financial glossary"
            style={{ width: '100%', background: C.panel, border: `1px solid ${query ? C.amber : C.border}`, color: C.text, padding: '10px 40px 10px 16px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
          {query
            ? <button onClick={() => setQuery('')} aria-label='Clear search' style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: C.textSec, fontSize: 18, background: 'none', border: 'none', padding: 0 }}>×</button>
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
          {filtered.map(t => (
            <div key={t.term} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '16px 20px', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.amber}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>{t.term}</span>
                {t.full !== t.term && <span style={{ fontSize: 11, color: C.textSec }}>{t.full}</span>}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textDim, border: `1px solid ${C.border}`, padding: '2px 6px', borderRadius: 2, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{t.category}</span>
              </div>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.8, margin: 0 }}>{t.definition}</p>
            </div>
          ))}
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
