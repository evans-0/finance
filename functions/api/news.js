// News via Google News RSS — free, no key, covers all assets
const CACHE_TTL = 900

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

function parseRSS(xml) {
  const items   = []
  const itemRx  = /<item>([\s\S]*?)<\/item>/g
  const cdataRx = /<!\[CDATA\[([\s\S]*?)\]\]>/
  const tagRx   = tag => new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)

  const extract = (str, tag) => {
    const m = str.match(tagRx(tag))
    if (!m) return ''
    const inner = m[1].trim()
    const cdata = inner.match(cdataRx)
    return cdata ? cdata[1].trim() : inner.replace(/<[^>]+>/g, '').trim()
  }

  let match
  while ((match = itemRx.exec(xml)) !== null && items.length < 5) {
    const item     = match[1]
    const title    = extract(item, 'title')
    const link     = extract(item, 'link') || item.match(/<link\s*\/?>([^<]*)/)?.[1]?.trim() || ''
    const pubDate  = extract(item, 'pubDate')
    const source   = extract(item, 'source')

    if (!title || !link) continue

    // Convert pubDate to unix timestamp
    const ts = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : 0

    items.push({ headline: title, url: link, source: source || 'Google News', datetime: ts })
  }
  return items
}

function buildQuery(symbol, type, name) {
  if (type === 'crypto') {
    const names = { BTC:'Bitcoin', ETH:'Ethereum', BNB:'BNB', XRP:'XRP', SOL:'Solana', USDT:'Tether', USDC:'USDC', TRX:'TRON' }
    return (names[symbol] || symbol) + ' crypto price news'
  }
  if (type === 'indian') return symbol + ' NSE India stock news'
  return (name || symbol) + ' ' + symbol + ' stock news'
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

  const { searchParams } = new URL(request.url)
  const symbol = (searchParams.get("symbol") || "").trim().toUpperCase().replace(/[^A-Z0-9.]/g, "").slice(0, 20)
  const type   = searchParams.get("type") || "stock"
  const name   = (searchParams.get("name") || "").trim().slice(0, 40)

  const cacheKey = new Request(`https://cache.mktvision.internal/news-${type}-${symbol}`)
  const cached   = await caches.default.match(cacheKey)
  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const query   = buildQuery(symbol, type, name)
    const rssUrl  = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
    const r       = await fetch(rssUrl, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/rss+xml,application/xml" } })
    if (!r.ok) throw new Error("RSS fetch failed: " + r.status)

    const xml      = await r.text()
    const articles = parseRSS(xml)

    const body     = JSON.stringify({ articles })
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(caches.default.put(cacheKey, response.clone()))
    return response
  } catch (err) {
    return new Response(JSON.stringify({ articles: [], error: err.message }), {
      status: 502, headers: { "Content-Type": "application/json", ...cors },
    })
  }
}
