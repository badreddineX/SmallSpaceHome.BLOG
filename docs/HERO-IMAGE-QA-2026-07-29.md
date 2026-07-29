# Blog Post Hero Image QA — Full Site Audit

Every hero image (`image:` frontmatter field) across all 32 posts was reviewed directly
(not just filenames) on 2026-07-29. 13 of the 30 unique image files are wrong for this
brand — either wrong country/region, too luxurious for a budget-renter audience, or
low-quality/dated. This is the same underlying problem already documented for Pinterest
pins in `PIN-QA-FIXES.md`, but confirmed separately here on the live blog post images,
which had not been checked before.

**Root cause:** these all appear to be generic "apartment"/"living room" stock photos
pulled without checking for identifying details (landmarks, foreign branding, luxury
staging) or country/economic-tier fit against the brand's actual positioning (modest,
budget, Canadian renter).

**Blocker:** fixing this properly needs AI-generated replacement images purpose-built for
"modest small Canadian rental apartment" — stock photo search was tried and failed (see
below), so this is parked until `nanobanana-mcp` (Gemini image gen) is configured with a
free Google AI Studio API key.

---

## Confirmed wrong — need replacing (13 images)

| File | Used by | Problem |
|---|---|---|
| `blog-02-img1.jpg` | apartment-decor-ideas | US NFL stadium (Denver Broncos' Empower Field) visible through window — contradicts "Canadian renters" branding |
| `blog-05-img1.jpg` | studio-apartment-ideas | Designer boutique hotel suite, not a real studio apartment |
| `blog-07-img1.jpg` | small-space-furniture | Dated yellowed leather couch against bare wall, ~50-60% dead wall space |
| `blog-08-img1.jpg` | (check usage) | Mexican/Latin American architecture — red stucco, glass block, concrete — wrong country entirely |
| `blog-10-img1.jpg` | how-to-decorate-a-small-living-room | Double-height vaulted-ceiling luxury great room — literally the opposite of "small living room" |
| `blog-13-img1.jpg` | (check usage) | Framed wall art explicitly labeled a named foreign skyscraper ("...Financial Tower") |
| `blog-13-img2.jpg` | (check usage) | Luxury CGI-style designer render, catalog-staged look |
| `blog-14-img2.jpg` | (check usage) | Same Mexican-architecture image as blog-08-img1.jpg, reused in a second slot |
| `blog-16-img1.jpg` | minimalist-small-apartment-ideas | Luxury high-rise 3D render — crystal chandelier, marble floors, dense skyline view |
| `blog-16-img2.jpg` | minimalist-small-apartment-ideas | Second luxury high-rise render, same problem as img1 |
| `blog-17-img1.jpg` | (check usage) | Eastern European tiny-house/cabin kitchen, foreign appliance brand ("Liberton") |
| `blog-18-img2.jpg` | (check usage) | Looks like a retail store display shelf, not a home closet |
| `closet-walkin.jpg` + `blog-18-img1.jpg` | (check usage) | Both oversized luxury walk-in closets — nothing like a small apartment closet |
| `living-room-cozy.jpg` | fall-apartment-decorating-ideas | Ornate heritage mansion with grand staircase — same issue already flagged "STILL BROKEN" for the matching Pinterest pin in `PIN-QA-FIXES.md` |

## Minor / lower priority — real photos, small identity leaks

| File | Used by | Issue |
|---|---|---|
| `blog-14-img1.jpg` | small-apartment-home-office-ideas | Small Stockholm travel poster visible on wall |
| `blog-15-img1.jpg` | apartment-decor-ideas-on-a-budget | Real, warm photo, but skyline through window reads Brazilian, not Canadian |
| `studio-apartment-living.jpg` | (check usage) | Plausible but has non-North American cues (LG-branded monitor, layout style) |

## Confirmed fine — no action needed

`blog-01-img1.jpg`, `blog-04-img1.jpg`, `blog-06-img1.jpg` (= `blog-19-img3.jpg`, same file reused), `blog-09-img1.jpg`, `blog-12-img1.jpg`, `blog-13-img4.jpg`, `blog-18-img3.jpg`, `blog-19-img1.jpg`, `blog-21-img1.jpg`, `blog-23-img1.jpg`, `unsplash-1552321554-5fefe8c9ef14.jpg`

Real, modest, no landmark/luxury/foreign-branding contradictions.

---

## Stock photo replacement attempt — failed, don't repeat without extra scrutiny

A stock-photo search (Pexels/Unsplash) was tried as a faster alternative to AI generation.
Result: the one candidate the search agent rated as the "closest match" for a modest
apartment turned out on direct visual inspection to be a staged luxury high-rise condo
(brass chandelier, boucle sectional, herringbone floors, skyline view) — the same category
of problem as the images it was meant to replace. "Small apartment" as a stock search term
overwhelmingly returns either luxury real-estate photography or messy candid photos; the
modest/real/budget middle ground this brand needs is not well represented in free stock
libraries. **Any future stock photo candidate must be visually verified directly (not
trusted from a search agent's description alone) before use.**

## Recommended fix path

1. Set up `nanobanana-mcp` (`/blog image setup`, needs a free Google AI Studio API key,
   ~2 minutes) — see `blog-image` skill.
2. Generate purpose-built replacements for the 13 confirmed-wrong images (and optionally
   the 3 minor ones) using the Editorial domain mode with an explicit "modest, lived-in,
   budget-decorated small Canadian rental apartment, NOT luxury/staged/hotel-like" brief.
3. Before committing, verify actual usage mapping for the "(check usage)" rows above —
   several images weren't cross-referenced back to their exact post slug in this pass, only
   confirmed as existing on disk and reviewed visually.
