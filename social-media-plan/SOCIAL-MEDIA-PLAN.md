# SmallSpaceHome.ca — Pinterest + Instagram Management Plan

**Strategy:** for every blog post, produce the same 3 pins + 1 short, cross-posted to both
Pinterest and Instagram with platform-correct sizing. One content set, two distribution
channels — not two separate content pipelines.

| Asset | Pinterest size | Instagram size | Same on both? |
|---|---|---|---|
| 3 static pins (Layouts A/B/C) | 1000×1500 (2:3) | 1080×1350 (4:5, feed) | Same template/branding, re-rendered at native size for each platform — no letterboxing |
| 1 short (video) | 1080×1920 (Idea Pin) | 1080×1920 (Reel) | Identical file, posts natively to both |

Reddit is out of scope for now — it needs community-style engagement (comments, karma-building)
that doesn't fit a content-drip workflow. Revisit after Pinterest + Instagram are running
smoothly.

---

## 0. How to generate the assets

Both generators live in `smallspacehome/pin-generator/` and share the same `pins.json` data
file — one entry per pin, edit once, render for both platforms.

```bash
cd smallspacehome
npm install playwright && npx playwright install chromium   # one-time setup

# Pinterest pins (1000x1500) — writes to out/
node pin-generator/generate-pins.mjs pin-generator/pins.json

# Instagram pins (1080x1350, same templates, no letterboxing) — writes to out-instagram/
node pin-generator/generate-pins.mjs pin-generator/pins.json --ig

# Shorts (1080x1920, works natively for both Pinterest Idea Pins and IG Reels)
# Requires ffmpeg on PATH, or set FFMPEG_PATH to its full binary path.
# Add entries to pin-generator/shorts.json first (see format below), then:
node pin-generator/generate-short.mjs pin-generator/shorts.json   # writes to out-shorts/
```

**`shorts.json` format** — one entry per post, 3-4 photos from that post:

```json
[
  {
    "slug": "small-room-look-bigger",
    "kicker": "13 Tricks · No Renovation",
    "headline": "How to Make a Small Room Look Bigger",
    "domain": "smallspacehome.ca",
    "photos": ["./public/images/blog-14-img1.jpg", "./public/images/blog-14-img2.jpg", "./public/images/blog-14-img3.jpg", "./public/images/blog-14-img4.jpg"]
  }
]
```

Each photo gets ~4.5s with a slow Ken-Burns zoom; total runtime scales with photo count
(4 photos ≈ 18s, inside Pinterest/IG's 15-30s sweet spot). The kicker + headline fade in over
the first 2.5s, the domain line fades in over the last 2s — matching the static pins' branding
(Georgia standing in for Playfair Display, Arial Bold for the sans kicker — the same fallback
fonts already used in the site's own CSS).

**Known gap:** `blog-14-img4.jpg` (used in the "small room look bigger" short) is a luxury
high-rise condo photo — same "too upscale for a rental" mismatch flagged in `PIN-QA-FIXES.md`
for pins. Worth auditing the blog's own image sets for this pattern before generating shorts
at scale, not just the Pinterest pin photos.

---

## 1. Board structure

Create these boards on the Pinterest profile now, in this order (order matters slightly less
than having them exist before the first pin goes up — every pin needs a board). Board
descriptions are keyword-rich on purpose; Pinterest's search algorithm reads them.

| Board name | Board description (paste as-is) |
|---|---|
| **Small Apartment Ideas** | Small apartment ideas for Canadian renters — decor, organization, and storage that work in real rentals, no renovation required. |
| **Small Living Room Ideas** | Small living room ideas and layouts for Canadian apartments — seating, storage, and style for tight square footage. |
| **Small Bedroom Ideas & Storage** | Small bedroom decor and storage ideas for Canadian apartments — closet, under-bed, and wall storage that fits tiny rooms. |
| **Apartment Organization** | Apartment organization systems for small Canadian rentals — kitchen, bathroom, and room-by-room declutter guides. |
| **Budget Apartment Decor** | Budget-friendly apartment decor for Canadian renters — real CAD prices, under $100 and under $200 projects. |
| **Renter-Friendly Decor** | No-drill, deposit-safe decorating ideas for Canadian apartment renters. |
| **IKEA Small Space Hacks** | IKEA hacks for small Canadian apartments — KALLAX, BILLY, NORDLI and other small-space combos with real prices. |
| **Studio Apartment Living** | Studio apartment ideas for Canadians — zoning, storage, and layout for one-room living. |

Set the **profile bio** (if not already done) to: *"Small-space living ideas for Canadian
renters — real apartments, real CAD prices, no renovation. smallspacehome.ca"*

**Instagram has no board equivalent** — organization instead comes from a consistent
**highlight cover** per topic (Storage, Budget, IKEA, etc.) and a **hashtag set per post**,
capped at 8-12 relevant tags mixing broad (`#smallspaceliving`) and specific
(`#kallaxhack`, `#torontoapartment`). Reuse the same board-name keywords as hashtags —
they were already written for search intent.

---

## 2. Pin descriptions — ready to paste

Every post already has 3 pin descriptions drafted in `PINTEREST-PINS.md` (search-optimized,
written per pin). Use those verbatim — don't write new ones on the fly, and don't reuse one
description across multiple pins (Pinterest treats that as lower quality).

**Destination link for every pin:** `https://smallspacehome.ca/blog/<post-slug>/` — always the
blog post, never the homepage.

---

## 3. What's ready to post right now

22 of 23 planned posts have finished pin sets (66 PNGs, in `smallspacehome/pinterest-pins/`).
**Post #21 ("16 Storage Solutions for Small Canadian Apartments") has no pins yet** — its slug
collides with post #3's `storage-ideas` set, which is already spoken for. Skip #21 until new
pins are designed for it; do not pin the same image under two different headlines.

---

## 4. Posting cadence

**Per blog post: 3 pins + 1 short, cross-posted, spread over 3 weeks — not dumped at once.**
Posting a full 4-piece batch same-day reads as spam to both platforms' distribution algorithms;
new accounts specifically benefit from a slow, steady drip.

Each post gets a **4-week rollout**, one asset per week, always posted to Pinterest and
Instagram on the same day:

**Week 1:** Pin 1 → **Week 2:** Pin 2 → **Week 3:** the short → **Week 4:** Pin 3

- Post **Tuesday, Thursday, Saturday**, evening (7–9pm local) — the strongest engagement window on both platforms; late afternoon is the fallback if evenings aren't practical.
- Start **3 new posts on 3 different days of week 1** (Tue/Thu/Sat), then let each run its own 4-week rollout in parallel. This fills all 3 weekly slots from week 1 onward without any overlap collisions, and a new post enters rotation every ~4 weeks as an older one finishes.
- Rotate topics roughly in blog publish order, so evergreen content gets pinned steadily rather than front-loaded.

---

## 5. Four-week calendar

Three posts (A/B/C) start in week 1, each on its own weekday, then run a 4-week rollout in
parallel: Pin 1 → Pin 2 → Short → Pin 3. **Every entry below posts to Pinterest and Instagram
on the same day.** Post picks lead with the highest-intent, most evergreen topics — storage,
organization, and budget content are this niche's best-performing categories.

- **Post A** = `small-room-look-bigger` → board **Small Apartment Ideas**
- **Post B** = `storage-ideas` → board **Small Apartment Ideas**
- **Post C** = `organization-under-100` → board **Budget Apartment Decor**

### Week 1
| Day | Action |
|---|---|
| Tue | **A** — Pin 1 (Layout A) |
| Thu | **B** — Pin 1 (Layout C) |
| Sat | **C** — Pin 1 |

### Week 2
| Day | Action |
|---|---|
| Tue | **A** — Pin 2 (Layout B) |
| Thu | **B** — Pin 2 (Layout A) |
| Sat | **C** — Pin 2 |

### Week 3
| Day | Action |
|---|---|
| Tue | **A** — Short |
| Thu | **B** — Short |
| Sat | **C** — Short |

### Week 4
| Day | Action |
|---|---|
| Tue | **A** — Pin 3 (Layout C) → **A's rollout is done; retire it, start a new Post D here (e.g. `ikea-small-space-hacks`)** |
| Thu | **B** — Pin 3 (Layout B) → retire; start Post E (e.g. `kitchen-organization`) |
| Sat | **C** — Pin 3 → retire; start Post F (e.g. `apartment-decor-budget`) |

**Steady state from week 5 on:** every Tue/Thu/Sat, one post finishes its rollout and a new one
starts in its slot — a rolling 4-week pipeline. Next up after D/E/F: `bedroom-storage`,
`bathroom-storage`, `living-room-ideas`, `studio-apartment`, `minimalist-apartment`,
`small-space-decorating`, `small-space-furniture`, `renter-friendly-decor`,
`apartment-organization`, `decorate-small-living-room`, `apartment-decor-ideas`,
`small-bedroom-decor`, `spring-cleaning`. Seasonal posts (`cozy-winter-decor`,
`fall-apartment-decor`) should be slotted 4-6 weeks *before* the season starts, not during it —
search volume for seasonal terms peaks well ahead of the season itself, on both platforms.

**Shorts still need to be built** for each post before its week-3 slot — see §0 for the
generator. None exist yet except the `small-room-look-bigger` test render used to validate the
pipeline (not yet posted anywhere).

---

## 6. What to track (weekly, 10 minutes)

Check both platforms' native analytics once a week, same day.

| Metric | Pinterest Analytics | Instagram Insights | What it tells you |
|---|---|---|---|
| **Saves** | Per-pin | Saves (feed posts) | Whether the design is compelling enough to save |
| **Outbound clicks** | Per-pin | Link clicks (bio link, since Reels/feed posts can't deep-link) | Whether it's actually driving blog traffic — the metric that matters most |
| **Impressions / reach** | Per-pin | Per-post reach | Whether the platform is distributing it at all — low reach after 2 weeks usually means a keyword/hashtag problem, not a design problem |
| **Watch time / retention** | — (n/a for static pins) | Reels only | Whether the short holds attention past the first 2-3 seconds — if not, the intro headline/hook needs work |

**Decision rule after 4 weeks:** if a topic's Pin 1 has meaningfully more saves/clicks than its
siblings, prioritize posting more content in that topic cluster. If a whole board (Pinterest)
or hashtag set (Instagram) is underperforming across all its posts, the description/hashtags
likely need better keywords — not new pin designs. If Pinterest outperforms Instagram or vice
versa for the same post, that's a signal to shift more of the 3-week budget toward whichever
platform is actually converting, not to keep splitting effort evenly by default.

---

## 7. Guardrails

- Never post the same pin image to two different boards on the same day (Pinterest treats it as duplicate content and suppresses reach).
- Never edit a pin's destination URL after it has saves — Pinterest ties save history to the original URL; changing it orphans existing saves.
- `cozy-winter-decor`, `bathroom-storage-A`, `fall-apartment-decor`, and `organization-under-100` pin photos were **fixed and re-rendered (2026-07-17)** — the scrim-contrast and wrong-photo issues flagged in `PIN-QA-FIXES.md` are resolved for these sets, safe to post as-is.
- **Instagram feed posts only accept one clickable link (the bio link)** — set it to the most recent post's URL right before posting that post's pins, or use a link-in-bio tool if juggling multiple active posts at once. A caption CTA ("link in bio") is required since captions themselves can't carry live links.
- Don't reuse a short's exact caption/hashtag set across multiple Reels — Instagram's spam detection flags near-duplicate captions similarly to Pinterest's duplicate-pin detection.
- Before generating shorts at scale, audit each post's own blog photos for the same "too upscale for a rental" mismatch found in `blog-14-img4.jpg` (see §0) — a bad photo in a short is harder to swap post-publish than a static pin.
