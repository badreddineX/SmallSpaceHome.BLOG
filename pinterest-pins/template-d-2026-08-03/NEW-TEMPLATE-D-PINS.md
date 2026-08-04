# Template D — "Floating Card" (2026-08-03)

A 4th pin template for smallspacehome.ca, distinct in silhouette from the existing
A (full-bleed editorial) / B (split panel) / C (double-frame) set: a bright, airy
full-bleed photo with a rounded cream card floating over the lower third (margin
on every side, soft drop shadow), a sage pill-badge kicker instead of a bare
uppercase line, and the same brand palette already defined in the site's own
`global.css` (sage `#8FAF8A`/`#4F7249`, tan `#C4A882`/`#8B6F47`, cream `#FAFAF7`,
ink `#1C1917`).

One pin generated per article — **all 36 published Canada articles now have a
Template D pin**, not just the ones missing coverage. Headlines were drafted in
bulk via Gemini (free tier, per the project's free-LLM delegation policy) applying
the WHO + RESULT + OBJECTION-REMOVAL hook formula, then manually reviewed and
revised: about 30 of Gemini's 36 first-draft hooks leaned on nearly identical
"no drills / no damage" phrasing (would have read as repetitive/spammy across a
real board) and one had a real content mismatch (calling a colour-*palette*
article "no paint"). Final set below diversifies hook type per article (outcome,
time-based, mechanism, transformation, callout — not just objection-removal) and
keeps the renter/deposit-safe framing concentrated on the articles where it's
genuinely the strongest angle (storage/organization topics), matching this
project's proven differentiator.

---

| Article | Kicker | Headline |
|---|---|---|
| Budget Apartment Decor: Under $200 CAD | Under $200 · Deposit-Safe | Rental Decor That Costs *Less* |
| Apartment Decor Ideas for Canadian Renters | Canadian Renters · Easy Wins | Decor Ideas Real *Renters* Use |
| Cozy Winter Apartment Decor for Renters | Winter Cozy · No Damage | Cozy Up Your Rental, *Zero* Drills |
| Fall Apartment Decorating Ideas (Canada) | Fall Decor · Landlord-Safe | Autumn Style Your *Rental* Fast |
| How to Decorate a Small Living Room | Living Room · No Drills | Style a Small Room Like a *Pro* |
| How to Make a Small Room Look Bigger | The Visual Tricks | Make Any Room Feel *Twice* as Big |
| 15 IKEA Small Space Hacks for Apartments | 15 IKEA Hacks | IKEA Tricks Small *Apartments* Need |
| January Reset: Apartment Organization | The January Reset | Start the Year *Clutter-Free* |
| Minimalist Small Apartment Ideas | Less Stuff, More Space | A Minimalist Life, *Renter-Approved* |
| 10 Multifunctional Furniture Ideas | 10 Pieces · Double Duty | Furniture That Does *Double* Duty |
| Quebec Moving Day Storage & Packing Guide | July 1 · Montreal Movers | Survive Quebec's *Moving* Day |
| Renter-Friendly Apartment Decor Ideas | 100% Renter-Approved | Decorate Without *Losing* Your Deposit |
| Seasonal Storage: Off-Season Clothes & Gear | Gear Storage · No Drills | Store Off-Season Gear, *Zero* Clutter |
| September Student Move-In Storage Guide | First-Year Move-In | The Student *Storage* Starter Kit |
| Small Apartment Balcony Storage Ideas | Balcony Storage · No Damage | A Balcony That Works *Harder* |
| Small Apartment Bathroom Storage Ideas | Bathroom · Deposit-Safe | Bathroom Storage, *Zero* Drilling |
| Bedroom Storage Ideas for Apartments | Bedroom Storage · No Drills | Bedroom Clutter, *Solved* |
| Small Apartment Home Office Ideas | Work From Home · No Damage | A Real Desk in a *Tiny* Space |
| Small Apartment Laundry Storage Ideas | Laundry Day · Lease-Safe | Laundry Storage That *Actually* Fits |
| Apartment Organization Under $100 CAD | Under $100 · No Drilling | Get Organized for *Under* $100 |
| Small Apartment Organization Guide | The Organization Guide | A System That *Actually* Sticks |
| 15 Small Apartment Reading Nook Ideas | 15 Tiny-Space Ideas | A Reading Nook, *Even* in a Studio |
| Small Bedroom Decor Ideas for Renters | Bedroom Styling · Budget-Friendly | A Bedroom That Feels *Pulled* Together |
| Small Closet Organization for Rentals | Closet Hacks · No Drills | Double Your *Closet* Space |
| Small Entryway & Hallway Storage Ideas | Entryway · Deposit-Safe | An Entryway That Isn't *Chaos* |
| Small Living Room Storage Solutions | Hidden Storage · Living Room | Furniture That *Hides* Everything |
| 14 Small Space Decorating Rules | 14 Rules | The Small-Space Decorating *Rules* |
| Small Space Furniture for Apartments | Smart Furniture · No Drills | Furniture Built for *Tiny* Rentals |
| 14 Small Kitchen Organization Ideas | 14 Kitchen Ideas | Kitchen Storage *Without* Drilling |
| 15 Small Space Living Room Ideas | 15 Living Room Ideas | Living Rooms That Feel *Bigger* |
| Spring Cleaning Tips for Apartments | The Spring Reset | A Spring Clean That *Actually* Sticks |
| 23 Small Apartment Storage Ideas | 23 Ideas · Deposit-Safe | Storage Ideas With *Zero* Drilling |
| Studio Apartment Ideas That Work | Studio Living · Real Ideas | Make a Studio Feel Like *Two* Rooms |
| Under-Bed Storage Ideas for Small Apartments | Under-Bed · No Damage | The Storage Space You're *Wasting* |
| 12 Vertical Storage Ideas (No Drilling) | 12 Ideas · No Drilling | Go *Vertical*, Skip the Drill |
| 7 Warm Earthy Color Palette Ideas | 7 Combinations · Renter-Safe | Warm Colours *Without* Repainting |

---

## Source

- Template code: `pin-generator/generate-pins.mjs` (template `D`)
- Batch spec: `pin-generator/pins-canada-template-d.json`
- Merged into master list: `pin-generator/pins.json` (now 102 entries total)
- Generation command: `node generate-pins.mjs pins-canada-template-d.json` (run from `pin-generator/`)
- Hook drafting: `openrouter-tools/gemini/gen-canada-hooks.mjs` (Gemini free tier), manually reviewed and revised before use
