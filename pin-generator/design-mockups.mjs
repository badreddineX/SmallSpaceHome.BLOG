// Design-direction mock-ups for Pinterest pins (CAD). Renders 4 styles x 3 posts -> pinterest content/design-options/
//   node pin-generator/design-mockups.mjs     (from the blog repo root)
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, '../pinterest content/design-options');
mkdirSync(OUT, { recursive: true });
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:1000px;height:1500px;overflow:hidden;font-family:'Montserrat',Arial,sans-serif}`;

function photos(slug) {
  const md = readFileSync(resolve(ROOT, 'src/content/blog', slug + '.md'), 'utf8');
  const names = [];
  const add = (p) => { const n = (p || '').replace(/^\/images\//, '').replace(/\.webp$/i, '.jpg'); if (n && !names.includes(n) && /\.jpe?g$/i.test(n) && existsSync(resolve(ROOT, 'public/images', n))) names.push(n); };
  const im = md.match(/^image:\s*"([^"]+)"/m); if (im) add(im[1]);
  for (const m of md.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) add(m[1]);
  return names.map((n) => pathToFileURL(resolve(ROOT, 'public/images', n)).href);
}

const POSTS = [
  { slug: 'apartment-decor-ideas-on-a-budget', head: 'Budget Apartment Decor', label: 'UNDER $200 CAD', num: null },
  { slug: 'small-closet-organization-rental-apartment', head: 'Small Closet Organization', label: 'NO DRILL', num: null },
  { slug: 'renter-friendly-gallery-wall-ideas', head: 'No-Nail Gallery Wall Ideas', label: 'RENTER FRIENDLY', num: '15' },
];
const fs = (h, base = 120) => { const n = h.length; return n <= 18 ? base : n <= 26 ? base * 0.88 : n <= 34 ? base * 0.76 : base * 0.66; };

const STYLES = {
  // A: current template P (overlay, big bold sans)
  A: (p, ph) => `<style>${BASE}
    .ph{position:absolute;inset:0;background:url('${ph[0]}') center/cover}
    .gr{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,14,12,.28),rgba(10,14,12,0) 24%,rgba(10,14,12,.10) 46%,rgba(10,14,12,.90))}
    .pill{position:absolute;top:56px;left:64px;background:#C9A87C;color:#1B211D;font-weight:800;font-size:27px;letter-spacing:.16em;padding:14px 26px;border-radius:999px}
    .tx{position:absolute;left:64px;right:64px;bottom:60px;color:#FBF8F1}.h{font-weight:800;line-height:1.04;letter-spacing:-.02em;font-size:${fs(p.head, 138)}px}
    .d{margin-top:26px;font-weight:700;font-size:23px;letter-spacing:.22em;opacity:.85}</style>
    <div class="ph"></div><div class="gr"></div><div class="pill">${p.label}</div><div class="tx"><div class="h">${p.head}</div><div class="d">SMALLSPACEHOME.CA</div></div>`,
  // B: magazine card - photo with a cream editorial card overlapping the bottom
  B: (p, ph) => `<style>${BASE} body{background:#EFE6D6}
    .ph{position:absolute;left:0;top:0;width:1000px;height:1040px;background:url('${ph[0]}') center/cover}
    .card{position:absolute;left:60px;right:60px;top:830px;height:560px;background:#FBF7EF;border-radius:6px;box-shadow:0 24px 60px rgba(0,0,0,.28);padding:52px 56px;display:flex;flex-direction:column;justify-content:space-between}
    .lab{font-weight:800;font-size:24px;letter-spacing:.24em;color:#A8845C}
    .h{font-family:'Playfair Display',serif;font-weight:800;line-height:1.05;font-size:${fs(p.head, 104)}px;color:#24302A;margin-top:26px}
    .rule{width:120px;height:5px;background:#C9A87C;margin:28px 0 0}
    .d{font-weight:700;font-size:22px;letter-spacing:.24em;color:#5B6B5A}</style>
    <div class="ph"></div><div class="card"><div><div class="lab">${p.label}</div><div class="h">${p.head}</div><div class="rule"></div></div><div class="d">SMALLSPACEHOME.CA</div></div>`,
  // C: collage - two photos on top, colour band, third photo strip
  C: (p, ph) => `<style>${BASE} body{background:#24302A}
    .a{position:absolute;left:0;top:0;width:498px;height:760px;background:url('${ph[0]}') center/cover}
    .b{position:absolute;left:502px;top:0;width:498px;height:760px;background:url('${ph[1] || ph[0]}') ${ph[1] ? 'center' : 'right center'}/cover}
    .band{position:absolute;left:0;top:760px;width:1000px;height:740px;padding:60px 64px;color:#FBF8F1;display:flex;flex-direction:column;justify-content:space-between}
    .pill{display:inline-block;background:#C9A87C;color:#1B211D;font-weight:800;font-size:27px;letter-spacing:.16em;padding:14px 26px;border-radius:999px}
    .h{font-weight:800;line-height:1.04;letter-spacing:-.02em;font-size:${fs(p.head, 122)}px;margin-top:32px}
    .d{font-weight:700;font-size:23px;letter-spacing:.22em;color:#C9A87C}</style>
    <div class="a"></div><div class="b"></div><div class="band"><div><span class="pill">${p.label}</span><div class="h">${p.head}</div></div><div class="d">SMALLSPACEHOME.CA</div></div>`,
  // E: text-first - big headline on cream at top, rounded photo below, number badge if listicle
  E: (p, ph) => `<style>${BASE} body{background:#F6EFE2}
    .top{position:absolute;left:0;top:0;width:1000px;height:600px;padding:70px 64px 0}
    .lab{font-weight:800;font-size:26px;letter-spacing:.24em;color:#A8845C}
    .h{font-family:'Playfair Display',serif;font-weight:800;line-height:1.04;font-size:${fs(p.head, 128)}px;color:#24302A;margin-top:26px}
    .ph{position:absolute;left:48px;right:48px;top:560px;bottom:48px;background:url('${ph[0]}') center/cover;border-radius:28px;box-shadow:0 18px 50px rgba(0,0,0,.25)}
    .badge{position:absolute;right:80px;top:520px;width:200px;height:200px;border-radius:50%;background:#C9A87C;color:#1B211D;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.3)}
    .d{position:absolute;left:0;right:0;bottom:80px;text-align:center;color:#FBF8F1;font-weight:700;font-size:22px;letter-spacing:.24em;text-shadow:0 2px 12px rgba(0,0,0,.6)}</style>
    <div class="top"><div class="lab">${p.label}</div><div class="h">${p.head}</div></div><div class="ph"></div>
    ${p.num ? `<div class="badge"><div style="font-weight:800;font-size:96px;line-height:1">${p.num}</div><div style="font-weight:800;font-size:24px;letter-spacing:.18em">IDEAS</div></div>` : ''}
    <div class="d">SMALLSPACEHOME.CA</div>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
for (const p of POSTS) {
  const ph = photos(p.slug);
  for (const [k, fn] of Object.entries(STYLES)) {
    const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${fn(p, ph)}</body></html>`;
    const tmp = resolve(OUT, '_m.html'); writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(OUT, `${p.slug}-${k}.jpg`), type: 'jpeg', quality: 90 });
    console.log('ok', p.slug, k, 'photos:', ph.length);
  }
}
await browser.close();
