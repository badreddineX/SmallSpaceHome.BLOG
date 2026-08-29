// Builds social/queue.json — the ordered post queue the auto-poster consumes.
// Source of truth: social-posts/CAPTIONS-CAD.md (the human-written captions) +
// social-posts/ready-CAD/NN-<slug>.jpg (the rendered images, git-tracked so
// they have a public raw.githubusercontent URL).
//
// Run this whenever you edit the captions or add images, then commit queue.json.
//   node social/build-queue.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CAPTIONS = resolve(root, 'social-posts/CAPTIONS-CAD.md');
const IMG_DIR = resolve(root, 'social-posts/ready-CAD');
const IMG_REPO_PREFIX = 'social-posts/ready-CAD'; // path inside the repo, for the raw URL

// slug -> "NN-slug.jpg"
const imageBySlug = {};
for (const f of readdirSync(IMG_DIR)) {
  const m = f.match(/^(\d+)-(.+)\.jpe?g$/i);
  if (m) imageBySlug[m[2]] = f;
}

const md = readFileSync(CAPTIONS, 'utf8');
// Split on "## N. Title" headers
const sections = md.split(/^## \d+\.\s+/m).slice(1);

const queue = [];
for (const sec of sections) {
  const title = sec.split('\n')[0].trim();
  const imgRef = sec.match(/image:\s*`([^`]+?)(?:-ig)?\.png`/);
  if (!imgRef) continue;
  const slug = imgRef[1];
  const image = imageBySlug[slug];
  if (!image) continue; // no rendered image yet — skip until one exists

  const igBlock = sec.match(/\*\*Instagram:\*\*\s*```\s*([\s\S]*?)```/);
  if (!igBlock) continue;

  queue.push({
    slug,
    title,
    image: `${IMG_REPO_PREFIX}/${image}`,
    igCaption: igBlock[1].trim(),
    link: `https://smallspacehome.ca/blog/${slug}`,
  });
}

// Keep the numeric prefix order from the image filenames — stable, human-editable.
queue.sort((a, b) => a.image.localeCompare(b.image, undefined, { numeric: true }));

writeFileSync(resolve(root, 'social/queue.json'), JSON.stringify(queue, null, 2) + '\n');
console.log(`social/queue.json — ${queue.length} posts`);
