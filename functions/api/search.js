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

  if (!env.FINNHUB_KEY) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const raw = (new URL(request.url).searchParams.get("q") || "")
  const q   = raw.trim().replace(/[^A-Za-z0-9\s.]/g, "").slice(0, MAX_QUERY_LENGTH)

  if (q.length < 1) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cache    = caches.default
  const cacheKey = new Request(`https://cache.mktvision.internal/search?q=${encodeURIComponent(q.toLowerCase())}`)
  const cached   = await cache.match(cacheKey)

  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${env.FINNHUB_KEY}`
    )
    if (!r.ok) throw new Error("upstream")
    const data = await r.json()

    const results = (data.result || [])
      .filter(item =>
        (item.type === "Common Stock" || item.type === "EQS") &&
        item.symbol &&
        // Allow US tickers OR Indian .NS/.BO symbols
        (/^[A-Z]{1,6}$/.test(item.symbol) || /^[A-Z0-9]{1,20}\.(NS|BO)$/.test(item.symbol))
      )
      .slice(0, 8)
      .map(item => ({ symbol: item.symbol, name: item.description }))

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
