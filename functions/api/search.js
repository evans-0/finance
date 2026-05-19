const MAX_QUERY_LENGTH = 20
const CACHE_TTL        = 120

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
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

  const q = (new URL(request.url).searchParams.get("q") || "")
    .trim()
    .replace(/[^A-Za-z0-9\s.]/g, "")
    .slice(0, MAX_QUERY_LENGTH)

  if (!q) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cache    = caches.default
  const cacheKey = new Request(`https://cache.mktvision.internal/search-v2?q=${encodeURIComponent(q.toLowerCase())}`)
  const cached   = await cache.match(cacheKey)
  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    // Run both searches in parallel
    const [finnhubRes, twelveRes] = await Promise.all([
      env.FINNHUB_KEY
        ? fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${env.FINNHUB_KEY}`)
        : Promise.resolve(null),
      env.TWELVEDATA_KEY
        ? fetch(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(q)}&outputsize=8&apikey=${env.TWELVEDATA_KEY}`)
        : Promise.resolve(null),
    ])

    // US stocks from Finnhub
    let usResults = []
    if (finnhubRes?.ok) {
      const data = await finnhubRes.json()
      usResults = (data.result || [])
        .filter(item =>
          item.type === "Common Stock" &&
          item.symbol &&
          /^[A-Z]{1,6}$/.test(item.symbol) // US tickers only from Finnhub
        )
        .slice(0, 5)
        .map(item => ({ symbol: item.symbol, name: item.description, market: "US" }))
    }

    // Indian NSE stocks from Twelve Data
    let indianResults = []
    if (twelveRes?.ok) {
      const data = await twelveRes.json()
      indianResults = (data.data || [])
        .filter(item =>
          item.exchange === "NSE" &&
          item.instrument_type === "Common Stock" &&
          item.symbol &&
          /^[A-Z0-9]{1,20}$/.test(item.symbol)
        )
        .slice(0, 5)
        // Tag with .NS so the dashboard routes to Twelve Data on select
        .map(item => ({ symbol: `${item.symbol}.NS`, name: item.instrument_name, market: "NSE" }))
    }

    // Indian results first, then US, deduplicated
    const seen    = new Set()
    const results = [...indianResults, ...usResults]
      .filter(item => {
        if (seen.has(item.symbol)) return false
        seen.add(item.symbol)
        return true
      })
      .slice(0, 8)

    const body     = JSON.stringify({ results })
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return new Response(JSON.stringify({ results: [] }), {
      status: 502, headers: { "Content-Type": "application/json", ...cors },
    })
  }
}
