import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BOARD_RULES = [
  [/storage|closet|pantry|organiz|bin|basket|shoe|laundry|entryway|hallway/i, 'Storage & Organization'],
  [/furniture|bed|desk|coffee|table|chair|sofa/i, 'Small Space Furniture'],
  [/ikea|dollarama|dollar|budget|cheap|free|marketplace/i, 'Budget Tips'],
  [/decor|gallery|plant|reading|nook|office|bedroom|living|bathroom|coffee-corner|vibey|warm|earthy|minimalist|cosy|cozy|winter|fall|spring|seasonal/i, 'Small Apartment Decor'],
  [/layout|studio|renting|toronto|condo|apartment-layout/i, 'Small Space Layout'],
];
const BOARD_BY_CAT = {
  'Storage': 'Storage & Organization',
  'Organization': 'Storage & Organization',
  'Furniture': 'Small Space Furniture',
  'Budget Tips': 'Budget Tips',
  'Decor': 'Small Apartment Decor',
  'Layout': 'Small Space Layout',
  'Seasonal': 'Small Apartment Decor',
};
const boardFor = (slug, cat) => {
  for (const [re, b] of BOARD_RULES) if (re.test(slug)) return b;
  return BOARD_BY_CAT[cat] || 'Small Apartment Decor';
};
const fm = (t, k) => ((t.match(new RegExp(`^${k}:\\s*"(.*)"\\s*$`, 'm')) || [])[1] || '').trim();

function copyFor(title) {
  let main = title.replace(/\s*\((?:20\d\d)\)\s*$/, '');
  let tail = '';
  const ci = main.indexOf(':');
  if (ci > 0) { tail = main.slice(ci + 1).trim(); main = main.slice(0, ci).trim(); }
  let num = null, unit = 'ideas';
  const lead = main.match(/^(\d{1,2})\s+(.*)$/);
  if (lead) { num = lead[1]; main = lead[2]; }
  const tm = tail.match(/^(\d{1,3})\s+(.*)$/);
  if (tm) { num = tm[1]; tail = tm[2]; }
  main = main.replace(/\s+for (?:a )?Small (?:Canadian )?Apartment$/i, '').replace(/\s+Canada$/i, '').trim();
  const w = tail.toLowerCase().match(/(tips|ideas|hacks|picks|ways|tricks|options|steps)/);
  if (num) unit = w ? w[1] : 'ideas';
  let sub = tail.toLowerCase();
  if (!sub) sub = num ? unit + ' for small apartments' : 'for small apartments';
  if (!num) unit = 'guide';
  return { title: main, num, unit: unit.replace(/s$/, 's'), sub };
}

export function loadPosts(root) {
  const dir = resolve(root, 'src/content/blog');
  const out = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const slug = f.replace(/\.md$/, '');
    const t = readFileSync(resolve(dir, f), 'utf8');
    const image = fm(t, 'image').replace(/^\/images\//, '');
    if (!image || !existsSync(resolve(root, 'public/images', image))) { console.log('skip (no cover):', slug); continue; }
    const cat = fm(t, 'category');
    const tags = ((t.match(/^tags:\s*\[(.*)\]/m) || [])[1] || '').split(',').map((x) => x.replace(/["']/g, '').trim()).filter(Boolean);
    out.push({ slug, post: slug, photo: image, kicker: cat.toUpperCase(), ...copyFor(fm(t, 'title')), board: boardFor(slug, cat), broad: tags.slice(0, 2), t });
  }
  return out;
}
