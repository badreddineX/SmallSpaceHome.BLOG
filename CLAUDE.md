# SmallSpaceHome.BLOG — Project Memory

**Domain:** smallspacehome.ca · **Niche:** Canadian apartment/condo/renter living — storage, layout, furniture, budget decor
**Author:** Badreddine Br · **Stack:** Astro 7, deployed on Vercel, content collections in `src/content/blog/`

## Standing rules

- Push content commits after a clean `npm run build` without asking.
- Still ask before: force-push, deletes of anything not obviously disposable, DNS changes, or sending emails on the owner's behalf (draft outreach emails, never send them).
- Always run `npm run build` before committing — `scripts/check-dist.mjs` catches broken links/images and orphan posts; treat any output from it as a real bug, not noise.
- Never fabricate a product URL. If a specific product's existence/price can't be verified (no reliable web access to the retailer), say so and ask, or use a verified search-results link — don't invent an ASIN, shortlink, or "plausible" domain.
- Blog format: answer-first H2s, no AI-detectable phrases, no fabricated stats, real CAD prices from IKEA/Structube/Canadian Tire/Amazon.ca/Wayfair Canada/Home Hardware/Dollarama/HomeSense/FB Marketplace/Kijiji. No haram products (bar carts, alcohol-related items).

## Content architecture

- Hub-and-spoke clusters (storage hub: `storage-ideas-for-small-places`; layout hub: `small-apartment-layout-ideas`). Every spoke links to its hub in the first 300 words and to 2-3 sibling spokes. Cross-cluster links limited to 1-2 per post. `relatedPosts` frontmatter array on every post.
- The site went through a content consolidation (175→20-24 posts) that deleted many thin/overlapping posts and 301-redirected them into merged pages (see `vercel.json` `redirects`). **Before trusting GSC historical data for an old URL, check whether it's now a redirect** — the destination page may not actually cover what made the old URL rank (this happened: `dollarama-finds-look-expensive`, the single best-performing page on the site, got redirected into `first-apartment-essentials-checklist-canada`, which never absorbed its actual vase/planter/styling content — just a dangling self-link, fixed Oct 9).
- Frontmatter format: `title`, `description`, `image`, `datePublished`, `dateModified`, `author`, `tags[]`, `category` (Storage|Decor|Organization|Budget Tips), `featured`, `readTime`, `faqs[]`, `relatedPosts[]`, `tldr[]`.

## Monetization — current real state (verified Oct 9, 2026)

- **Amazon Associates tag: `smallspace06f-20`** (real, provided by owner). All product links across the 24 posts now use `amazon.ca/dp/ASIN?tag=smallspace06f-20` or `amzn.to/...` — verified real, live products (checked via web search before linking, never guessed). `src/plugins/rehype-affiliate-links.mjs` auto-adds `rel="sponsored noopener" target="_blank"` to any `amzn.to` or `amazon.ca` link at build time.
  - **Do not reintroduce `link.amazon/...` links or any fabricated-looking shortlink domain** — a previous session invented ~9 fake links on this fake domain (proof: the same code was reused for two different products), which sat broken for a while before being caught and fixed Oct 9.
- **Newsletter** (Neon + Hostinger SMTP + double opt-in, already built — see `NEWSLETTER.md`) now gives away **`public/digital-products/02-no-damage-renters-toolkit.pdf`** free as the signup incentive, wired into: footer band (`Footer.astro`), in-post form (`BlogPost.astro`), welcome email (`api/_lib/templates.js`), and the thank-you page (`thank-you.astro`, shown on `?src=newsletter`).
- **Digital products / Fourthwall:** the README's claim of a "linked Fourthwall store" with per-post product matching was never actually implemented — no storefront, no checkout, nothing live. **Decision (Oct 9): abandoned.** The other 4 PDFs that were sitting unlinked in `public/digital-products/` (priced $9 CAD each on their own cover pages) were deleted rather than pursued as paid products. Only the one free PDF remains. Don't recreate this Fourthwall/paid-PDF plan without the owner asking for it again.
- **No display ads** (AdSense/Mediavine/etc.) as of Oct 9 — GTM (`GTM-N5MCBQG6`) is already installed site-wide, so turning one on later is a tag-manager change, not a code deploy.

## SEO state (as of Oct 9, 2026 GSC export)

- Young site, DA 1, ~1 real backlink. Average position improved 45→17 over 3 months — real organic progress from on-page/content work alone.
- **Backlinks are the actual ceiling**, not content quality — roughly KD 25 without more links. Prioritize backlink acquisition (see `BACKLINK-PROSPECTS-2026-10-07.md`) over further on-page tweaking once the obvious on-page wins are done.
- Fixed Oct 9: title/meta CTR mismatches on `studio-apartment-furnishing-cost-canada` (ranked top-5 for "fb marketplace furniture" at 0% CTR because the title never mentioned it) and two others; ~18 dead self-referencing internal links left over from the Oct 8 consolidation; a broken featured image (`noise-reduction-apartment-canada`).
- Thin `/blog/category/*` pages (0 clicks, bad positions) flagged as a possible `noindex` candidate — not yet acted on, needs owner sign-off since it changes what Google indexes.

## The winning article format (evidence-based, not a style guess)

Before writing new content, check this against what's actually proven to work rather than defaulting to generic listicle structure:

- **Question-phrased H2s throughout the body, not just a bottom FAQ block.** `dollarama-finds-look-expensive`'s original version got Google to generate deep sitelinks straight to individual H2 sections ("Which Dollarama Vases Actually Look Expensive?", "Do Dollarama Ceramic Planters Look High-End?") — confirmed via the URL fragments GSC reported impressions/clicks against. A plain "## Vases" heading doesn't get this treatment; a natural-language question heading does. Use this pattern for any post whose sub-topics map to real search queries, which the `faqs[]` frontmatter array is a good source for — mirror a few of those Q&As as actual in-body H2s, not just JSON-LD.
- **Narrow, specific sub-topic beats broad topic.** The pages that convert (Facebook Marketplace furniture prices, Dollarama vases specifically, bathroom storage "that works in a rented flat") all answer one concrete, specific thing. The broad head-term pages (`small-space-furniture`, generic "small apartment ideas") sit at position 40-50 regardless of word count — they're competing on terms with real competition, and no amount of on-page work fixes that without backlinks.
- **Title must match the query actually driving impressions, not just the page's nominal topic.** Check GSC's query list before finalizing a title — a page can rank well for a query its title never mentions (this happened twice: Facebook Marketplace furniture, "how to organize small spaces"), and that's a 0%-CTR bug hiding in plain sight.
- **Before deleting/merging a post during any future consolidation, check its GSC performance first.** `dollarama-finds-look-expensive` was deleted as part of the "thin content" cleanup despite being the single best-performing page on the site by raw clicks. A post's apparent thinness or topical overlap with another post is not evidence it should be merged — check clicks/impressions/position in GSC first, every time.
- **Recovering lost keyword demand after a consolidation:** cross-reference GSC's Queries.csv against `vercel.json`'s redirect list. A query cluster that still pulls real impressions/clicks at a decent position (dig for position <20) pointing at a redirected URL whose destination doesn't actually cover that query's topic is a content gap worth recreating, not a lost cause — this is exactly how `dollarama-finds-look-expensive` got rebuilt Oct 9 (confirmed ~140 impressions across "dollarama vase(s)" query variants at positions 6-18 for content that no longer existed anywhere on the site).

## Don't redo

- Phase 1 consolidation (175→20-24 posts, redirects, hub expansion) — done.
- Phase 2 spoke expansion (2,000+ words, hub links in first 300 words, sibling cross-links) — done.
- Phase 3 gap articles (baseboard-heater, condo-board-rules, noise-reduction, structube-vs-ikea) — done, wired into hubs.
- SEO tech cleanup (robots.txt, llms.txt, duplicate sentences) — done.
- Oct 9 fixes above (CTR, self-links, affiliate links, lead magnet) — done, see git log for commit-level detail.
- Oct 9 GEO/keyword pass: rewrote `llms.txt` (was entirely pre-consolidation), regenerated the Pinterest pin schedule + 21 missing pin images, regenerated the Instagram `social/queue.json` (61→16, dropped dead-slug entries), recreated `dollarama-finds-look-expensive` with real recovered keyword demand — see "winning article format" above.
- Still open: 6 current posts have no Instagram image (`social-posts/ig-2026-09/<slug>-ig.jpg` missing) because the generator script referenced in `build-queue.mjs`'s own comment (`pin-generator/build-pins-p.mjs --ig`) doesn't exist in the repo — needs that script built or the images made another way before those posts can join the Instagram queue.
