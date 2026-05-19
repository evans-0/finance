// Indian stocks via Twelve Data (free tier: 800 req/day, 8 req/min)
// Uses individual requests to avoid batch response format issues

const INDIAN_STOCKS = [
  { symbol: "INFY",       name: "Infosys Ltd"          },
  { symbol: "TCS",        name: "Tata Consultancy"      },
  { symbol: "RELIANCE",   name: "Reliance Industries"   },
  { symbol: "HDFCBANK",   name: "HDFC Bank"             },
  { symbol: "ICICIBANK",  name: "ICICI Bank"            },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever"    },
  { symbol: "SBIN",       name: "State Bank of India"   },
  { symbol: "BHARTIARTL", name: "Bharti Airtel"         },
  { symbol: "WIPRO",      name: "Wipro Ltd"             },
  { symbol: "ITC",        name: "ITC Ltd"               },
]

const CACHE_TTL = 60

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

async function fetchQuote(symbol, apiKey) {
  const r = await fetch(
    `https://api.twelvedata.com/quote?symbol=${symbol}&exchange=NSE&apikey=${apiKey}`
  )
  if (!r.ok) return null
  const q = await r.json()

  // Twelve Data returns { status: "error", message: "..." } on failure
  if (q.status === "error" || !q.name) return null

  // Use close for live price; fall back to previous_close if market is closed / close is 0
  const price = parseFloat(q.close) || parseFloat(q.previous_close) || 0
  if (!price) return null

  const prev   = parseFloat(q.previous_close) || price
  const pct    = q.percent_change
    ? parseFloat(q.percent_change)
    : prev ? ((price - prev) / prev) * 100 : 0

  return {
    symbol,
    name:   q.name,
    price:  +price.toFixed(2),
    change: +(price - prev).toFixed(2),
    pct:    +pct.toFixed(4),
    high:   parseFloat(q.high)  || null,
    low:    parseFloat(q.low)   || null,
    exchange: "NSE",
  }
}

export async function onRequest({ request, env, waitUntil }) {
  const origin  = request.headers.get("Origin") || ""
  const allowed = env.ALLOWED_ORIGIN || ""
  const cors    = corsHeaders(origin, allowed)

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors })

  if (allowed && origin && origin !== allowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  if (!env.TWELVEDATA_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cache    = caches.default
  const cacheKey = new Request("https://cache.mktvision.internal/indian-v2")
  const cached   = await cache.match(cacheKey)

  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const results = (
      await Promise.all(
        INDIAN_STOCKS.map(({ symbol }) => fetchQuote(symbol, env.TWELVEDATA_KEY))
      )
    ).filter(Boolean) // drop any that errored

    if (!results.length) throw new Error("no data")

    const body     = JSON.stringify(results)
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 502, headers: { "Content-Type": "application/json", ...cors },
    })
  }
}
