// Round 2 design mock-ups, layouts adapted from the "Small-Space Pin Kit" (banner top third, sandwich split,
// big number/token, sticker headline). Renders 4 styles x 3 posts -> pinterest content/design-options-round2/
//   node pin-generator/design-mockups-2.mjs     (from the blog repo root)
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, '../pinterest content/design-options-round2');
mkdirSync(OUT, { recursive: true });
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Playfair+Display:ital,wght@0,700;0,800&display=swap" rel="stylesheet">`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:1000px;height:1500px;overflow:hidden;font-family:'Montserrat',Arial,sans-serif}`;

function photos(slug) {
  const md = readFileSync(resolve(ROOT, 'src/content/blog', slug + '.md'), 'utf8');
  const names = [];
  const add = (p) => { const n = (p || '').replace(/^\/images\//, '').replace(/\.webp$/i, '.jpg'); if (n && !names.includes(n) && /\.jpe?g$/i.test(n) && existsSync(resolve(ROOT, 'public/images', n))) names.push(n); };
  const im = md.match(/^image:\s*"([^"]+)"/m); if (im) add(im[1]);
  for (const m of md.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) add(m[1]);
  return names.map((n) => pathToFileURL(resolve(ROOT, 'public/images', n)).href);
}
// palettes from the kit: oat&clay, chalk&sage, butter&brick
const PAL = {
  budget: { bg: '#F7E9C8', accent: '#8E3B2E', ink: '#1B1B1B' },
  closet: { bg: '#F4F5F1', accent: '#8C9E8B', ink: '#24453C' },
  gallery: { bg: '#F0E7DA', accent: '#B4552D', ink: '#40302A' },
};
const POSTS = [
  { slug: 'apartment-decor-ideas-on-a-budget', head: 'Budget Apartment Decor', label: 'UNDER $200 CAD', big: '$200', badge: 'UNDER<br>$200', pal: PAL.budget },
  { slug: 'small-closet-organization-rental-apartment', head: 'Small Closet Organization', label: 'NO DRILL', big: 'NO<br>DRILL', badge: 'NO<br>DRILL', pal: PAL.closet },
  { slug: 'renter-friendly-gallery-wall-ideas', head: 'No-Nail Gallery Wall Ideas', label: 'RENTER FRIENDLY', big: '15', badge: '15<br>IDEAS', pal: PAL.gallery },
];
const fs = (h, base) => { const n = h.length; return n <= 18 ? base : n <= 26 ? base * 0.9 : base * 0.78; };

const STYLES = {
  // F1 Banner Top Third: solid colour band on top (0-500), photo below; headline never touches the photo
  F1: (p, ph) => `<style>${BASE} body{background:${p.pal.bg}}
    .band{position:absolute;left:0;top:0;width:1000px;height:500px;padding:64px 70px;display:flex;flex-direction:column;justify-content:center;background:${p.pal.bg}}
    .lab{font-weight:800;font-size:34px;letter-spacing:.2em;color:${p.pal.accent === '#8C9E8B' ? '#5E7A5F' : p.pal.accent}}
    .h{font-weight:800;line-height:1.02;letter-spacing:-.02em;font-size:${fs(p.head, 132)}px;color:${p.pal.ink};margin-top:22px}
    .ph{position:absolute;left:0;top:500px;width:1000px;height:1000px;background:url('${ph[0]}') center/cover}
    .pill{position:absolute;left:50px;bottom:56px;background:rgba(20,26,18,.72);color:#FBF8F1;font-weight:700;font-size:30px;letter-spacing:.18em;padding:16px 30px;border-radius:999px}</style>
    <div class="band"><div class="lab">${p.label}</div><div class="h">${p.head}</div></div><div class="ph"></div><div class="pill">SMALLSPACEHOME.CA</div>`,
  // F2 Sandwich Split: colour block, photo through the middle, colour block
  F2: (p, ph) => `<style>${BASE} body{background:${p.pal.bg}}
    .top{position:absolute;left:0;top:0;width:1000px;height:430px;padding:60px 80px;display:flex;flex-direction:column;justify-content:center}
    .lab{font-weight:800;font-size:34px;letter-spacing:.2em;color:${p.pal.accent === '#8C9E8B' ? '#5E7A5F' : p.pal.accent}}
    .h{font-weight:800;line-height:1.02;letter-spacing:-.02em;font-size:${fs(p.head, 116)}px;color:${p.pal.ink};margin-top:18px}
    .ph{position:absolute;left:0;top:430px;width:1000px;height:730px;background:url('${ph[0]}') center/cover}
    .bot{position:absolute;left:0;top:1160px;width:1000px;height:340px;padding:60px 80px;display:flex;flex-direction:column;justify-content:center;background:${p.pal.ink};color:#FBF8F1}
    .sub{font-weight:700;font-size:54px;line-height:1.15}.url{margin-top:22px;font-weight:700;font-size:32px;letter-spacing:.2em;color:${p.pal.bg}}</style>
    <div class="top"><div class="lab">${p.label}</div><div class="h">${p.head}</div></div><div class="ph"></div>
    <div class="bot"><div class="sub">Ideas for small apartments</div><div class="url">SMALLSPACEHOME.CA</div></div>`,
  // F4 Big token: giant numeral/word as the graphic on colour, photo bottom half
  F4: (p, ph) => `<style>${BASE} body{background:${p.pal.bg}}
    .big{position:absolute;left:70px;top:40px;font-weight:800;font-size:${p.big.length > 5 ? 250 : 400}px;line-height:.88;letter-spacing:-.04em;color:${p.pal.accent};opacity:.32}
    .h{position:absolute;left:70px;right:70px;top:${p.big.length > 5 ? 520 : 470}px;font-weight:800;line-height:1.02;letter-spacing:-.02em;font-size:${fs(p.head, 104)}px;color:${p.pal.ink}}
    .ph{position:absolute;left:0;top:800px;width:1000px;height:700px;background:url('${ph[0]}') center/cover}
    .pill{position:absolute;left:50px;bottom:50px;background:rgba(20,26,18,.72);color:#FBF8F1;font-weight:700;font-size:30px;letter-spacing:.18em;padding:16px 30px;border-radius:999px}</style>
    <div class="big">${p.big}</div><div class="h">${p.head}</div><div class="ph"></div><div class="pill">SMALLSPACEHOME.CA</div>`,
  // F10 Sticker headline: full-bleed photo, tilted headline label, round badge with the hook
  F10: (p, ph) => `<style>${BASE}
    .ph{position:absolute;inset:0;background:url('${ph[0]}') center/cover}.dim{position:absolute;inset:0;background:rgba(10,14,12,.16)}
    .lbl{position:absolute;left:-30px;width:1060px;top:1040px;height:290px;background:${p.pal.bg};transform:rotate(-3deg);display:flex;align-items:center;padding:0 90px;box-shadow:0 14px 40px rgba(0,0,0,.3)}
    .h{font-weight:800;line-height:1.02;letter-spacing:-.02em;font-size:${fs(p.head, 112)}px;color:${p.pal.ink}}
    .badge{position:absolute;right:60px;top:60px;width:220px;height:220px;border-radius:50%;background:${p.pal.accent};color:#FBF8F1;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:46px;line-height:1.05;letter-spacing:.04em;box-shadow:0 10px 30px rgba(0,0,0,.35)}
    .url{position:absolute;left:0;right:0;bottom:70px;text-align:center;color:#FBF8F1;font-weight:700;font-size:30px;letter-spacing:.22em;text-shadow:0 2px 12px rgba(0,0,0,.7)}</style>
    <div class="ph"></div><div class="dim"></div><div class="badge">${p.badge}</div><div class="lbl"><div class="h">${p.head}</div></div><div class="url">SMALLSPACEHOME.CA</div>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
for (const p of POSTS) {
  const ph = photos(p.slug);
  for (const [k, fn] of Object.entries(STYLES)) {
    const tmp = resolve(OUT, '_m.html');
    writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${fn(p, ph)}</body></html>`);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(OUT, `${p.slug}-${k}.jpg`), type: 'jpeg', quality: 90 });
  }
  console.log('ok', p.slug);
}
await browser.close();
