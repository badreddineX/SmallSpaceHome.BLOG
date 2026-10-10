# GEO Technical SEO Audit — smallspacehome.ca
Date: 2026-10-10

## Technical Score: 88/100

## Score Breakdown

| Category | Score | Max | Status |
|---|---|---|---|
| Crawlability | 15 | 15 | ✅ Pass |
| Indexability | 11 | 12 | ✅ Pass |
| Security | 10 | 10 | ✅ Pass |
| URL Structure | 8 | 8 | ✅ Pass |
| Mobile Optimization | 10 | 10 | ✅ Pass |
| Core Web Vitals | 12 | 15 | ⚠️ Warn |
| Server-Side Rendering | 15 | 15 | ✅ Pass |
| Page Speed & Server | 7 | 15 | ⚠️ Warn |

---

## AI Crawler Access

| Crawler | User-Agent | Status |
|---|---|---|
| GPTBot | GPTBot | ✅ Allowed |
| OAI-SearchBot | OAI-SearchBot | ✅ Allowed |
| ChatGPT-User | ChatGPT-User | ✅ Allowed |
| ClaudeBot | ClaudeBot | ✅ Allowed |
| PerplexityBot | PerplexityBot | ✅ Allowed |
| Google-Extended | Google-Extended | ✅ Allowed |
| CCBot | CCBot | ✅ Allowed |
| Amazonbot | Amazonbot | ✅ Allowed |
| Applebot-Extended | Applebot-Extended | ✅ Allowed |
| FacebookBot | FacebookBot | ✅ Allowed |
| Bytespider | Bytespider | ✅ Allowed |
| Googlebot | * wildcard | ✅ Allowed |
| Bingbot | * wildcard | ✅ Allowed |

**All AI crawlers explicitly allowed — perfect score.**

---

## Critical Issues (fix immediately)

### 1. `small-apartment-home-office-ideas` — Crawled but NOT indexed
Google crawled this page (last crawl 2026-08-30) but chose not to index it. Likely cause: thin content or low differentiation signal. The page has GSC impressions (256 impr, pos 19) meaning Google knows it exists but won't serve it.

**Fix:** Add 400–600 more words covering: work-from-home setup costs in Canada, specific desk dimensions for Canadian apartment sizes, province-specific WFH tax deductions for renters. Make it the most useful "small home office Canada" article available.

### 2. Sitemap showing 38 pages (stale) — resubmit needed
New deploy went live today (42 posts). GSC sitemap was last read Oct 8 (38 pages). Sitemap needs Google to re-crawl it.

**Fix:** GSC → Sitemaps → 3-dot menu on sitemap-index.xml → Resubmit. (User confirmed doing this — pending Google crawl.)

---

## Warnings (fix this month)

### 3. OG image for blog posts uses article image, not a Pinterest-optimized 1200×630
Current OG image for dollarama post: `/images/apartment-tv-console-vase.jpg` — no guaranteed dimensions in HTML. Social shares may show poorly cropped previews.

**Fix:** Add explicit `og:image:width` and `og:image:height` meta tags (1200 and 630) to blog post layout in Astro.

### 4. No `llms-full.txt`
`llms.txt` exists (200) but `llms-full.txt` returns 404. Full-text llms.txt helps AI models ingest complete article content directly.

**Fix:** Generate a `llms-full.txt` in the `public/` folder with all post titles, URLs, and excerpts concatenated.

### 5. No IndexNow key
`/.well-known/indexnow-key.txt` returns 404. IndexNow notifies Bing (and therefore ChatGPT web search) instantly on new content — currently new posts may take days to appear in Bing.

**Fix:** Generate an IndexNow key at bing.com/indexnow, add the key file to `public/`, add the key to `robots.txt` Sitemap line, and call the IndexNow API on each new post deploy. The `npm run ship` script is the right place to add this.

### 6. Cache-Control on HTML: `max-age=0, must-revalidate`
Every HTML page requires a full server round-trip on repeat visits (even cached hits must revalidate). Vercel handles this well with ETags so repeat visitors get fast 304 responses — but it still adds latency.

**Fix:** This is a Vercel default for SSG. No action needed unless you move off Vercel.

---

## Recommendations (optimize this quarter)

### 7. Add `og:image:width` and `og:image:height` to all posts
Rich social previews require explicit dimensions. Missing these causes some platforms to skip the image entirely.

### 8. Homepage H1 is weak for SEO
Current H1: "Small Space Living, Organized Beautifully" — no keyword value. This won't rank for anything. The homepage doesn't need to rank for a post keyword, but a stronger H1 like "Small Apartment Storage & Decor for Canadian Renters" would reinforce the site's topical authority to Google.

### 9. Homepage canonical missing trailing slash consistency
Canonical is `https://smallspacehome.ca` (no trailing slash). Ensure all internal links to homepage also use this format — no trailing slash version.

### 10. BlogPosting JSON-LD: add `speakable` property
Speakable schema marks which parts of the article are suitable for voice/AI audio responses. Google uses it for Google Assistant answers. Add to the BlogPosting JSON-LD:
```json
"speakable": {
  "@type": "SpeakableSpecification",
  "cssSelector": [".article-intro", "h2"]
}
```

---

## Agent-Readiness Signals (non-scoring)

### RFC 8288 Link Headers
Not applicable — standard blog site, no public API.

### Markdown Content Negotiation
**Status: Not supported** (returns standard HTML with `Accept: text/markdown`)
Forward-looking: Cloudflare-hosted sites can enable this with one config line. Not applicable on Vercel.

### llms.txt
**Status: Present** (`/llms.txt` returns 200) ✅
`/llms-full.txt` — **Missing** (see Warning #4)

### IndexNow
**Status: Not implemented** (see Warning #5)

---

## Detailed Findings

### Crawlability — 15/15
- `robots.txt`: valid, all AI crawlers explicitly listed, sitemap referenced ✅
- XML sitemap: `sitemap-index.xml` → `sitemap-0.xml`, 55 URLs (incl. pages + posts), lastmod present ✅
- HTTP→HTTPS: 308 permanent redirect ✅
- www→non-www: 308 permanent redirect ✅
- All AI crawlers: allowed (see table above) ✅

### Indexability — 11/12
- Canonical: self-referencing on all checked pages ✅
- Duplicate content: no www/HTTP duplicates ✅
- `small-apartment-home-office-ideas`: crawled, not indexed ❌ (−1)
- No hreflang (single-language site) — N/A ✅
- No pagination issues (blog uses simple listing) ✅

### Security — 10/10
- HTTPS enforced, valid cert ✅
- `Strict-Transport-Security: max-age=63072000` ✅
- `X-Content-Type-Options: nosniff` ✅
- `X-Frame-Options: SAMEORIGIN` ✅
- `Referrer-Policy: strict-origin-when-cross-origin` ✅
- `Content-Security-Policy`: present and specific ✅
- `Permissions-Policy`: present ✅

### URL Structure — 8/8
- Clean readable slugs: `/blog/dollarama-finds-look-expensive` ✅
- Consistent hyphen separators ✅
- No redirect chains detected ✅
- No parameter-based URLs ✅

### Mobile Optimization — 10/10
- Viewport meta: `width=device-width, initial-scale=1` ✅
- Vercel-hosted static site — mobile-first by default ✅
- Crawled as MOBILE (confirmed via GSC inspect) ✅

### Core Web Vitals — 12/15
- TTFB: **0.04–0.35s** (Vercel CDN HIT) ✅ excellent
- LCP: estimated good (static HTML, WebP images, CDN) ✅ (+5)
- INP: estimated good (minimal JS, Astro static output) ✅ (+5)
- CLS: **risk flag** — blog post has images without confirmed explicit `width`/`height` in HTML source. 6 `<img>` tags, only 5 lazy-loaded. Above-fold image dimensions must be declared to prevent layout shift. (−3)

### Server-Side Rendering — 15/15
- Raw HTML contains 39 `<p>` tags (full article body server-rendered) ✅
- All H1/H2 headings in raw HTML ✅
- JSON-LD in raw HTML (5 blocks: BlogPosting, FAQPage, WebSite, Organization, BreadcrumbList) ✅
- Meta tags, canonicals, OG tags all in raw HTML ✅
- Astro 7 generates pure static HTML — zero client-side rendering dependency ✅
- **AI crawlers receive complete content** ✅

### Page Speed & Server — 7/15
- TTFB: 43ms (CDN HIT) ✅ (+3)
- Page weight: blog post HTML 116KB — within limit ✅ (+2)
- Images: WebP referenced but explicit `width`/`height` attributes not confirmed on all images ⚠️ (partial +1)
- Compression: Vercel applies gzip/brotli automatically ✅ (+2)
- CDN: Vercel Edge (`X-Vercel-Cache: HIT`) ✅ (+1)
- Cache headers on static assets: HTML pages use `must-revalidate` (Vercel default) — static assets (images, CSS) should have long cache — unconfirmed (−4 estimate)
- JS bundle size: Astro minimal JS — not a concern ✅

---

## Summary

The blog is technically excellent for its stage. SSR is perfect (Astro static), all AI crawlers are allowed, security headers are complete, TTFB is fast. The two real issues to fix are the unindexed home office page (needs content depth) and IndexNow implementation (instant Bing/ChatGPT notification). Everything else is optimization, not a blocker.
