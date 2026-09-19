// Template-P ("PHOTO-FIRST, READABLE") pins + a 30-day scheduled Pinterest bulk-upload CSV.
//
//   node pin-generator/build-pins-p.mjs            # run from the blog repo root
//
// Why: the older templates used ~62px headlines on a 1000px-wide pin, which is ~15px in a
// phone feed. Template P uses 90-130px bold sans headlines, one big photo, a small label pill
// and (when the title starts with a number) a number badge.
//
// Emits:
//   pinterest-pins/template-p-2026-09/<slug>-p<k>.jpg          (1000x1500)
//   pinterest content/pinterest-bulk-upload-CAD-template-P-30days.csv
//
// Variants per post: p1 = overlay layout + post title; p2 = split layout + first FAQ question;
// p3 = badge layout + second FAQ question. Only the scheduled ones are rendered.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ED = 'CAD';
const DOMAIN = 'smallspacehome.ca';
const SITE = 'https://smallspacehome.ca';
const REPO = 'badreddineX/SmallSpaceHome.BLOG';
const BRANCH = 'main';
const PIN_DIR = 'template-p-2026-09';
const START = new Date('2026-09-20T00:00:00');
const SLOTS = ['08:15:00', '12:45:00', '19:30:00'];   // 3 pins/day, local account time
const DAYS = 30;
const CSV_OUT = '../pinterest content/pinterest-bulk-upload-CAD-template-P-30days.csv';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
const OUT_DIR = resolve(ROOT, 'pinterest-pins', PIN_DIR);

// ---------- boards (keyword-first names; create these on Pinterest before uploading) ----------
const BOARD_RULES = [
  [/budget|cheap|dollarama|marketplace|under-?\d|free-cheap|cheapest/i, 'Apartment Decor on a Budget'],
  [/balcony|patio/i, 'Small Balcony Ideas'],
  [/home-office|desk|study/i, 'Small Apartment Home Office Ideas'],
  [/bathroom|beauty|skincare|laundry/i, 'Small Apartment Bathroom Ideas'],
  [/kitchen|pantry|fridge|coffee/i, 'Small Apartment Kitchen Ideas'],
  [/bedroom|closet|wardrobe|nightstand/i, 'Small Bedroom Ideas'],
  [/living-room|sofa|tv|coffee-table|gallery-wall|vibey/i, 'Small Living Room Ideas'],
  [/entry|hallway|shoe|coat|bike/i, 'Entryway and Hallway Ideas'],
];
const BOARD_BY_CAT = { Decor: 'Small Apartment Decor Ideas', Storage: 'Small Apartment Storage Ideas', Organization: 'Small Apartment Organization Ideas', 'Budget Tips': 'Apartment Decor on a Budget' };
function boardFor(slug, cat) {
  for (const [re, b] of BOARD_RULES) if (re.test(slug)) return b;
  return BOARD_BY_CAT[cat] || 'Small Apartment Ideas';
}
const DECOR_FIRST = new Set(['Apartment Decor on a Budget', 'Small Apartment Decor Ideas', 'Small Living Room Ideas', 'Small Bedroom Ideas', 'Small Balcony Ideas']);

const PIN_KW = {
  Storage: ['small apartment storage', 'renter friendly storage', 'apartment storage hacks', 'no drill storage'],
  Organization: ['small apartment organization', 'apartment organization ideas', 'declutter small apartment'],
  Decor: ['small apartment decor', 'apartment decor ideas', 'renter friendly decor', 'cozy apartment'],
  'Budget Tips': ['apartment decor on a budget', 'cheap apartment decor', 'budget apartment makeover'],
};

// ---------- parsing ----------
function split(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fmRaw: m[1], body: m[2] } : { fmRaw: '', body: md };
}
const scalar = (fm, k) => { const m = fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm')); return m ? m[1] : ''; };
function tags(fm) { const m = fm.match(/^tags:\s*\[(.*)\]/m); return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : []; }
function faqs(fm) { return [...fm.matchAll(/-\s*q:\s*"((?:[^"\\]|\\.)*)"\s*\r?\n\s*a:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ q: m[1], a: m[2] })); }
function photos(fm, body) {
  const names = [];
  const add = (p) => { const n = (p || '').replace(/^\/images\//, '').replace(/\.webp$/i, '.jpg'); if (n && !names.includes(n)) names.push(n); };
  add(scalar(fm, 'image'));
  for (const m of body.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) add(m[1]);
  return names.filter((n) => existsSync(resolve(ROOT, 'public/images', n)) && /\.jpe?g$/i.test(n));
}

// ---------- headline / label ----------
const STOPEND = new Set(['for', 'the', 'a', 'an', 'and', 'to', 'in', 'on', 'of', 'that', 'your', 'with', 'without', 'small']);
function headlineParts(title) {
  let t = title.replace(/\s*\|.*$/, '');
  const numM = t.match(/^(\d{1,2})\s+(.*)$/);
  const number = numM ? numM[1] : null;
  if (numM) t = numM[2];
  let pill = null;
  const under = t.match(/[:\-–—]?\s*Under\s+\$(\d[\d,]*)(?:\s*CAD)?/i);
  if (under) { pill = `UNDER $${under[1]} CAD`; t = t.replace(under[0], ''); }
  t = t.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*[:–—-]\s+.*$/, '').replace(/\s*\(Canada\)$/i, '').trim();
  let words = t.split(/\s+/).slice(0, 7);
  while (words.length > 3 && STOPEND.has(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) words.pop();
  return { number, headline: words.join(' '), pill };
}
function labelFor(fmRaw, pill) {
  if (pill) return pill;
  if (/no[- ]drill|no drilling/i.test(fmRaw)) return 'NO DRILL';
  if (/renter/i.test(fmRaw)) return 'CANADIAN RENTERS';
  return 'SMALL APARTMENTS';
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- templates ----------
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:1000px;height:1500px;overflow:hidden;font-family:'Montserrat',Arial,sans-serif}
.pill{display:inline-block;background:#C9A87C;color:#1B211D;font-weight:800;font-size:27px;letter-spacing:.16em;padding:14px 26px;border-radius:999px}
.h{font-weight:800;line-height:1.04;letter-spacing:-.02em}
.dom{font-weight:700;font-size:23px;letter-spacing:.22em;text-transform:uppercase}`;
function fs(h) { const n = h.length; return n <= 18 ? 138 : n <= 28 ? 120 : n <= 38 ? 104 : 90; }
const POS = ['center', 'center 30%', 'center 70%'];

function tmpl(p, layout) {
  const size = fs(p.headline);
  const photo = `background:url('${p.photo}') ${POS[p.k % 3]}/cover no-repeat`;
  if (layout === 2) { // split: photo top, solid panel bottom
    return `<style>${BASE} body{background:#24302A}
      .top{position:absolute;left:0;top:0;width:1000px;height:820px;${photo}}
      .panel{position:absolute;left:0;top:820px;width:1000px;height:680px;padding:56px 64px;color:#FBF8F1;display:flex;flex-direction:column;justify-content:space-between}
      .h{font-size:${Math.min(size, 112)}px;color:#FBF8F1}</style>
      <div class="top"></div><div class="panel"><div><span class="pill">${esc(p.label)}</span><div class="h" style="margin-top:34px">${esc(p.headline)}</div></div><div class="dom" style="color:#C9A87C">${DOMAIN}</div></div>`;
  }
  // 1 = overlay, 3 = overlay + number badge
  const badge = layout === 3 && p.number
    ? `<div style="position:absolute;top:56px;left:56px;width:230px;height:230px;border-radius:50%;background:#C9A87C;color:#1B211D;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(0,0,0,.35)"><div style="font-weight:800;font-size:120px;line-height:1">${p.number}</div><div style="font-weight:800;font-size:26px;letter-spacing:.18em">IDEAS</div></div>` : '';
  return `<style>${BASE} body{position:relative}
    .ph{position:absolute;inset:0;${photo}}
    .gr{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,14,12,.28) 0%,rgba(10,14,12,0) 24%,rgba(10,14,12,.10) 46%,rgba(10,14,12,.90) 100%)}
    .tx{position:absolute;left:64px;right:64px;bottom:60px;color:#FBF8F1}
    .h{font-size:${size}px;text-shadow:0 2px 24px rgba(0,0,0,.45);margin-top:30px}</style>
    <div class="ph"></div><div class="gr"></div>${badge}
    ${layout === 3 && p.number ? '' : `<div style="position:absolute;top:56px;left:64px"><span class="pill">${esc(p.label)}</span></div>`}
    <div class="tx">${layout === 3 && p.number ? `<span class="pill">${esc(p.label)}</span>` : ''}<div class="h">${esc(p.headline)}</div><div class="dom" style="margin-top:26px;opacity:.85">${DOMAIN}</div></div>`;
}

// ---------- build post records ----------
const posts = [];
for (const f of readdirSync(BLOG_DIR).filter((x) => x.endsWith('.md')).sort()) {
  const { fmRaw, body } = split(readFileSync(resolve(BLOG_DIR, f), 'utf8'));
  const title = scalar(fmRaw, 'title'); if (!title) continue;
  const slug = f.replace(/\.md$/, '');
  const ph = photos(fmRaw, body);
  if (!ph.length) { console.log(`skip (no usable photo): ${slug}`); continue; }
  const cat = scalar(fmRaw, 'category');
  posts.push({ slug, title, cat, desc: scalar(fmRaw, 'description'), tags: tags(fmRaw), faqs: faqs(fmRaw), photos: ph, fmRaw, board: boardFor(slug, cat), ...headlineParts(title) });
}
console.log(`posts usable: ${posts.length}`);

// ---------- schedule: 3/day x 30 days = 90 pins: every post's p1, then p2 for decor-first posts ----------
const p1 = posts.slice().sort((a, b) => (DECOR_FIRST.has(b.board) ? 1 : 0) - (DECOR_FIRST.has(a.board) ? 1 : 0));
const queue = [...p1.map((p) => ({ post: p, k: 1 })), ...p1.filter((p) => DECOR_FIRST.has(p.board) && p.faqs.length).map((p) => ({ post: p, k: 2 })),
  ...p1.filter((p) => p.number && p.faqs.length > 1).map((p) => ({ post: p, k: 3 }))];
const total = DAYS * SLOTS.length;
const picked = [];
const pool = queue.slice();
while (picked.length < total && pool.length) {
  const prev = picked[picked.length - 1];
  let i = pool.findIndex((c) => !prev || (c.post.board !== prev.post.board && c.post.slug !== prev.post.slug));
  if (i < 0) i = 0;
  picked.push(pool.splice(i, 1)[0]);
}
console.log(`scheduled pins: ${picked.length}`);

// ---------- render ----------
mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
const csvCell = (s) => `"${String(s).replace(/"/g, '""')}"`;
const rows = [['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']];
const boardCount = {};
for (let i = 0; i < picked.length; i++) {
  const { post, k } = picked[i];
  const layout = k; // 1 overlay, 2 split, 3 badge
  const photoName = post.photos[(k - 1) % post.photos.length];
  const photo = pathToFileURL(resolve(ROOT, 'public/images', photoName)).href;
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${tmpl({ ...post, k, photo, label: labelFor(post.fmRaw, post.pill) }, layout)}</body></html>`;
  const tmpHtml = resolve(OUT_DIR, '_pin.html');
  writeFileSync(tmpHtml, html);
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const file = `${post.slug}-p${k}.jpg`;
  await page.screenshot({ path: resolve(OUT_DIR, file), type: 'jpeg', quality: 90 });

  const faq = post.faqs[k === 1 ? -1 : k - 2];
  const title = (k === 1 || !faq ? post.title : faq.q).replace(/\s*\(.*?\)\s*$/, '').slice(0, 100);
  const descBase = k === 1 || !faq ? post.desc : faq.a;
  const seen = new Set();
  const kws = [...(PIN_KW[post.cat] || ['small apartment ideas', 'renter friendly']), ...post.tags.filter((t) => !/^canada$/i.test(t))]
    .filter((x) => { const l = x.toLowerCase(); return l && !seen.has(l) && seen.add(l); }).slice(0, 9).join(', ');
  const day = Math.floor(i / SLOTS.length), slot = SLOTS[i % SLOTS.length];
  const d = new Date(START.getTime() + day * 86400000);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${slot}`;
  rows.push([title, `https://raw.githubusercontent.com/${REPO}/${BRANCH}/pinterest-pins/${PIN_DIR}/${file}`, post.board,
    '', (descBase.replace(/\s+/g, ' ').trim().slice(0, 440) + ' Save this pin for later.'), `${SITE}/blog/${post.slug}?utm_source=pinterest&utm_medium=social&utm_campaign=cad_p${k}`, date, kws].map(csvCell));
  boardCount[post.board] = (boardCount[post.board] || 0) + 1;
}
await browser.close();
writeFileSync(resolve(ROOT, CSV_OUT), '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n') + '\r\n');
console.log(`CSV -> ${CSV_OUT}`);
console.log('boards used:', boardCount);
