import sharp from 'sharp';
import { readdir, stat, writeFile, readFile } from 'fs/promises';
import { join, extname, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const MAX_WIDTH  = 1400;   // px — wide enough for full-bleed hero on retina
const MAX_HEIGHT = 1400;   // px
const QUALITY    = 82;     // JPEG quality (82 = excellent visual / small file)

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectImages(path));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      results.push(path);
    }
  }
  return results;
}

const files = await collectImages(DIR);

let totalBefore = 0;
let totalAfter  = 0;
let count       = 0;

for (const path of files) {
  const label = relative(DIR, path);
  try {
    const before = (await stat(path)).size;

    // Read fully into memory so sharp releases the file handle before we write back
    const inputBuf = await readFile(path);
    const img = sharp(inputBuf);
    const meta = await img.metadata();

    const needsResize = (meta.width ?? 0) > MAX_WIDTH || (meta.height ?? 0) > MAX_HEIGHT;

    let pipeline = img;
    if (needsResize) {
      pipeline = pipeline.resize({
        width:  MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: 'inside',          // keeps aspect ratio, never crops
        withoutEnlargement: true,
      });
    }

    const ext = extname(path).toLowerCase();
    if (ext === '.png') {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9, palette: true });
    } else {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true });
    }

    const buf = await pipeline.toBuffer();
    const after = buf.length;

    // Only overwrite if we actually saved space
    if (after < before) {
      await writeFile(path, buf);
      const saved = ((before - after) / before * 100).toFixed(0);
      console.log(`✓  ${label.padEnd(36)} ${(before/1024/1024).toFixed(1)} MB → ${(after/1024/1024).toFixed(1)} MB  (−${saved}%)`);
    } else {
      console.log(`–  ${label.padEnd(36)} already optimal`);
    }

    totalBefore += before;
    totalAfter  += Math.min(after, before);
    count++;
  } catch (err) {
    console.error(`✗  ${label.padEnd(36)} failed: ${err.message}`);
  }
}

const savedMB   = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(0);
const savedPct  = ((totalBefore - totalAfter) / totalBefore * 100).toFixed(0);
console.log(`\n${count} images processed — saved ${savedMB} MB total (${savedPct}% smaller)`);
