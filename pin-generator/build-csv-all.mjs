import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts } from './posts-auto.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://smallspacehome.ca';
const START = new Date('2026-10-01T00:00:00');
const SLOTS = ['09:30:00', '13:30:00', '21:00:00'];
const POSTS = loadPosts(ROOT);
const DESIGNS = [['A', 'a'], ['B', 'b'], ['C', 'c']];
const fm = (t, k) => ((t.match(new RegExp(`^${k}:\\s*"(.*)"\\s*$`, 'm')) || [])[1] || '').trim();
const faqs = (t) => [...t.matchAll(/^ {2}- q: "(.*)"\r?\n\s+a: "(.*)"\s*$/gm)].map((m) => ({ q: m[1], a: m[2] }));
const cut = (s, n) => { if (s.length <= n) return s; const h = s.slice(0, n); const i = h.lastIndexOf('. '); return i > 120 ? h.slice(0, i + 1) : h.slice(0, h.lastIndexOf(' ')).replace(/[,;:]$/, '') + '...'; };
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;

const rows = [['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']];
let i = 0;
for (const [design, code] of DESIGNS) {
  for (const p of POSTS) {
    const t = readFileSync(resolve(ROOT, 'src/content/blog', `${p.post}.md`), 'utf8');
    const f = faqs(t)[code === 'b' ? 0 : code === 'c' ? 1 : -1];
    const title = f ? f.q : fm(t, 'title');
    const desc = f ? f.a : fm(t, 'description');
    const tags = ((t.match(/^tags:\s*\[(.*)\]/m) || [])[1] || '').split(',').map((x) => x.replace(/["']/g, '').trim()).filter(Boolean);
    const kws = [...new Set([...p.broad, ...tags])].slice(0, 10);
    const d = new Date(START.getTime() + Math.floor(i / SLOTS.length) * 86400000);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${SLOTS[i % SLOTS.length]}`;
    rows.push([title.slice(0, 100), `${SITE}/pinterest-pins/${p.slug}-${design}.png`, p.board,
      '', `${cut(desc, 340)} Save this pin for later.`,
      `${SITE}/blog/${p.post}?utm_source=pinterest&utm_medium=social&utm_campaign=cad_${code}`, date, kws.join(', ')].map(q));
    i++;
  }
}
const outDir = resolve(ROOT, '..', 'pinterest content');
mkdirSync(outDir, { recursive: true });
const eol = '\r\n';
writeFileSync(resolve(outDir, 'pinterest-bulk-upload-CAD-all.csv'), rows.map((r) => r.join(',')).join(eol) + eol);
console.log(`CAD: ${rows.length - 1} pin rows -> pinterest content/pinterest-bulk-upload-CAD-all.csv`);
