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

108 pins generated: all 36 articles already covered by Template D now also have the
full E + F + G set (not a rotation split), reusing each article's proven Template D
kicker/headline/photo for the on-image graphic copy, plus the site's separate optimized
Pinterest subtitle copy rendered directly on the pin beneath the headline.

## Source

- Template code: `pin-generator/generate-pins.mjs` (templates `E`, `F`, `G`, each now also
  rendering a `.subtitle` line under the headline)
- Batch spec: `pin-generator/pins-canada-template-efg-full.json` (108 entries: 36 articles
  × 3 templates)
- Generation command: `node pin-generator/generate-pins.mjs pin-generator/pins-canada-template-efg-full.json`
  (run from the site root, not from inside `pin-generator/` — relative photo paths in
  `pins.json` resolve against the repo root)

---

## Pin Title & Subtitle Reference

Grouped by article, Template E then F then G. The subtitle is now rendered directly on
the pin image (added 2026-08-10, all 36 articles regenerated with full E+F+G coverage —
108 pins total, replacing the earlier 39-pin partial/no-subtitle batch).

| Article | Template | Pin File | Subtitle (rendered on pin) |
|---|---|---|---|
| Small Apartment Kitchen Organization Ideas (14 That Work) | Template E | small-space-kitchen-organization-E.png | 14 Ideas for Every Cabinet, Counter & Corner |
| Small Apartment Kitchen Organization Ideas (14 That Work) | Template F | small-space-kitchen-organization-F.png | 14 Ideas for Every Cabinet, Counter & Corner |
| Small Apartment Kitchen Organization Ideas (14 That Work) | Template G | small-space-kitchen-organization-G.png | 14 Ideas for Every Cabinet, Counter & Corner |
| Apartment Spring Cleaning Tips for Renters | Template E | spring-cleaning-organization-tips-E.png | Your Room-by-Room Reset Checklist |
| Apartment Spring Cleaning Tips for Renters | Template F | spring-cleaning-organization-tips-F.png | Your Room-by-Room Reset Checklist |
| Apartment Spring Cleaning Tips for Renters | Template G | spring-cleaning-organization-tips-G.png | Your Room-by-Room Reset Checklist |
| Small Apartment Organization Guide (Room by Room) | Template E | small-apartment-organization-E.png | The System That Actually Sticks |
| Small Apartment Organization Guide (Room by Room) | Template F | small-apartment-organization-F.png | The System That Actually Sticks |
| Small Apartment Organization Guide (Room by Room) | Template G | small-apartment-organization-G.png | The System That Actually Sticks |
| Apartment Organization Ideas for a January Reset | Template E | january-reset-organization-ideas-E.png | Start the Year With a Clean, Sorted Space |
| Apartment Organization Ideas for a January Reset | Template F | january-reset-organization-ideas-F.png | Start the Year With a Clean, Sorted Space |
| Apartment Organization Ideas for a January Reset | Template G | january-reset-organization-ideas-G.png | Start the Year With a Clean, Sorted Space |
| Quebec Moving Day Storage & Packing Guide for Montreal Renters | Template E | quebec-moving-day-storage-guide-E.png | Everything to Pack, Store & Move by July 1 |
| Quebec Moving Day Storage & Packing Guide for Montreal Renters | Template F | quebec-moving-day-storage-guide-F.png | Everything to Pack, Store & Move by July 1 |
| Quebec Moving Day Storage & Packing Guide for Montreal Renters | Template G | quebec-moving-day-storage-guide-G.png | Everything to Pack, Store & Move by July 1 |
| Small Apartment IKEA Hacks (15 Space-Saving Ideas) | Template E | ikea-small-space-hacks-E.png | 15 Hacks Every Small-Space Renter Should Know |
| Small Apartment IKEA Hacks (15 Space-Saving Ideas) | Template F | ikea-small-space-hacks-F.png | 15 Hacks Every Small-Space Renter Should Know |
| Small Apartment IKEA Hacks (15 Space-Saving Ideas) | Template G | ikea-small-space-hacks-G.png | 15 Hacks Every Small-Space Renter Should Know |
| Small Apartment Color Palette Ideas: Warm Earthy Tones | Template E | warm-earthy-color-palette-small-apartment-E.png | 7 Palettes That Make a Rental Feel Like Home |
| Small Apartment Color Palette Ideas: Warm Earthy Tones | Template F | warm-earthy-color-palette-small-apartment-F.png | 7 Palettes That Make a Rental Feel Like Home |
| Small Apartment Color Palette Ideas: Warm Earthy Tones | Template G | warm-earthy-color-palette-small-apartment-G.png | 7 Palettes That Make a Rental Feel Like Home |
| Small Apartment Reading Nook Ideas That Actually Fit | Template E | small-apartment-reading-nook-ideas-E.png | A Cozy Nook Even in 500 Sq Ft |
| Small Apartment Reading Nook Ideas That Actually Fit | Template F | small-apartment-reading-nook-ideas-F.png | A Cozy Nook Even in 500 Sq Ft |
| Small Apartment Reading Nook Ideas That Actually Fit | Template G | small-apartment-reading-nook-ideas-G.png | A Cozy Nook Even in 500 Sq Ft |
| Small Apartment Multifunctional Furniture Ideas | Template E | multifunctional-furniture-small-apartment-E.png | Furniture That Pulls Double Duty |
| Small Apartment Multifunctional Furniture Ideas | Template F | multifunctional-furniture-small-apartment-F.png | Furniture That Pulls Double Duty |
| Small Apartment Multifunctional Furniture Ideas | Template G | multifunctional-furniture-small-apartment-G.png | Furniture That Pulls Double Duty |
| Small Apartment Home Office Ideas | Template E | small-apartment-home-office-ideas-E.png | A WFH Setup That Doesn't Take Over the Room |
| Small Apartment Home Office Ideas | Template F | small-apartment-home-office-ideas-F.png | A WFH Setup That Doesn't Take Over the Room |
| Small Apartment Home Office Ideas | Template G | small-apartment-home-office-ideas-G.png | A WFH Setup That Doesn't Take Over the Room |
| Small Space Living Room Ideas (15 That Work) | Template E | small-space-living-room-ideas-E.png | 15 Layouts for Tiny Living Rooms |
| Small Space Living Room Ideas (15 That Work) | Template F | small-space-living-room-ideas-F.png | 15 Layouts for Tiny Living Rooms |
| Small Space Living Room Ideas (15 That Work) | Template G | small-space-living-room-ideas-G.png | 15 Layouts for Tiny Living Rooms |
| Minimalist Small Apartment Ideas for Renters | Template E | minimalist-small-apartment-ideas-E.png | Less Stuff, More Space — No Full Redesign |
| Minimalist Small Apartment Ideas for Renters | Template F | minimalist-small-apartment-ideas-F.png | Less Stuff, More Space — No Full Redesign |
| Minimalist Small Apartment Ideas for Renters | Template G | minimalist-small-apartment-ideas-G.png | Less Stuff, More Space — No Full Redesign |
| How to Make a Small Apartment Room Look Bigger | Template E | how-to-make-a-small-room-look-bigger-E.png | 13 Designer Tricks, Zero Renovation |
| How to Make a Small Apartment Room Look Bigger | Template F | how-to-make-a-small-room-look-bigger-F.png | 13 Designer Tricks, Zero Renovation |
| How to Make a Small Apartment Room Look Bigger | Template G | how-to-make-a-small-room-look-bigger-G.png | 13 Designer Tricks, Zero Renovation |
| How to Decorate a Small Living Room (Step-by-Step) | Template E | how-to-decorate-a-small-living-room-E.png | A Step-by-Step Layout & Styling Plan |
| How to Decorate a Small Living Room (Step-by-Step) | Template F | how-to-decorate-a-small-living-room-F.png | A Step-by-Step Layout & Styling Plan |
| How to Decorate a Small Living Room (Step-by-Step) | Template G | how-to-decorate-a-small-living-room-G.png | A Step-by-Step Layout & Styling Plan |
| Small Space Decorating Rules (14 Designer Tips) | Template E | small-space-decorating-E.png | 14 Rules Designers Actually Use |
| Small Space Decorating Rules (14 Designer Tips) | Template F | small-space-decorating-F.png | 14 Rules Designers Actually Use |
| Small Space Decorating Rules (14 Designer Tips) | Template G | small-space-decorating-G.png | 14 Rules Designers Actually Use |
| Small Space Furniture Ideas for Apartments | Template E | small-space-furniture-E.png | Pieces That Earn Their Floor Space |
| Small Space Furniture Ideas for Apartments | Template F | small-space-furniture-F.png | Pieces That Earn Their Floor Space |
| Small Space Furniture Ideas for Apartments | Template G | small-space-furniture-G.png | Pieces That Earn Their Floor Space |
| Small Bedroom Decor Ideas for Renters | Template E | small-bedroom-decor-ideas-E.png | Styling Tricks for a Bedroom That Feels Bigger |
| Small Bedroom Decor Ideas for Renters | Template F | small-bedroom-decor-ideas-F.png | Styling Tricks for a Bedroom That Feels Bigger |
| Small Bedroom Decor Ideas for Renters | Template G | small-bedroom-decor-ideas-G.png | Styling Tricks for a Bedroom That Feels Bigger |
| Studio Apartment Ideas That Work | Template E | studio-apartment-ideas-E.png | Make One Room Do Everything |
| Studio Apartment Ideas That Work | Template F | studio-apartment-ideas-F.png | Make One Room Do Everything |
| Studio Apartment Ideas That Work | Template G | studio-apartment-ideas-G.png | Make One Room Do Everything |
| Renter-Friendly Apartment Decor Ideas | Template E | renter-friendly-apartment-decor-ideas-E.png | Deposit-Safe Decor That Actually Sticks |
| Renter-Friendly Apartment Decor Ideas | Template F | renter-friendly-apartment-decor-ideas-F.png | Deposit-Safe Decor That Actually Sticks |
| Renter-Friendly Apartment Decor Ideas | Template G | renter-friendly-apartment-decor-ideas-G.png | Deposit-Safe Decor That Actually Sticks |
| Apartment Decor Ideas for Canadian Renters | Template E | apartment-decor-ideas-E.png | Ideas Built for Canadian Rentals |
| Apartment Decor Ideas for Canadian Renters | Template F | apartment-decor-ideas-F.png | Ideas Built for Canadian Rentals |
| Apartment Decor Ideas for Canadian Renters | Template G | apartment-decor-ideas-G.png | Ideas Built for Canadian Rentals |
| Cozy Winter Apartment Decor Ideas for Renters | Template E | cozy-winter-apartment-decor-E.png | Layer In Warmth Without Losing Your Deposit |
| Cozy Winter Apartment Decor Ideas for Renters | Template F | cozy-winter-apartment-decor-F.png | Layer In Warmth Without Losing Your Deposit |
| Cozy Winter Apartment Decor Ideas for Renters | Template G | cozy-winter-apartment-decor-G.png | Layer In Warmth Without Losing Your Deposit |
| Fall Apartment Decorating Ideas for Canadian Renters | Template E | fall-apartment-decorating-ideas-E.png | Cozy, Seasonal & Fully Renter-Friendly |
| Fall Apartment Decorating Ideas for Canadian Renters | Template F | fall-apartment-decorating-ideas-F.png | Cozy, Seasonal & Fully Renter-Friendly |
| Fall Apartment Decorating Ideas for Canadian Renters | Template G | fall-apartment-decorating-ideas-G.png | Cozy, Seasonal & Fully Renter-Friendly |
| Small Apartment Vertical Storage Ideas (No Drilling) | Template E | vertical-storage-ideas-small-apartment-E.png | No Drilling Required |
| Small Apartment Vertical Storage Ideas (No Drilling) | Template F | vertical-storage-ideas-small-apartment-F.png | No Drilling Required |
| Small Apartment Vertical Storage Ideas (No Drilling) | Template G | vertical-storage-ideas-small-apartment-G.png | No Drilling Required |
| Under-Bed Storage Ideas for Small Apartments | Template E | under-bed-storage-ideas-small-apartment-E.png | Reclaim the Space Under Your Bed |
| Under-Bed Storage Ideas for Small Apartments | Template F | under-bed-storage-ideas-small-apartment-F.png | Reclaim the Space Under Your Bed |
| Under-Bed Storage Ideas for Small Apartments | Template G | under-bed-storage-ideas-small-apartment-G.png | Reclaim the Space Under Your Bed |
| Small Living Room Storage Ideas That Hide Everything | Template E | small-living-room-storage-solutions-E.png | Furniture That Hides Everything |
| Small Living Room Storage Ideas That Hide Everything | Template F | small-living-room-storage-solutions-F.png | Furniture That Hides Everything |
| Small Living Room Storage Ideas That Hide Everything | Template G | small-living-room-storage-solutions-G.png | Furniture That Hides Everything |
| Small Entryway & Hallway Storage Ideas for Apartments | Template E | small-entryway-hallway-storage-ideas-E.png | Sort Shoes, Coats & Keys for Good |
| Small Entryway & Hallway Storage Ideas for Apartments | Template F | small-entryway-hallway-storage-ideas-F.png | Sort Shoes, Coats & Keys for Good |
| Small Entryway & Hallway Storage Ideas for Apartments | Template G | small-entryway-hallway-storage-ideas-G.png | Sort Shoes, Coats & Keys for Good |
| Small Closet Organization Ideas for Rental Apartments | Template E | small-closet-organization-rental-apartment-E.png | Maximize a Tiny Closet — No Shelving Install |
| Small Closet Organization Ideas for Rental Apartments | Template F | small-closet-organization-rental-apartment-F.png | Maximize a Tiny Closet — No Shelving Install |
| Small Closet Organization Ideas for Rental Apartments | Template G | small-closet-organization-rental-apartment-G.png | Maximize a Tiny Closet — No Shelving Install |
| Small Apartment Laundry Storage Ideas (In-Suite & Shared) | Template E | small-apartment-laundry-storage-ideas-E.png | Organize In-Suite or Shared Laundry |
| Small Apartment Laundry Storage Ideas (In-Suite & Shared) | Template F | small-apartment-laundry-storage-ideas-F.png | Organize In-Suite or Shared Laundry |
| Small Apartment Laundry Storage Ideas (In-Suite & Shared) | Template G | small-apartment-laundry-storage-ideas-G.png | Organize In-Suite or Shared Laundry |
| Small Apartment Balcony Storage Ideas for Renters | Template E | small-apartment-balcony-storage-ideas-E.png | No Deposit Risk, No Permanent Changes |
| Small Apartment Balcony Storage Ideas for Renters | Template F | small-apartment-balcony-storage-ideas-F.png | No Deposit Risk, No Permanent Changes |
| Small Apartment Balcony Storage Ideas for Renters | Template G | small-apartment-balcony-storage-ideas-G.png | No Deposit Risk, No Permanent Changes |
| Small Apartment Seasonal Storage Ideas for Off-Season Gear | Template E | seasonal-storage-off-season-clothes-gear-E.png | Rotate Your Gear Without Losing Space |
| Small Apartment Seasonal Storage Ideas for Off-Season Gear | Template F | seasonal-storage-off-season-clothes-gear-F.png | Rotate Your Gear Without Losing Space |
| Small Apartment Seasonal Storage Ideas for Off-Season Gear | Template G | seasonal-storage-off-season-clothes-gear-G.png | Rotate Your Gear Without Losing Space |
| Small Apartment Bathroom Storage Ideas | Template E | small-apartment-bathroom-storage-E.png | Solutions for Rental Bathrooms That Actually Fit |
| Small Apartment Bathroom Storage Ideas | Template F | small-apartment-bathroom-storage-F.png | Solutions for Rental Bathrooms That Actually Fit |
| Small Apartment Bathroom Storage Ideas | Template G | small-apartment-bathroom-storage-G.png | Solutions for Rental Bathrooms That Actually Fit |
| Small Apartment Bedroom Storage Ideas | Template E | small-apartment-bedroom-storage-ideas-E.png | 13 Ways to Hide More in a Tiny Bedroom |
| Small Apartment Bedroom Storage Ideas | Template F | small-apartment-bedroom-storage-ideas-F.png | 13 Ways to Hide More in a Tiny Bedroom |
| Small Apartment Bedroom Storage Ideas | Template G | small-apartment-bedroom-storage-ideas-G.png | 13 Ways to Hide More in a Tiny Bedroom |
| Small Apartment Storage Ideas (23 That Work) | Template E | storage-ideas-for-small-places-E.png | 23 Ideas Tested in a Real 500 Sq Ft Rental |
| Small Apartment Storage Ideas (23 That Work) | Template F | storage-ideas-for-small-places-F.png | 23 Ideas Tested in a Real 500 Sq Ft Rental |
| Small Apartment Storage Ideas (23 That Work) | Template G | storage-ideas-for-small-places-G.png | 23 Ideas Tested in a Real 500 Sq Ft Rental |
| Student Move-In Storage Setup Guide for Small Apartments | Template E | september-student-move-in-storage-guide-E.png | What to Buy, What to Skip |
| Student Move-In Storage Setup Guide for Small Apartments | Template F | september-student-move-in-storage-guide-F.png | What to Buy, What to Skip |
| Student Move-In Storage Setup Guide for Small Apartments | Template G | september-student-move-in-storage-guide-G.png | What to Buy, What to Skip |
| Apartment Decor on a Budget (Under $200 CAD) | Template E | apartment-decor-ideas-on-a-budget-E.png | Style a Whole Room for Under $200 CAD |
| Apartment Decor on a Budget (Under $200 CAD) | Template F | apartment-decor-ideas-on-a-budget-F.png | Style a Whole Room for Under $200 CAD |
| Apartment Decor on a Budget (Under $200 CAD) | Template G | apartment-decor-ideas-on-a-budget-G.png | Style a Whole Room for Under $200 CAD |
| Small Apartment Organization on a Budget (Under $100 CAD) | Template E | small-apartment-organization-ideas-on-a-budget-E.png | Dollarama to IKEA Finds That Work |
| Small Apartment Organization on a Budget (Under $100 CAD) | Template F | small-apartment-organization-ideas-on-a-budget-F.png | Dollarama to IKEA Finds That Work |
| Small Apartment Organization on a Budget (Under $100 CAD) | Template G | small-apartment-organization-ideas-on-a-budget-G.png | Dollarama to IKEA Finds That Work |
