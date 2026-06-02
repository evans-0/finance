import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { C, MONO, Section } from './shared'

// ── IPO Timeline ──────────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { icon: '🏢', label: 'Company Decision', sub: 'Board approves IPO plan', detail: 'Company decides to go public to raise capital, allow early investors to exit, or increase brand credibility. Appoints investment bankers (Book Running Lead Managers — BRLMs).' },
  { icon: '📄', label: 'DRHP Filing',      sub: 'Draft Red Herring Prospectus', detail: 'The company files a DRHP with SEBI — a detailed document covering financials, risks, business model, and how the money raised will be used. This is public — you can read it on the SEBI website.' },
  { icon: '✅', label: 'SEBI Approval',    sub: '30–75 days review',           detail: 'SEBI reviews the DRHP, asks questions, and issues observations. This is not a quality endorsement — SEBI only checks disclosure completeness, not whether the company is a good investment.' },
  { icon: '🗺️', label: 'Roadshow',         sub: 'Meet institutional investors',  detail: 'The company\'s management travels to meet large institutional investors (QIBs) to generate interest and get a sense of demand before finalising the price band.' },
  { icon: '💰', label: 'Price Band Set',   sub: 'Floor price and cap price',    detail: 'Based on roadshow demand, the company sets a price band — e.g., ₹400–₹420. Retail investors bid within this range. You can also bid at cut-off price, meaning whatever the final price turns out to be.' },
  { icon: '📱', label: 'Subscription',     sub: '3 days open (Mon–Wed typical)', detail: 'The IPO is open for bidding for 3 working days. Retail, HNI, and QIB investors place bids. Funds are blocked via ASBA (not debited) until allotment.' },
  { icon: '🎲', label: 'Allotment',        sub: 'T+6 from closing',             detail: 'If oversubscribed in the retail category, a computerised lottery determines who gets shares. Each applicant gets at most 1 lot regardless of how many lots they applied for.' },
  { icon: '📈', label: 'Listing',          sub: 'T+7 from closing',             detail: 'Shares start trading on NSE and BSE. Listing price is determined by pre-open order matching. If demand > supply at open, shares list above issue price (listing gain).' },
]

function IPOTimeline() {
  const [active, setActive] = useState(null)
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>FROM PRIVATE COMPANY TO LISTED STOCK</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step.label}>
            <div
              onClick={() => setActive(active === i ? null : i)}
              style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', padding: '12px 0' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: active === i ? C.amber + '22' : C.bg, border: `2px solid ${active === i ? C.amber : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s' }}>
                  {step.icon}
                </div>
                {i < TIMELINE_STEPS.length - 1 && <div style={{ width: 2, height: 20, background: C.border, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: active === i ? C.amber : C.text }}>{step.label}</span>
                  <span style={{ fontSize: 10, color: C.textSec }}>{step.sub}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: active === i ? C.amber : C.textSec }}>{active === i ? '▲' : '▼'}</span>
                </div>
                {active === i && (
                  <div style={{ marginTop: 10, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '12px 14px' }}>
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Category breakdown ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: 'Retail Individual Investors', short: 'RII', pct: 35, color: C.amber,
    who: 'Anyone applying up to ₹2 lakh',
    allotment: 'Lottery — 1 lot per applicant if oversubscribed. More applications = same 1 lot chance.',
    tip: 'Apply from multiple family members\' demat accounts (each ≤ ₹2L) to increase lottery chances. Each PAN counts as one application.',
  },
  {
    name: 'Non-Institutional Investors', short: 'NII / HNI', pct: 15, color: C.blue,
    who: 'Individuals applying above ₹2 lakh',
    allotment: 'Proportional — if 10× oversubscribed, you get 1/10 of what you applied for. Minimum 1 lot guaranteed if subscribed.',
    tip: 'HNIs often take loans to apply for large amounts. Higher subscription = lower proportional allotment. Risky if listing price falls.',
  },
  {
    name: 'Qualified Institutional Buyers', short: 'QIB', pct: 50, color: C.purple,
    who: 'Mutual funds, FIIs, insurance companies, banks',
    allotment: 'Proportional. No upper limit on application size. QIBs also participate in the book-building to help set the price band.',
    tip: 'QIB subscription level is the best signal of IPO quality. High QIB subscription = strong institutional confidence.',
  },
]

// ── Oversubscription explainer ────────────────────────────────────────────────
function OversubscriptionDemo() {
  const [subscription, setSubscription] = useState(30)
  const totalShares = 1000000
  const retailQuota = Math.round(totalShares * 0.35)
  const bidsReceived = Math.round(retailQuota * subscription)
  const lotsAvailable = Math.round(retailQuota / 14) // ~14 shares per lot
  const applicants = Math.round(bidsReceived / 14)
  const allotmentChance = subscription > 1 ? (lotsAvailable / applicants * 100).toFixed(1) : 100

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>HOW THE LOTTERY WORKS — DRAG THE SLIDER</div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>RETAIL SUBSCRIPTION LEVEL</label>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{subscription}×</span>
        </div>
        <input type="range" min={1} max={100} step={1} value={subscription} onChange={e => setSubscription(Number(e.target.value))} style={{ width: '100%', accentColor: C.amber }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textDim, marginTop: 4 }}>
          <span>1× = fully subscribed</span><span>100× = 100× oversubscribed</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'LOTS AVAILABLE', val: lotsAvailable.toLocaleString('en-IN'), color: C.green },
          { label: 'APPLICANTS', val: applicants.toLocaleString('en-IN'), color: C.text },
          { label: 'ALLOTMENT CHANCE', val: subscription > 1 ? allotmentChance + '%' : '100%', color: parseFloat(allotmentChance) < 10 ? C.red : parseFloat(allotmentChance) < 50 ? C.amber : C.green },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
        {subscription <= 1
          ? 'IPO is fully subscribed but not oversubscribed. Everyone who applied gets allotment.'
          : `At ${subscription}× subscription, only ${allotmentChance}% of applicants get 1 lot. Applying for more lots does NOT increase your chances — the lottery gives maximum 1 lot per PAN regardless of how many lots you bid for.`
        }
      </div>
    </div>
  )
}

// ── GMP explainer ─────────────────────────────────────────────────────────────
function GMPExplainer() {
  const [issuePrice, setIssuePrice] = useState(400)
  const [gmp, setGmp] = useState(80)
  const expectedListing = issuePrice + gmp
  const expectedGain = (gmp / issuePrice * 100).toFixed(1)

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>GREY MARKET PREMIUM — WHAT IT ACTUALLY MEANS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[{ label: 'ISSUE PRICE (₹)', value: issuePrice, setter: setIssuePrice, min: 50, max: 2000, step: 10 }, { label: 'GMP (₹)', value: gmp, setter: setGmp, min: -200, max: 500, step: 5 }].map(s => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>{s.label}</label>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>₹{s.value}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.setter(Number(e.target.value))} style={{ width: '100%', accentColor: C.amber }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>EXPECTED LISTING PRICE</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: gmp >= 0 ? C.green : C.red }}>₹{expectedListing}</div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>IMPLIED LISTING GAIN</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: gmp >= 0 ? C.green : C.red }}>{gmp >= 0 ? '+' : ''}{expectedGain}%</div>
        </div>
      </div>
      <div style={{ background: C.bg, border: `1px solid ${C.red}33`, borderRadius: 3, padding: '12px 14px' }}>
        <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.5, marginBottom: 6 }}>WHY GMP IS UNRELIABLE</div>
        <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>
          GMP is traded in an unofficial, unregulated grey market. It reflects informal demand but can be manipulated, based on incomplete subscription data, or simply wrong. Several high-GMP IPOs have listed at a discount. Use it as a rough signal — never as a certainty.
        </div>
      </div>
    </div>
  )
}

// ── ASBA flow ─────────────────────────────────────────────────────────────────
const ASBA_STEPS = [
  { icon: '📱', label: 'You apply',         detail: 'Submit your IPO application via your broker app or bank. Specify lot quantity and price (or cut-off).' },
  { icon: '🔒', label: 'Funds blocked',     detail: 'Your bank blocks the bid amount in your account via ASBA (Application Supported by Blocked Amount). Money is NOT debited — it stays in your account earning interest.' },
  { icon: '🎲', label: 'Allotment',         detail: 'If you get allotment, the exact amount is debited. If not, the block is released immediately on allotment date.' },
  { icon: '📈', label: 'Shares credited',   detail: 'Allotted shares appear in your demat account on T+6. You can sell on listing day (T+7) or hold.' },
]

export default function IPOMarket() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text, overflowX: 'hidden' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        <Link to="/how-markets-work" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← HOW MARKETS WORK</Link>

        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>EXPLAINER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>How IPOs Work</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            From a private company deciding to go public, to your shares landing in your demat account. What actually happens, how allotment works, and what to do on listing day.
          </p>
        </div>

        {/* Section 1 — Timeline */}
        <Section subtitle="01 — THE PROCESS" title="From private company to listed stock">
          <IPOTimeline />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            The entire process from DRHP filing to listing typically takes 4–6 months. SEBI's role is to ensure complete disclosure — not to validate the quality of the business. Reading the DRHP risk factors section is one of the most useful things you can do before applying.
          </div>
        </Section>

        {/* Section 2 — Categories */}
        <Section subtitle="02 — INVESTOR CATEGORIES" title="Retail, HNI, and QIB — very different rules">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.short} style={{ background: C.panel, border: `1px solid ${cat.color}33`, borderRadius: 4, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ background: cat.color + '22', border: `1px solid ${cat.color}`, borderRadius: 3, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: cat.color }}>{cat.pct}% QUOTA</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat.short}</div>
                    <div style={{ fontSize: 10, color: C.textSec }}>{cat.name}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {[{ label: 'WHO', val: cat.who }, { label: 'ALLOTMENT METHOD', val: cat.allotment }, { label: 'STRATEGY', val: cat.tip }].map(item => (
                    <div key={item.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
                      <div style={{ fontSize: 9, color: cat.color, letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <OversubscriptionDemo />
        </Section>

        {/* Section 3 — How to apply */}
        <Section subtitle="03 — HOW TO APPLY" title="ASBA — your money stays in your account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>THE ASBA FLOW</div>
            {ASBA_STEPS.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: C.amber + '22', border: `2px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{step.icon}</div>
                  {i < ASBA_STEPS.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, minHeight: 16, margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: i < ASBA_STEPS.length - 1 ? 20 : 0, paddingTop: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 4 }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: '🎯', title: 'Cut-off price bid', desc: 'Always bid at cut-off for retail. It means you\'ll get shares at whatever the final issue price is. Bidding at a specific price risks missing out if the price is set higher.' },
              { icon: '📊', title: 'How price is set', desc: 'Through book building — bankers collect bids from QIBs at various prices and set the final issue price at the level where demand meets the shares available.' },
              { icon: '⏰', title: 'When to apply', desc: 'Apply on the last day (Day 3) after checking the subscription data from Days 1–2. High early subscription is a positive signal.' },
            ].map(item => (
              <div key={item.title} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4 — GMP and listing day */}
        <Section subtitle="04 — LISTING DAY" title="Grey Market Premium and what to do on Day 1">
          <GMPExplainer />
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { icon: '📈', title: 'Sell on listing day', color: C.green, desc: 'If you got allotment primarily to capture listing gains, sell in the first 30–60 minutes at a good price. Listing gains on popular IPOs are taxed as STCG (20%).' },
              { icon: '🏦', title: 'Hold long term', color: C.amber, desc: 'Research shows most Indian IPOs underperform the index over 1–3 years post listing. If you\'re holding, it should be because you believe in the business — not because of the listing pop.' },
              { icon: '⚠️', title: 'The IPO trap', color: C.red, desc: 'Buying on listing day at elevated prices is often the worst entry. The company is at peak valuation hype. Waiting 3–6 months for the lock-up expiry and hype to fade often gives a better price.' },
            ].map(item => (
              <div key={item.title} style={{ background: C.panel, border: `1px solid ${item.color}33`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5 — Key facts */}
        <Section subtitle="05 — THINGS MOST PEOPLE GET WRONG" title="Common IPO misconceptions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { myth: 'SEBI approval means the IPO is safe', reality: 'SEBI only checks that disclosures are complete. It does not evaluate whether the company is profitable, fairly valued, or a good investment.' },
              { myth: 'Applying for more lots increases your chances', reality: 'In the retail lottery, each PAN gets at most 1 lot. Applying for 14 lots gives you the same chance as applying for 1 lot. Apply across family members instead.' },
              { myth: 'High GMP = guaranteed listing gain', reality: 'GMP is unregulated and often manipulated. Several IPOs with 80–100% GMP have listed at a discount. It\'s directional at best.' },
              { myth: 'IPOs are a reliable way to make money', reality: 'Only ~30–40% of Indian IPOs list at a significant premium. Many trade below issue price within 6 months. The odds are not systematically in retail investors\' favour.' },
              { myth: 'The company gets all the IPO money', reality: 'IPOs can have two parts: Fresh Issue (company gets money) and Offer for Sale or OFS (existing shareholders sell their stake — company gets nothing). Check the prospectus.' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
                  <span style={{ color: C.red, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✕</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{item.myth}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: C.green, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.reality}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
