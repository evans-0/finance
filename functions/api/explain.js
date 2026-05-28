// functions/api/explain.js
// Cloudflare Pages Function — uses env.AI binding (no API key needed)
// Model: @cf/meta/llama-3.1-8b-instruct

export async function onRequestGet(context) {
  const { request, env } = context

  const url = new URL(request.url)
  const term = url.searchParams.get('term')
  const full = url.searchParams.get('full') || term
  const category = url.searchParams.get('category') || ''

  if (!term) {
    return new Response(JSON.stringify({ error: 'Missing term parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const origin = request.headers.get('Origin') || ''
  const allowed = env.ALLOWED_ORIGIN || 'https://mkt-vision.com'
  if (origin && origin !== allowed) {
    return new Response('Forbidden', { status: 403 })
  }

  const prompt = `You are a financial educator writing for young adults in India (and some in the US) who are learning about personal finance and investing for the first time. Write clearly, avoid jargon, and use Indian rupee examples where relevant (₹, Nifty 50, SEBI, NSE, SBI, HDFC etc.).

Explain the financial concept: "${full}" (abbreviated as "${term}") from the category: "${category}".

Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble. Use this exact structure:
{
  "explanation": "2-3 short paragraphs explaining what this concept means and why it matters. Use plain English. Include at least one specific numerical example in rupees.",
  "example": "One concrete worked example — walk through the numbers step by step. Keep it to 3-5 sentences.",
  "mistakes": [
    "First common mistake people make with this concept",
    "Second common mistake",
    "Third common mistake"
  ],
  "relatedTerms": ["RelatedTerm1", "RelatedTerm2", "RelatedTerm3"]
}

The relatedTerms must be picked from this list only — return the short form (e.g. "CAGR" not "Compound Annual Growth Rate"):
CAGR, NAV, Expense Ratio, SIP, Lumpsum, Diversification, Asset Allocation, Rebalancing, Benchmark, Alpha, Beta, XIRR, Bull Market, Bear Market, Market Cap, P/E Ratio, EPS, Dividend, IPO, Circuit Breaker, Bid-Ask Spread, Volume, Equity Fund, Debt Fund, Index Fund, ELSS, Exit Load, AUM, EMI, Principal, Amortisation, Prepayment, Credit Score, Credit Utilisation, Moratorium, LTCG, STCG, TDS, 80C, HRA, Inflation, Interest Rate, Repo Rate, Fiscal Deficit, GDP, CPI, Options, Futures, Derivatives, Call Option, Put Option, Strike Price, Expiry, Margin, Hedging, Short Selling, Arbitrage, Liquidity, Volatility, Risk-Adjusted Return, Sharpe Ratio, Standard Deviation, Compounding, Time Value of Money, Opportunity Cost, Sunk Cost, Net Worth, FIRE`

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a financial educator. Always respond with valid JSON only — no markdown, no extra text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.4,
    })

    // Cloudflare AI returns { response: "..." }
    const raw = response.response || ''

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    // Validate it's parseable JSON before returning
    const parsed = JSON.parse(cleaned)

    // Sanitise: ensure all expected keys exist
    const safe = {
      explanation: parsed.explanation || '',
      example: parsed.example || '',
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes.slice(0, 4) : [],
      relatedTerms: Array.isArray(parsed.relatedTerms) ? parsed.relatedTerms.slice(0, 5) : [],
    }

    return new Response(JSON.stringify(safe), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowed,
        'Cache-Control': 'public, max-age=86400', // cache 24h at edge
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate explanation. Try again.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowed,
        },
      }
    )
  }
}
