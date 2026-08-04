# Cover Image Prompts — SmallSpaceHome Digital Products

All covers: **1600×1600 px square**, generated in an AI image tool (Midjourney, Firefly, or similar) and then composited with text overlay in Canva or Figma. Save final composited file as PNG at 300 DPI equivalent before uploading to Fourthwall.

**Brand palette (cad):**  
- Background: warm cream / off-white (#F5F0E8)  
- Primary accent: sage green (#7A9E7E)  
- Secondary accent: warm tan / sandstone (#C4A882)  
- Text overlay blocks: deep forest (#2D4A3E) or warm charcoal (#3C3530)  
- Benefit checkmark ticks: sage green on cream background  

**Photography style:** Premium editorial interior photography. Real-looking (not AI-illustrated), natural daylight, shallow depth of field, warm tones. No people visible. Overhead or 3/4-angle establishing shot preferred over flat-on. Linen textures, natural wood, ceramic vessels, simple greenery as supporting props.

**Text overlay layout (applied in Canva after photo is generated):**
```
[KICKER — small caps, 14–16pt, sage green, centered]
[TITLE — bold serif, 36–44pt, forest/charcoal, centered, 2 lines max]
[SUBTITLE — light weight sans, 14–16pt, warm tan or charcoal, centered, 2 lines max]
─────────────────────────────
✓ Benefit one, plain language, 13pt
✓ Benefit two, plain language, 13pt
✓ Benefit three, plain language, 13pt
✓ Benefit four, plain language, 13pt
─────────────────────────────
[BANNER STRIP — forest background, cream text, "smallspacehome.ca", bottom 80px]
```

---

## Book 01 — The 1-Hour Apartment Reset

*(Cover image already exists — see dig prod/fourthwall/covers/01-one-hour-apartment-reset.png)*

---

## Book 02 — The No-Damage Renter's Toolkit

*(Cover image already exists — see dig prod/fourthwall/covers/02-no-damage-renters-toolkit.png)*

---

## Book 03 — The Move-In Week Survival Kit

*(Cover image already exists — see dig prod/fourthwall/covers/03-move-in-week-survival-kit.png)*

---

## Book 04 — The Small Kitchen Storage Fix

*(Cover image already exists — see dig prod/fourthwall/covers/04-small-kitchen-storage-fix.png)*

---

## Book 05 — The Closet & Wardrobe Reset

*(Cover image already exists — see dig prod/fourthwall/covers/05-closet-wardrobe-reset.png)*

---

## Book 06 — The Small Living Room Layout Fix

### Front Cover Photo Prompt

```
Premium editorial interior photography of a small but beautifully arranged rental apartment living room, 
natural daylight streaming through a tall window with floor-length linen curtains, warm cream and sage 
green colour palette, a compact two-seater sofa in warm greige upholstery floated slightly away from 
the wall, a round oak coffee table, a large jute rug anchoring the seating group, a leggy accent chair 
angled toward the sofa, a large leaning mirror against the perpendicular wall reflecting the window light, 
a fiddle-leaf fig in a ceramic pot in the corner, a single ambient arc floor lamp, three-object styling 
on the coffee table (stacked books, small ceramic vase with dried stems, round wooden tray), warm low 
evening light from a table lamp visible on a side table, shallow depth of field, 3/4-angle room view, 
no people, clean and uncluttered, shot on medium format camera, warm cream walls, sage and tan accents, 
highly aspirational but realistic rental apartment aesthetic, Toronto or Vancouver condo scale room.
1600x1600 square crop. No text in image.
```

### Front Cover Text Overlay (apply in Canva)

```
KICKER:   SMALLSPACEHOME GUIDE NO. 6
TITLE:    The Small Living Room
          Layout Fix
SUBTITLE: Arrange your rental living room to feel bigger,
          styled, and actually livable — no new furniture needed
─────────────────────────────────────────────────────
✓ No-drill, renter-safe throughout
✓ Works for rooms under 200 sq ft
✓ The rug sizing rule designers always use
✓ One Saturday morning to transform it
─────────────────────────────────────────────────────
[BOTTOM BANNER: deep forest bg • cream text • smallspacehome.ca]
```

### Back Cover Text Overlay (apply in Canva)

**Background:** Same room photo, desaturated/darkened to 40% opacity over forest-green solid (#2D4A3E).

```
HEADLINE (cream, bold serif, 22pt):
"Your living room doesn't need a bigger budget.
It needs a better arrangement."

BODY COPY (cream, light sans, 12pt, justified, ~120 words):
Most small apartment living rooms fail for the same three reasons: the sofa 
is against the wrong wall, the rug is too small, and the overhead light is 
doing all the work. None of those problems cost anything to fix.

This guide gives you the exact layout system interior designers use for 
compact spaces — anchor furniture placement, clearance distances, rug 
sizing by room footprint, vertical lift techniques, plug-in lighting layers, 
and a step-by-step Saturday reset sequence that takes the room from 
"just moved in" to "actually styled" in under five hours.

No drilling. No new furniture required. Works in any Canadian rental, 
from a Toronto studio to a Vancouver one-bedroom.

BONUSES LISTED (cream, 11pt):
+ The Room Layout Grid (printable floor plan + furniture cutouts)
+ The Rug Sizing Cheat Sheet (5 common room sizes)
+ The $0 Refresh Checklist (52 free moves)

GUARANTEE BADGE (sage green rounded box, cream text, 10pt):
30-Day Money-Back Guarantee
If your room doesn't feel bigger, email for a full refund.

PRICE + URL (cream, bottom right):
$9 CAD  •  smallspacehome.ca

[BARCODE PLACEHOLDER — bottom left, cream on forest]
```

---

## Notes for all future covers

- Export the raw photo prompt output at full resolution before compositing text — keep originals in `dig prod/fourthwall/covers/raw/` (create folder when needed)
- Upload the final composited 1600×1600 PNG to Fourthwall as the product thumbnail ("Product image 1") and as the PDF cover page
- Keep all cover filenames in format `NN-book-slug.png` to match the books/ folder naming convention
- The build.mjs pipeline expects a cover image at `dig prod/fourthwall/covers/06-small-living-room-layout-fix.png` before the first build run — generate and upload the image before triggering a build
