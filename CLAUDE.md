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

## Don't redo

- Phase 1 consolidation (175→20-24 posts, redirects, hub expansion) — done.
- Phase 2 spoke expansion (2,000+ words, hub links in first 300 words, sibling cross-links) — done.
- Phase 3 gap articles (baseboard-heater, condo-board-rules, noise-reduction, structube-vs-ikea) — done, wired into hubs.
- SEO tech cleanup (robots.txt, llms.txt, duplicate sentences) — done.
- Oct 9 fixes above (CTR, self-links, affiliate links, lead magnet) — done, see git log for commit-level detail.
