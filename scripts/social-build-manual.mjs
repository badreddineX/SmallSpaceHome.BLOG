// Build a ready-to-post batch for manual FB/IG posting — no API, no scheduler.
//
// Uses the EXISTING pin descriptions + pin art (templates D/E/F, rotated), pads
// each 2:3 pin to 4:5 so nothing is cropped on Instagram, and writes a numbered
// "post these" doc with a suggested Tue/Thu/Sat date per post.
//
//   node scripts/social-build-manual.mjs            # CAD
//   node scripts/social-build-manual.mjs --start 2026-09-01

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const CC = 'CAD';
const SITE = 'https://smallspacehome.ca';
const PIN_INFO = path.join(ROOT, '../pinterest content/PIN-INFO-TEMPLATE-D-FULL-57.md');
const PIN_IMG_DIR = path.join(ROOT, 'pinterest-pins/template-def-2026-08-12');
const OUT = path.join(ROOT, 'social-posts', `ready-${CC}`);
const TEMPLATES = ['D', 'E', 'F'];
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };

const BASE_TAGS = ['#smallspaceliving', '#smallapartment', '#rentersofinstagram', '#apartmentdecor', '#canadianhome'];
const tagify = (kw) => {
  const t = kw.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  return !t || t.length > 24 || t.split(' ').length > 3 ? null : '#' + t.replace(/ /g, '');
};

// ---- parse PIN-INFO ----
const md = fs.readFileSync(PIN_INFO, 'utf8').replace(/\r\n/g, '\n');
const pins = md.split(/^## Pin #\d+\s*$/m).slice(1).map((c) => {
  const f = (l) => (c.match(new RegExp(`\\*\\*${l}:\\*\\*\\s*\`?(.+?)\`?\\s*$`, 'm')) || [, ''])[1].trim();
  const link = f('Link');
  return { slug: link.replace(/.*\/blog\//, '').replace(/\/$/, ''), title: f('Title'), description: f('Description'), keywords: f('Keywords').split(',').map((s) => s.trim()).filter(Boolean), board: f('Board'), link };
}).filter((p) => p.slug && p.description);

// ---- slots ----
function* slots(startISO) {
  let d = startISO ? new Date(startISO + 'T00:00:00Z') : new Date();
  d.setUTCHours(23, 0, 0, 0);
  if (d < new Date()) d.setUTCDate(d.getUTCDate() + 1);
  for (;;) {
    const w = d.getUTCDay();
    if (w === 2 || w === 4 || w === 6) yield new Date(d);
    d = new Date(d); d.setUTCDate(d.getUTCDate() + 1); d.setUTCHours(23, 0, 0, 0);
  }
}
const dayName = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];

async function padTo45(src, out) {
  const { width, height } = await sharp(src).metadata();
  const targetW = Math.round(height * 0.8);
  const pad = Math.max(0, Math.round((targetW - width) / 2));
  const { dominant } = await sharp(src).resize(40, 40, { fit: 'fill' }).stats();
  await sharp(src)
    .extend({ left: pad, right: pad, background: { r: dominant.r, g: dominant.g, b: dominant.b } })
    .resize(1080, 1350, { fit: 'cover' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(out);
}

// ---- build ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const gen = slots(arg('--start'));
const doc = [
  `# ${CC} — ready to post (Facebook + Instagram)`, '',
  `${pins.length} posts. Suggested cadence: **Tue / Thu / Sat, ~7pm ET**. Post manually —`,
  `image is in this folder, captions are below. Instagram feed can't carry a live link,`,
  `so keep the bio link on your newest post; Facebook captions include the URL.`,
  '', '---', '',
];
let i = 0, skipped = [];
for (const p of pins) {
  const tpl = TEMPLATES[i % TEMPLATES.length];
  const srcImg = path.join(PIN_IMG_DIR, `${p.slug}-${tpl}.png`);
  if (!fs.existsSync(srcImg)) { skipped.push(p.slug); continue; }
  const imgName = `${String(i + 1).padStart(2, '0')}-${p.slug}.jpg`;
  await padTo45(srcImg, path.join(OUT, imgName));

  const d = gen.next().value;
  const desc = p.description.replace(/Save this pin for later!?/i, 'Save this for later.');
  const tags = [...new Set([...BASE_TAGS, ...p.keywords.map(tagify).filter(Boolean)])].slice(0, 11).join(' ');

  doc.push(`## ${i + 1}. ${p.title}`);
  doc.push(`**${dayName(d)} ${d.toISOString().slice(0, 10)}**  ·  image: \`${imgName}\`  ·  board: ${p.board}`);
  doc.push('', '**Instagram:**', '```', `${desc}\n\nFull guide — link in bio.\n\n${tags}`, '```', '');
  doc.push('**Facebook:**', '```', `${desc}\n\n${p.link}`, '```', '', '---', '');
  i++;
}

fs.writeFileSync(path.join(OUT, 'POST-THESE.md'), doc.join('\n'));
console.log(`${i} posts → social-posts/ready-${CC}/  (images + POST-THESE.md)`);
if (skipped.length) console.log(`no template image for: ${skipped.join(', ')}`);
