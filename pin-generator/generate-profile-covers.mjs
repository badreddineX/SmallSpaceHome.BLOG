// Generates Instagram Highlight covers (circular icons) and Pinterest board
// covers (square, branded) — same design system as the pins: Playfair
// Display + Montserrat, cream/sage/tan/ink palette. Writes to
// out-profile/highlights/ and out-profile/boards/.
// Usage: node generate-profile-covers.mjs

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Montserrat:wght@600;700&display=swap" rel="stylesheet">`;

const BASE_CSS = `
  :root{ --ink:#1E241F; --cream:#FAF7F0; --sage:#7A8B6F; --sage-deep:#4A5A44;
         --tan:#A8845C; --tan-light:#C9A87C; --dark:#2C2420; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{overflow:hidden}
`;

// ── Instagram Highlight covers — 1080x1080, cropped to a circle by IG.
// Real photo from the matching topic's blog post (not an abstract icon) —
// reads more native to the niche and previews what's inside the highlight.
// A thin tan ring + subtle bottom scrim keeps it identifiable as "yours"
// even cropped tiny. NOTE: the cover itself isn't clickable — the actual
// destination links live on the link-sticker inside each Story you add
// to the highlight, pointing at that Story's blog post.
// Matches the site's own 4 real categories exactly (see content.config.ts
// enum + footer nav filters: /blog?category=Organization|Decor|Storage|Budget+Tips) —
// not an invented split. Photo picked from an actual post inside that category.
const HIGHLIGHT_PHOTOS = {
  organization: './public/images/blog-03-img3.jpg',  // january-reset-organization-ideas
  decor: './public/images/blog-01-img1.jpg',         // small-space-living-room-ideas
  storage: './public/images/blog-18-img1.jpg',       // small-apartment-bedroom-storage-ideas
  budget: './public/images/blog-15-img1.jpg',        // apartment-decor-ideas-on-a-budget
};

const highlightCover = (photoPath) => `
  <style>${BASE_CSS}
    body{width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;
      background:var(--dark);}
    .ring{width:960px;height:960px;border-radius:50%;padding:14px;
      background:linear-gradient(135deg, var(--tan-light), var(--tan));
      display:flex;align-items:center;justify-content:center;}
    .photo{width:100%;height:100%;border-radius:50%;
      background:url('${pathToFileURL(resolve(photoPath)).href}') center/cover no-repeat;
      box-shadow:inset 0 -140px 160px -80px rgba(20,26,18,.55);}
  </style>
  <div class="ring"><div class="photo"></div></div>
`;

// ── Pinterest board covers — 1000x1000 square (Pinterest center-crops to
// its own aspect on the profile grid, so keep key content centered).
// Matches the pins' Layout C "framed" treatment for brand consistency.
const boardCover = (name) => `
  <style>${BASE_CSS}
    body{width:1000px;height:1000px;background:var(--cream);padding:56px;
      font-family:'Playfair Display',serif;}
    .frame{height:100%;border:4px solid var(--sage);outline:1px solid var(--sage);
      outline-offset:12px;display:flex;flex-direction:column;align-items:center;
      justify-content:center;text-align:center;padding:60px;gap:28px}
    .kicker{font-family:'Montserrat',sans-serif;font-weight:700;font-size:22px;
      letter-spacing:.3em;text-transform:uppercase;color:var(--tan);
      display:flex;align-items:center;gap:18px}
    .kicker::before,.kicker::after{content:'';width:34px;height:1px;background:var(--tan)}
    h2{font-size:64px;line-height:1.2;color:var(--ink);font-weight:600;max-width:680px}
    .domain{font-family:'Montserrat',sans-serif;font-weight:600;font-size:20px;
      letter-spacing:.2em;text-transform:uppercase;color:var(--sage-deep)}
  </style>
  <div class="frame">
    <div class="kicker">Small Space Home</div>
    <h2>${name}</h2>
    <div class="domain">smallspacehome.ca</div>
  </div>
`;

const boards = [
  'Small Apartment\nIdeas',
  'Small Living Room\nIdeas',
  'Small Bedroom Ideas\n& Storage',
  'Apartment\nOrganization',
  'Budget Apartment\nDecor',
  'Renter-Friendly\nDecor',
  'IKEA Small\nSpace Hacks',
  'Studio Apartment\nLiving',
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });

mkdirSync('out-profile/highlights', { recursive: true });
mkdirSync('out-profile/boards', { recursive: true });

for (const [key, photoPath] of Object.entries(HIGHLIGHT_PHOTOS)) {
  await page.setViewportSize({ width: 1080, height: 1080 });
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${highlightCover(photoPath)}</body></html>`;
  const file = resolve(`out-profile/highlights/${key}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `out-profile/highlights/${key}.png` });
  console.log(`✓ out-profile/highlights/${key}.png`);
}

for (const name of boards) {
  const slug = name.toLowerCase().replace(/\n/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  await page.setViewportSize({ width: 1000, height: 1000 });
  const htmlName = name.replace(/\n/g, '<br/>');
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${boardCover(htmlName)}</body></html>`;
  const file = resolve(`out-profile/boards/${slug}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `out-profile/boards/${slug}.png` });
  console.log(`✓ out-profile/boards/${slug}.png`);
}

await browser.close();
