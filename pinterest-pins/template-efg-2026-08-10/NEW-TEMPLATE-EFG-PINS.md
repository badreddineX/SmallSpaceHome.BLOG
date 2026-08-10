# Templates E, F, G — 3 New Pin Styles (2026-08-10)

Three additional pin templates for smallspacehome.ca, built to solve the Decor board's
specific problem: strong Pinterest impressions but the worst outbound-click rate of any
board, despite already having 4 templates (A/B/C/D) in rotation. Each is structurally
distinct from A (full-bleed editorial), B (split panel), C (double-frame), and D
(floating card) — and from each other — so the board gets real visual variety instead
of another reskin of the same silhouette.

Same brand tokens as A–D: sage `#7A8B6F`/`#4F7249` (deep `#4A5A44`), tan `#A8845C`/tan-light
`#C9A87C`, cream `#FAF7F0`, ink `#1E241F`. Fonts: Playfair Display (headline), Montserrat
(kicker/domain).

## Template E — "Taped Polaroid"

Scrapbook feel: textured cream paper background, the cover photo taped in at a slight
tilt like a real polaroid with visible tape corners, kicker above, headline below.
Warmest and most "authentic renter diary" of the three — best suited to lifestyle/decor
articles with a personal, lived-in angle.

## Template F — "Price Tag"

Full-bleed photo with a hanging kraft-style price tag graphic in the top-left corner and
a torn banner carrying the headline lower on the frame. Ties directly into the site's
budget/real-prices positioning even on non-budget articles — the tag reads as "here's
what this is" shorthand.

## Template G — "Archway"

Cream/sage solid-color canvas with the photo revealed through an architectural arched
frame (a nod to real apartment doorways), headline on a draped ribbon banner beneath the
arch. The most graphic/illustrated-feeling of the three — best for articles where the
photo itself is a strong, single confident shot rather than a busy full-room scene.

---

36 pins generated across the same 36 articles already covered by Template D, split evenly
12/12/12 across E/F/G, reusing each article's proven Template D kicker/headline/photo
(same copy, no new headline drafting needed for this pass). 3 articles
(`cozy-winter-apartment-decor`, `small-space-living-room-ideas`, `storage-ideas-for-small-places`)
have 2 variants each from an initial 3-pin test batch plus the full run — kept both since
both render well, giving those 3 extra board coverage.

## Source

- Template code: `pin-generator/generate-pins.mjs` (templates `E`, `F`, `G`)
- Batch spec: `pin-generator/pins-canada-template-efg.json`
- Generation command: `node pin-generator/generate-pins.mjs pin-generator/pins-canada-template-efg.json`
  (run from the site root, not from inside `pin-generator/` — relative photo paths in
  `pins.json` resolve against the repo root)

---

## Pin Title & Subtitle Reference

The `kicker`/`headline` baked into each image is the on-pin graphic copy. The table below
is the separate **Pinterest title + subtitle field copy** to enter when uploading each pin
(distinct SEO surface Pinterest indexes independently of the image text — see
`pinterest content/PINTEREST-SEO.md`), keyword-front-loaded per the site's Pinterest SEO
formula.

| Pin File | Optimized Pinterest Pin Title | Optimized Pinterest Pin Subtitle |
|---|---|---|
| apartment-decor-ideas-F.png | Apartment Decor Ideas for Canadian Renters | Ideas Built for Canadian Rentals |
| apartment-decor-ideas-on-a-budget-E.png | Apartment Decor on a Budget (Under $200 CAD) | Style a Whole Room for Under $200 CAD |
| cozy-winter-apartment-decor-E.png | Cozy Winter Apartment Decor Ideas for Renters | Layer In Warmth Without Losing Your Deposit |
| cozy-winter-apartment-decor-G.png | Cozy Winter Apartment Decor Ideas for Renters | Layer In Warmth Without Losing Your Deposit |
| fall-apartment-decorating-ideas-E.png | Fall Apartment Decorating Ideas for Canadian Renters | Cozy, Seasonal & Fully Renter-Friendly |
| how-to-decorate-a-small-living-room-F.png | How to Decorate a Small Living Room (Step-by-Step) | A Step-by-Step Layout & Styling Plan |
| how-to-make-a-small-room-look-bigger-G.png | How to Make a Small Apartment Room Look Bigger | 13 Designer Tricks, Zero Renovation |
| ikea-small-space-hacks-E.png | Small Apartment IKEA Hacks (15 Space-Saving Ideas) | 15 Hacks Every Small-Space Renter Should Know |
| january-reset-organization-ideas-F.png | Apartment Organization Ideas for a January Reset | Start the Year With a Clean, Sorted Space |
| minimalist-small-apartment-ideas-G.png | Minimalist Small Apartment Ideas for Renters | Less Stuff, More Space — No Full Redesign |
| multifunctional-furniture-small-apartment-E.png | Small Apartment Multifunctional Furniture Ideas | Furniture That Pulls Double Duty |
| quebec-moving-day-storage-guide-F.png | Quebec Moving Day Storage & Packing Guide for Montreal Renters | Everything to Pack, Store & Move by July 1 |
| renter-friendly-apartment-decor-ideas-G.png | Renter-Friendly Apartment Decor Ideas | Deposit-Safe Decor That Actually Sticks |
| seasonal-storage-off-season-clothes-gear-E.png | Small Apartment Seasonal Storage Ideas for Off-Season Gear | Rotate Your Gear Without Losing Space |
| september-student-move-in-storage-guide-F.png | Student Move-In Storage Setup Guide for Small Apartments | What to Buy, What to Skip |
| small-apartment-balcony-storage-ideas-G.png | Small Apartment Balcony Storage Ideas for Renters | No Deposit Risk, No Permanent Changes |
| small-apartment-bathroom-storage-E.png | Small Apartment Bathroom Storage Ideas | Solutions for Rental Bathrooms That Actually Fit |
| small-apartment-bedroom-storage-ideas-F.png | Small Apartment Bedroom Storage Ideas | 13 Ways to Hide More in a Tiny Bedroom |
| small-apartment-home-office-ideas-G.png | Small Apartment Home Office Ideas | A WFH Setup That Doesn't Take Over the Room |
| small-apartment-laundry-storage-ideas-E.png | Small Apartment Laundry Storage Ideas (In-Suite & Shared) | Organize In-Suite or Shared Laundry |
| small-apartment-organization-G.png | Small Apartment Organization Guide (Room by Room) | The System That Actually Sticks |
| small-apartment-organization-ideas-on-a-budget-F.png | Small Apartment Organization on a Budget (Under $100 CAD) | Dollarama to IKEA Finds That Work |
| small-apartment-reading-nook-ideas-E.png | Small Apartment Reading Nook Ideas That Actually Fit | A Cozy Nook Even in 500 Sq Ft |
| small-bedroom-decor-ideas-F.png | Small Bedroom Decor Ideas for Renters | Styling Tricks for a Bedroom That Feels Bigger |
| small-closet-organization-rental-apartment-G.png | Small Closet Organization Ideas for Rental Apartments | Maximize a Tiny Closet — No Shelving Install |
| small-entryway-hallway-storage-ideas-E.png | Small Entryway & Hallway Storage Ideas for Apartments | Sort Shoes, Coats & Keys for Good |
| small-living-room-storage-solutions-F.png | Small Living Room Storage Ideas That Hide Everything | Furniture That Hides Everything |
| small-space-decorating-G.png | Small Space Decorating Rules (14 Designer Tips) | 14 Rules Designers Actually Use |
| small-space-furniture-E.png | Small Space Furniture Ideas for Apartments | Pieces That Earn Their Floor Space |
| small-space-kitchen-organization-F.png | Small Apartment Kitchen Organization Ideas (14 That Work) | 14 Ideas for Every Cabinet, Counter & Corner |
| small-space-living-room-ideas-F.png | Small Space Living Room Ideas (15 That Work) | 15 Layouts for Tiny Living Rooms |
| small-space-living-room-ideas-G.png | Small Space Living Room Ideas (15 That Work) | 15 Layouts for Tiny Living Rooms |
| spring-cleaning-organization-tips-E.png | Apartment Spring Cleaning Tips for Renters | Your Room-by-Room Reset Checklist |
| storage-ideas-for-small-places-F.png | Small Apartment Storage Ideas (23 That Work) | 23 Ideas Tested in a Real 500 Sq Ft Rental |
| storage-ideas-for-small-places-G.png | Small Apartment Storage Ideas (23 That Work) | 23 Ideas Tested in a Real 500 Sq Ft Rental |
| studio-apartment-ideas-G.png | Studio Apartment Ideas That Work | Make One Room Do Everything |
| under-bed-storage-ideas-small-apartment-E.png | Under-Bed Storage Ideas for Small Apartments | Reclaim the Space Under Your Bed |
| vertical-storage-ideas-small-apartment-F.png | Small Apartment Vertical Storage Ideas (No Drilling) | No Drilling Required |
| warm-earthy-color-palette-small-apartment-G.png | Small Apartment Color Palette Ideas: Warm Earthy Tones | 7 Palettes That Make a Rental Feel Like Home |
