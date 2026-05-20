const CACHE_TTL = 900

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

function parseRSS(xml) {
  const items  = []
  const itemRx = /<item>([\s\S]*?)<\/item>/g
  const cdataRx = /<!\[CDATA\[([\s\S]*?)\]\]>/

  const extract = (str, tag) => {
    const m = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
    if (!m) return ''
    const inner = m[1].trim()
    const cdata = inner.match(cdataRx)
    return (cdata ? cdata[1] : inner).replace(/<[^>]+>/g, '').trim()
  }

  let match
  while ((match = itemRx.exec(xml)) !== null && items.length < 6) {
    const item    = match[1]
    const title   = extract(item, 'title')
    const pubDate = extract(item, 'pubDate')
    // Bing puts URL after </link> tag differently
    const linkM   = item.match(/<link[^>]*>([^<]+)/) || item.match(/<link\s*\/>([^<]+)/)
    const link    = linkM ? linkM[1].trim() : extract(item, 'link')
    const source  = extract(item, 'source') || extract(item, 'name') || 'News'
    const ts      = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : 0
    if (title && link) items.push({ headline: title, url: link, source, datetime: ts })
  }
  return items
}

function buildQuery(symbol, type, name) {
  if (type === 'crypto') {
    const names = { BTC: 'Bitcoin', ETH: 'Ethereum', BNB: 'BNB', XRP: 'XRP', SOL: 'Solana', USDT: 'Tether', USDC: 'USDC', TRX: 'TRON' }
    return (names[symbol] || symbol) + ' cryptocurrency'
  }
  if (type === 'indian') return (name || symbol) + ' NSE India stock'
  return (name || symbol) + ' stock'
}

async function fetchRSS(url) {
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cf: { cacheTtl: CACHE_TTL }
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.text()
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
  const symbol = (searchParams.get("symbol") || "").toUpperCase().replace(/[^A-Z0-9.]/g, "").slice(0, 20)
  const type   = searchParams.get("type") || "stock"
  const name   = (searchParams.get("name") || "").replace(/[^a-zA-Z0-9\s]/g, "").trim().slice(0, 40)

  const cacheKey = new Request(`https://cache.mktvision.internal/news-v3-${type}-${symbol}`)
  const cached   = await caches.default.match(cacheKey)
  if (cached) return new Response(await cached.text(), {
    headers: { "Content-Type": "application/json", "X-Cache": "HIT", ...cors }
  })

  const query = buildQuery(symbol, type, name)
  const errors = []

  // Try 1: Bing News RSS
  try {
    const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&mkt=en-US`
    const xml  = await fetchRSS(url)
    const articles = parseRSS(xml)
    if (articles.length > 0) {
      const body = JSON.stringify({ articles, source: 'bing' })
      const resp = new Response(body, { headers: { "Content-Type": "application/json", "X-Cache": "MISS", ...cors } })
      waitUntil(caches.default.put(cacheKey, new Response(body, { headers: { "Content-Type": "application/json" } })))
      return resp
    }
    errors.push('bing: empty')
  } catch (e) { errors.push('bing: ' + e.message) }

  // Try 2: Google News RSS
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
    const xml  = await fetchRSS(url)
    const articles = parseRSS(xml)
    if (articles.length > 0) {
      const body = JSON.stringify({ articles, source: 'google' })
      const resp = new Response(body, { headers: { "Content-Type": "application/json", "X-Cache": "MISS", ...cors } })
      waitUntil(caches.default.put(cacheKey, new Response(body, { headers: { "Content-Type": "application/json" } })))
      return resp
    }
    errors.push('google: empty')
  } catch (e) { errors.push('google: ' + e.message) }

  // Try 3: Finnhub general news fallback
  if (env.FINNHUB_KEY && type === 'stock') {
    try {
      const to   = new Date()
      const from = new Date(to - 7 * 86400000)
      const fmt  = d => d.toISOString().split('T')[0]
      const url  = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(to)}&token=${env.FINNHUB_KEY}`
      const r    = await fetch(url)
      const data = await r.json()
      if (Array.isArray(data) && data.length > 0) {
        const articles = data.slice(0, 5).map(a => ({ headline: a.headline, url: a.url, source: a.source, datetime: a.datetime }))
        const body = JSON.stringify({ articles, source: 'finnhub' })
        const resp = new Response(body, { headers: { "Content-Type": "application/json", "X-Cache": "MISS", ...cors } })
        waitUntil(caches.default.put(cacheKey, new Response(body, { headers: { "Content-Type": "application/json" } })))
        return resp
      }
      errors.push('finnhub: empty')
    } catch (e) { errors.push('finnhub: ' + e.message) }
  }

  return new Response(JSON.stringify({ articles: [], errors }), {
    status: 200, headers: { "Content-Type": "application/json", ...cors }
  })
}
