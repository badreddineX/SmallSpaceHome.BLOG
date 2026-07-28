import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Dedicated small variant for the homepage "feat-side" cards, which PSI
// measured at only ~173x130 CSS px on mobile -- the shared thumb() variant
// (960x720, sized for the 480x640 blog-listing cards) was ~30x more pixels
// than this slot needs. 600x450 covers 2x retina up to a ~300px desktop
// column without the mobile waste.
const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const OUT_DIR = join(SRC_DIR, 'feat-side');
const WIDTH = 600, HEIGHT = 450, QUALITY = 88;

const files = process.argv.slice(2);
await mkdir(OUT_DIR, { recursive: true });

for (const name of files) {
  const src = join(SRC_DIR, name);
  const base = name.replace(/\.(jpe?g|png)$/i, '');
  const jpgOut = join(OUT_DIR, `${base}.jpg`);
  const webpOut = join(OUT_DIR, `${base}.webp`);

  const jpgBuf = await sharp(src)
    .resize({ width: WIDTH, height: HEIGHT, fit: 'cover' })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toBuffer();
  await writeFile(jpgOut, jpgBuf);

  const webpBuf = await sharp(src)
    .resize({ width: WIDTH, height: HEIGHT, fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();
  await writeFile(webpOut, webpBuf);

  console.log(`${name} -> feat-side/${base}.jpg + .webp  (${(jpgBuf.length/1024).toFixed(0)}KB, ${(webpBuf.length/1024).toFixed(0)}KB)`);
}
console.log('done');
