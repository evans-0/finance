const CACHE_TIMES = { '5D': 300, '1M': 3600, '3M': 7200, '6M': 14400, '1Y': 86400 }

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

function getRangeParams(range, from, to) {
  const now  = new Date()
  const fmt  = d => d.toISOString().split("T")[0]

  if (range === 'custom' && from && to) {
    return { multiplier: 1, timespan: 'day', from, to, limit: 365 }
  }

  switch (range) {
    case '5D':
      return { multiplier: 1, timespan: 'hour', from: fmt(new Date(now - 7 * 86400000)), to: fmt(now), limit: 200 }
    case '3M':
      return { multiplier: 1, timespan: 'day', from: fmt(new Date(now - 95 * 86400000)), to: fmt(now), limit: 100 }
    case '6M':
      return { multiplier: 1, timespan: 'day', from: fmt(new Date(now - 185 * 86400000)), to: fmt(now), limit: 200 }
    case '1Y':
      return { multiplier: 1, timespan: 'day', from: fmt(new Date(now - 370 * 86400000)), to: fmt(now), limit: 365 }
    default: // 1M
      return { multiplier: 1, timespan: 'day', from: fmt(new Date(now - 35 * 86400000)), to: fmt(now), limit: 35 }
  }
}

export async function onRequest({ request, env, waitUntil }) {
  const origin  = request.headers.get("Origin") || ""
  const allowed = env.ALLOWED_ORIGIN || ""
  const cors    = corsHeaders(origin, allowed)

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors })
  if (allowed && origin && origin !== allowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json", ...cors }
    })
  }

  const { searchParams } = new URL(request.url)
  const symbol = (searchParams.get("symbol") || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10)
  const range  = (searchParams.get("range") || "1M").toUpperCase()
  const from   = searchParams.get("from") || ""
  const to     = searchParams.get("to")   || ""

  if (!symbol) return new Response(JSON.stringify({ error: "symbol required" }), {
    status: 400, headers: { "Content-Type": "application/json", ...cors }
  })
  if (!env.POLYGON_KEY) return new Response(JSON.stringify({ error: "no key" }), {
    status: 503, headers: { "Content-Type": "application/json", ...cors }
  })

  const cacheTTL = CACHE_TIMES[range] || 3600
  const cacheKey = new Request(`https://cache.mktvision.internal/chart-v2-${symbol}-${range}-${from}-${to}`)
  const cached   = await caches.default.match(cacheKey)
  if (cached) return new Response(await cached.text(), {
    headers: { "Content-Type": "application/json", "X-Cache": "HIT", ...cors }
  })

  try {
    const p   = getRangeParams(range === 'CUSTOM' ? 'custom' : range, from, to)
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${p.multiplier}/${p.timespan}/${p.from}/${p.to}?adjusted=true&sort=asc&limit=${p.limit}&apiKey=${env.POLYGON_KEY}`
    const r   = await fetch(url)
    if (!r.ok) throw new Error("Polygon error: " + r.status)
    const data = await r.json()

    if (!data.results || data.results.length === 0) {
      return new Response(JSON.stringify({ candles: [] }), {
        headers: { "Content-Type": "application/json", ...cors }
      })
    }

    const candles = data.results.map(d => ({ t: d.t, o: d.o, h: d.h, l: d.l, c: d.c, v: d.v }))
    const body    = JSON.stringify({ candles, ticker: data.ticker, range, timespan: p.timespan })
    const resp    = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${cacheTTL}`, "X-Cache": "MISS", ...cors }
    })
    waitUntil(caches.default.put(cacheKey, new Response(body, { headers: { "Content-Type": "application/json" } })))
    return resp

  } catch (err) {
    return new Response(JSON.stringify({ candles: [], error: err.message }), {
      status: 502, headers: { "Content-Type": "application/json", ...cors }
    })
  }
}
