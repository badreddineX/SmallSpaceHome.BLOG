import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Markdown's ![]() syntax carries no width/height, so body images ship
// without intrinsic dimensions -- the browser can't reserve layout space
// before the image loads (a real CLS/Core Web Vitals cost). Astro 7's
// satteri markdown engine doesn't yet expose a plugin hook to fix this at
// build time (only the legacy remark/rehype path does, which needs
// @astrojs/markdown-remark -- not worth reintroducing the old engine just
// for this). Instead, this runs as a `postbuild` step (via npm's automatic
// postbuild lifecycle hook) and patches the already-built HTML directly --
// it can't destabilize the markdown pipeline since it runs after astro
// build has already finished.
const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const distDir = join(root, 'dist');
const publicDir = join(root, 'public');

const dimensionCache = new Map();

async function getDimensions(publicSrc) {
  if (dimensionCache.has(publicSrc)) return dimensionCache.get(publicSrc);
  let dims = null;
  try {
    const fsPath = join(publicDir, publicSrc);
    const meta = await sharp(fsPath).metadata();
    if (meta.width && meta.height) dims = { width: meta.width, height: meta.height };
  } catch {
    // Missing/unreadable file -- leave undimensioned rather than fail the build.
  }
  dimensionCache.set(publicSrc, dims);
  return dims;
}

function findHtmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findHtmlFiles(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

// Matches <img ... src="/images/...jpg" ...> tags missing a width attribute.
// Only touches local /images/ sources -- remote/CDN images already carry
// their own sizing behavior and aren't this script's concern.
const imgTagRe = /<img\b([^>]*?)\ssrc="(\/images\/[^"]+)"([^>]*)>/g;

async function patchFile(path) {
  let html = readFileSync(path, 'utf8');
  let changed = false;
  const matches = [...html.matchAll(imgTagRe)];
  for (const match of matches) {
    const [full, before, src, after] = match;
    if (/\swidth=/.test(before) || /\swidth=/.test(after)) continue; // already has one
    const dims = await getDimensions(src);
    if (!dims) continue;
    const patched = `<img${before} src="${src}"${after} width="${dims.width}" height="${dims.height}">`;
    html = html.replace(full, patched);
    changed = true;
  }
  if (changed) writeFileSync(path, html, 'utf8');
  return changed;
}

const files = findHtmlFiles(distDir);
let patchedCount = 0;
for (const file of files) {
  if (await patchFile(file)) patchedCount++;
}
console.log(`inject-image-dimensions: patched ${patchedCount}/${files.length} HTML files`);
