// check-dist.mjs — post-build static check of the built site.
//
//   npm run build && node scripts/check-dist.mjs
//
// Fails (exit 1) on:
//   - broken internal links  (an href="/…" that resolves to no file in dist/)
//   - broken images          (an <img src="/…"> or srcset entry with no file)
// Warns (does not fail) on:
//   - orphan posts           (a /blog/<slug> page nothing else links to)
//
// External URLs, mailto:/tel:, and pure #anchors are ignored. Query strings and
// hashes are stripped before resolving. A path "/x" matches dist/x, dist/x.html,
// or dist/x/index.html (the site uses trailingSlash: 'never').

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(DIST)) {
  console.error('no dist/ — run `npm run build` first');
  process.exit(1);
}

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const allFiles = walk(DIST);
const relFiles = new Set(allFiles.map((f) => f.slice(DIST.length).replace(/\\/g, '/')));

// redirect stubs (meta-refresh pages Astro emits for config `redirects`) are not
// real pages — don't scan them and don't count them as posts / orphans.
const isRedirectStub = (html) => /http-equiv\s*=\s*["']?refresh/i.test(html.slice(0, 600));
const htmlFiles = allFiles
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !isRedirectStub(readFileSync(f, 'utf8')));

// scan only the rendered markup — a /blog/${p.slug} inside a client <script>
// template literal is not a broken link.
const stripCodeBlocks = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');

// does an internal path resolve to a real file?
function resolves(ref) {
  let p = ref.split('#')[0].split('?')[0];
  if (!p) return true; // "#frag" only
  if (!p.startsWith('/') || p.startsWith('//')) return true; // external / protocol-relative
  p = p.replace(/^\/+/, '').replace(/\/+$/, '');
  if (p === '') return relFiles.has('index.html');
  return relFiles.has(p) || relFiles.has(p + '.html') || relFiles.has(p + '/index.html');
}

const brokenLinks = [];
const brokenImages = [];
const inbound = new Map(); // /blog/<slug>  -> count

// post slugs = real (non-redirect) dist/blog/<slug>/index.html, excluding category/
const postSlugs = new Set();
for (const f of htmlFiles) {
  const rel = f.slice(DIST.length).replace(/\\/g, '/');
  const m = rel.match(/^blog\/([^/]+)\/index\.html$/);
  if (m && m[1] !== 'category') {
    postSlugs.add(m[1]);
    inbound.set('/blog/' + m[1], 0);
  }
}

for (const file of htmlFiles) {
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  const selfSlug = (rel.match(/^blog\/([^/]+)\/index\.html$/) || [])[1] || null;
  const html = stripCodeBlocks(readFileSync(file, 'utf8'));

  // href / src
  for (const m of html.matchAll(/(href|src)\s*=\s*"([^"]+)"/gi)) {
    const attr = m[1].toLowerCase();
    const ref = m[2].trim();
    if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(ref)) {
      // still tally inbound blog links even if absolute to our own domain
    }
    if (ref.startsWith('/') && !ref.startsWith('//')) {
      if (!resolves(ref)) {
        const isImg = IMG_EXT.has(extname(ref.split('#')[0].split('?')[0]).toLowerCase());
        (isImg ? brokenImages : brokenLinks).push({ from: rel, ref });
      }
      const bm = ref.match(/^\/blog\/([a-z0-9-]+)(?:[/#?]|$)/i);
      if (bm && inbound.has('/blog/' + bm[1]) && bm[1] !== selfSlug) {
        inbound.set('/blog/' + bm[1], inbound.get('/blog/' + bm[1]) + 1);
      }
    }
  }

  // srcset (comma-separated "url 320w, url 640w")
  for (const m of html.matchAll(/srcset\s*=\s*"([^"]+)"/gi)) {
    for (const cand of m[1].split(',')) {
      const ref = cand.trim().split(/\s+/)[0];
      if (ref.startsWith('/') && !ref.startsWith('//') && !resolves(ref)) {
        brokenImages.push({ from: rel, ref });
      }
    }
  }
}

const orphans = [...inbound.entries()].filter(([, n]) => n === 0).map(([p]) => p).sort();

// ---- report ----
const dedupe = (arr) => [...new Map(arr.map((x) => [x.from + '|' + x.ref, x])).values()];
const bl = dedupe(brokenLinks);
const bi = dedupe(brokenImages);

console.log(`\n  check-dist — ${htmlFiles.length} HTML pages, ${postSlugs.size} blog posts\n`);

if (bl.length) {
  console.log(`  BROKEN LINKS (${bl.length}):`);
  for (const { from, ref } of bl) console.log(`    ${ref}   ←  ${from}`);
  console.log('');
}
if (bi.length) {
  console.log(`  BROKEN IMAGES (${bi.length}):`);
  for (const { from, ref } of bi) console.log(`    ${ref}   ←  ${from}`);
  console.log('');
}
if (orphans.length) {
  console.log(`  ORPHAN POSTS — no other page links to these (${orphans.length}):`);
  for (const p of orphans) console.log(`    ${p}`);
  console.log('');
}

if (!bl.length && !bi.length) console.log('  no broken links or images\n');
if (!orphans.length) console.log('  no orphan posts\n');

process.exit(bl.length || bi.length ? 1 : 0);
