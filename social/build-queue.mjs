// Builds social/queue.json for the Instagram auto-poster from the blog posts + the 4:5 images
// rendered by `node pin-generator/build-pins-p.mjs --ig`. Clean UTF-8 captions, keyword-first.
//   node social/build-queue.mjs
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = resolve(ROOT, 'src/content/blog');
// ---- per-blog config ----
const IMG_REL = 'social-posts/ig-2026-09';
const IMG_BASE = 'https://raw.githubusercontent.com/badreddineX/SmallSpaceHome.BLOG/main/social-posts/ig-2026-09/';
const BASE_TAGS = ['#smallapartment', '#rentersofinstagram'];
const AUDIENCE = 'Canadian small-apartment renters';
// -------------------------
const IMG_DIR = resolve(ROOT, IMG_REL);

function frontmatter(text) {
  const parts = text.split(/^---\s*$/m);
  return parts.length >= 3 ? parts[1] : '';
}
function scalar(fm, key) {
  for (const line of fm.split(/\r?\n/)) {
    if (line.startsWith(key + ':')) {
      const v = line.slice(key.length + 1).trim();
      try { return JSON.parse(v); } catch { return v.replace(/^"|"$/g, ''); }
    }
  }
  return '';
}
function tagsOf(fm) {
  for (const line of fm.split(/\r?\n/)) {
    if (line.startsWith('tags:')) {
      try { return JSON.parse(line.slice(5).trim()); } catch { return []; }
    }
  }
  return [];
}
const hash = (t) => '#' + t.toLowerCase().replace(/[^a-z0-9]+/g, '');

const items = [];
for (const f of readdirSync(BLOG).filter((x) => x.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  const img = `${slug}-ig.jpg`;
  if (!existsSync(resolve(IMG_DIR, img))) continue;
  const fm = frontmatter(readFileSync(resolve(BLOG, f), 'utf8'));
  const title = scalar(fm, 'title');
  if (!title) continue;
  const desc = scalar(fm, 'description');
  const tags = tagsOf(fm).filter((t) => !/^(canada|uk|australia)$/i.test(t));
  const hashtags = [...new Set([...BASE_TAGS, ...tags.slice(0, 6).map(hash)])]
    .filter((h) => h.length > 4 && h.length < 32).slice(0, 5).join(' ');
  const caption = [
    title.replace(/\s*\|.*$/, ''),
    '',
    desc,
    '',
    `Save this for later. Full guide: link in bio. More ideas for ${AUDIENCE}.`,
    '',
    hashtags,
  ].join('\n');
  items.push({ slug, title, link: `https://smallspacehome.ca/blog/${slug}?utm_source=facebook&utm_medium=social&utm_campaign=cad_fb`, fbText: desc, date: scalar(fm, 'datePublished'), image: `${IMG_REL}/${img}`, imageUrl: IMG_BASE + img, igCaption: caption });
}
items.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.slug.localeCompare(b.slug));
items.forEach((q, i) => { q.order = i + 1; });
writeFileSync(resolve(ROOT, 'social/queue.json'), JSON.stringify(items, null, 2) + '\n');
console.log(`queue: ${items.length} posts`);
