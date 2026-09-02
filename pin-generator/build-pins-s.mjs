// Build template-S ("SCENIC") pins + a Pinterest bulk-upload CSV for every
// published article, straight from each post's frontmatter.
//
//   node pin-generator/build-pins-s.mjs            # run from the blog repo root
//
// Emits:
//   pin-generator/pins-s.json                      -> feed to generate-pins.mjs
//   pinterest content/pinterest-bulk-upload-<ED>-template-S.csv   (repo-relative,
//     one row per pin: keyword-first Title, Description, Link, Keywords)
//
// Config block below is the only per-blog difference.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ED = 'CAD';
const DOMAIN = 'smallspacehome.ca';
const SITE = 'https://smallspacehome.ca';
const REPO = 'badreddineX/SmallSpaceHome.BLOG';
const BRANCH = 'main';
const PIN_DIR = 'template-s-2026-09-02'; // pinterest-pins/<this>/<slug>-S.png
const CSV_OUT = '../pinterest content/pinterest-bulk-upload-CAD-template-S.csv';
// category (frontmatter) -> Pinterest board name (see pinterest content/PINTEREST-SEO.md)
const BOARD = {
  'Storage': 'Small Apartment Storage Ideas',
  'Organization': 'Small Apartment Organization Ideas',
  'Decor': 'Small Apartment Decor Ideas',
  'Budget Tips': 'Apartment Decor on a Budget',
};
const BOARD_FALLBACK = 'Small Apartment Ideas';
// Pinterest search phrases people actually use in this niche (Pinterest guided-search +
// 2026 trend data), appended per category so pin Keywords lean Pinterest, not Google.
const PIN_KW = {
  'Storage': ['small apartment storage', 'renter friendly storage', 'apartment storage hacks', 'small space storage ideas', 'no drill storage'],
  'Organization': ['small apartment organization', 'apartment organization ideas', 'renter friendly', 'small space organization', 'declutter small apartment'],
  'Decor': ['small apartment decor', 'apartment decor ideas', 'renter friendly decor', 'small apartment aesthetic', 'cozy apartment', 'warm minimalism'],
  'Budget Tips': ['apartment decor on a budget', 'cheap apartment decor', 'renter friendly', 'small apartment ideas', 'budget apartment makeover'],
};
const PIN_KW_FALLBACK = ['small apartment ideas', 'renter friendly', 'small space living', 'apartment inspo'];

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');

// --- tiny frontmatter reader (no dep): grabs the leading --- ... --- block ---
function frontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s?(.*)$/);
    if (kv) {
      key = kv[1];
      let v = kv[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) {
        fm[key] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        fm[key] = v.replace(/^["']|["']$/g, '');
      }
    } else if (key && /^\s*-\s+/.test(line)) {
      if (!Array.isArray(fm[key])) fm[key] = [];
      fm[key].push(line.replace(/^\s*-\s+/, '').replace(/^["']|["']$/g, ''));
    }
  }
  return fm;
}

// --- headline: clean, <=6 words, italicise one topical noun ---
const STOP = new Set(['uk', 'for', 'the', 'a', 'an', 'and', 'to', 'in', 'on', 'of', 'that',
  'ideas', 'idea', 'tips', 'guide', 'your', 'you', 'with', 'without', 'renters', 'renter']);
const SKIP_EM = (w) => /[$(]/.test(w) || /^\d/.test(w) || (w.replace(/[^A-Za-z]/g, '').length <= 3 && w === w.toUpperCase());
const TRAIL_STOP = new Set([...STOP, 'that', 'for', 'small']);
function headline(title, override) {
  if (override) return override;
  let t = title
    .replace(/^\d+\s+/, '')          // "23 Small..." -> "Small..."
    .replace(/\s*\([^)]*\)\s*$/, '') // drop trailing "(Renter-Friendly)"
    .replace(/\s*[:–-]\s+.*$/, '')   // drop ": subtitle" / "– subtitle"
    .replace(/\s+(?:UK|20\d\d)(?:\s+20\d\d)?$/i, '')   // "...UK", "...2026", "...UK 2026"
    .replace(/\s+for (?:Small\s+)?UK (?:Homes|Kitchens|Flats|Rentals|Renters)$/i, '')
    .replace(/\s+for (?:UK )?(?:Homes|Renters|Rentals)$/i, '')
    .replace(/^(?:Smart|How to Style a?|How to)\s+/i, '')
    .trim();
  let words = t.split(/\s+/);
  if (words.length > 7) words = words.slice(0, 7);
  // never end on a dangling stopword/preposition
  while (words.length > 3 && TRAIL_STOP.has(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) words.pop();
  // italicise the last topical noun (>=4 letters, not a stopword/currency/number); skip if none
  for (let i = words.length - 1; i >= 0; i--) {
    const bare = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (bare.length >= 4 && !STOP.has(bare) && !SKIP_EM(words[i])) { words[i] = `<em>${words[i]}</em>`; break; }
  }
  return words.join(' ');
}
const OVR_FILE = resolve(ROOT, 'pin-generator/pins-s-overrides.json');
const OVERRIDES = existsSync(OVR_FILE) ? JSON.parse(readFileSync(OVR_FILE, 'utf8')) : {};

function photoPath(image) {
  const name = (image || '').replace(/^\/images\//, '');
  if (!name) return null;
  for (const p of [`./public/images/${name}`, `./public/images/featured/${name}`]) {
    if (existsSync(resolve(ROOT, p))) return p;
  }
  return `./public/images/${name}`; // best guess; generate-pins will error loudly if wrong
}

const csvCell = (s) => `"${String(s).replace(/"/g, '""')}"`;

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).sort();
const pins = [];
const rows = [['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']];
let n = 0;

for (const file of files) {
  const fm = frontmatter(readFileSync(resolve(BLOG_DIR, file), 'utf8'));
  if (!fm.title) continue;
  const slug = file.replace(/\.md$/, '');
  n += 1;
  const num = String(n).padStart(2, '0');
  const photo = photoPath(fm.image);
  pins.push({ slug, template: 'S', headline: headline(fm.title, OVERRIDES[slug]), domain: DOMAIN, number: num, photo });

  const board = BOARD[fm.category] || BOARD_FALLBACK;
  // Keywords: Pinterest search phrases first (category bank), then the post's own tags,
  // deduped case-insensitively, capped at 9.
  const tagKw = (Array.isArray(fm.tags) ? fm.tags : [])
    .filter((t) => !['Canada', 'IKEA', 'renter-friendly', 'renter friendly'].includes(t));
  const seen = new Set();
  const kws = [...(PIN_KW[fm.category] || PIN_KW_FALLBACK), ...tagKw]
    .filter((k) => { const l = k.toLowerCase(); return l && !seen.has(l) && seen.add(l); })
    .slice(0, 9).join(', ');
  // Title: keyword-first Pinterest phrase — strip Google buyer-intent tails.
  const title = fm.title
    .replace(/^\d+\s+/, '')
    .replace(/\s*\([^)]*\)\s*$/, '')                 // "(Renter-Friendly)", "(Step-by-Step)"...
    .replace(/\s+[—–]\s+[^—–]*$/, (m) =>              // trim a trailing "— clause" only if it's a Google-ish tail
      /where to buy|guide|step|budget|renovation|under [£$]|paint pick|reset aesthetic|options that last|no landlord|no renovation/i.test(m) ? '' : m)
    .replace(/[:,]?\s*under [£$]\d[\d,]*(\s*(cad|gbp))?\s*$/i, '')
    .replace(/:\s*[^:]*(hides everything|paint picks|furniture guide)\s*$/i, '')
    .replace(/^Where to Buy\s+/i, '')
    .replace(/\s+Buying Guide.*$/i, '')
    .replace(/\s*[:—–-]\s*(step-by-step|real budgets?|no renovation needed|cheap options that last|the reset aesthetic)\s*$/i, '')
    .trim().slice(0, 100);
  const desc = (fm.description || fm.excerpt || fm.title).replace(/\s+/g, ' ').trim();
  const mediaUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/pinterest-pins/${PIN_DIR}/${slug}-S.jpg`;
  rows.push([
    title,
    mediaUrl,
    board,
    '',
    (desc + ' Save this pin for later.').slice(0, 480),
    `${SITE}/blog/${slug}/`,
    '',
    kws,
  ].map(csvCell));
}

writeFileSync(resolve(ROOT, 'pin-generator/pins-s.json'), JSON.stringify(pins, null, 1));
writeFileSync(resolve(ROOT, CSV_OUT), '﻿' + rows.map((r) => r.join(',')).join('\r\n') + '\r\n');
console.log(`${ED}: ${pins.length} template-S pins -> pin-generator/pins-s.json`);
console.log(`${ED}: bulk CSV -> ${CSV_OUT.replace('../', '')}`);
const missing = pins.filter((p) => !p.photo || !existsSync(resolve(ROOT, p.photo)));
if (missing.length) console.log(`  ⚠ ${missing.length} pins have a missing/guessed photo: ${missing.map((p) => p.slug).join(', ')}`);
