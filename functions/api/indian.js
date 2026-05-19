// 8 stocks — matches Twelve Data free tier limit of 8 req/min
const WATCHLIST = [
  { symbol: "RELIANCE",   name: "Reliance Industries" },
  { symbol: "TCS",        name: "Tata Consultancy"    },
  { symbol: "INFY",       name: "Infosys Ltd"         },
  { symbol: "HDFCBANK",   name: "HDFC Bank"           },
  { symbol: "ICICIBANK",  name: "ICICI Bank"          },
  { symbol: "SBIN",       name: "State Bank of India" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel"       },
  { symbol: "ITC",        name: "ITC Ltd"             },
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
  if (q.status === "error" || !q.name) return null

  const price = parseFloat(q.close) || parseFloat(q.previous_close) || 0
  if (!price) return null

  const prev = parseFloat(q.previous_close) || price
  const pct  = q.percent_change
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

// Fetch in two staggered batches to stay within 8 req/min
async function fetchWatchlist(apiKey) {
  const half = Math.ceil(WATCHLIST.length / 2)
  const batchA = WATCHLIST.slice(0, half)
  const batchB = WATCHLIST.slice(half)

  const resultsA = await Promise.all(batchA.map(({ symbol }) => fetchQuote(symbol, apiKey)))
  await new Promise(r => setTimeout(r, 400)) // small gap between batches
  const resultsB = await Promise.all(batchB.map(({ symbol }) => fetchQuote(symbol, apiKey)))

  return [...resultsA, ...resultsB].filter(Boolean)
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

  const { searchParams } = new URL(request.url)
  const rawSymbol = searchParams.get("symbol")

  // ── Single symbol lookup (search) ────────────────────────────────────────────
  if (rawSymbol) {
    const symbol = rawSymbol.trim().toUpperCase()
      .replace(/\.(NS|BO)$/, "")
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 20)

    if (!symbol) {
      return new Response(JSON.stringify({ error: "Invalid symbol" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors },
      })
    }

    const cacheKey = new Request(`https://cache.mktvision.internal/indian-sym-${symbol}`)
    const cached   = await caches.default.match(cacheKey)
    if (cached) {
      const data = await cached.json()
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
      })
    }

    const result = await fetchQuote(symbol, env.TWELVEDATA_KEY)
    if (!result) {
      return new Response(JSON.stringify({ error: "Symbol not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...cors },
      })
    }

    const body     = JSON.stringify([result])
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(caches.default.put(cacheKey, response.clone()))
    return response
  }

  // ── Watchlist ─────────────────────────────────────────────────────────────────
  const cache    = caches.default
  const cacheKey = new Request("https://cache.mktvision.internal/indian-v3")
  const cached   = await cache.match(cacheKey)

  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const results = await fetchWatchlist(env.TWELVEDATA_KEY)
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
