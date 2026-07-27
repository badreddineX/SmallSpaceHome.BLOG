import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const THUMB_DIR = join(SRC_DIR, 'thumb');
const WIDTH = 960, HEIGHT = 720, QUALITY = 88; // 2x retina-safe for the ~380-480px CSS display width

const files = process.argv.slice(2);

for (const name of files) {
  const src = join(SRC_DIR, name);
  const base = name.replace(/\.(jpe?g|png)$/i, '');
  const jpgOut = join(THUMB_DIR, `${base}.jpg`);
  const webpOut = join(THUMB_DIR, `${base}.webp`);

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

  console.log(`${name} -> thumb/${base}.jpg + .webp  (${(jpgBuf.length/1024).toFixed(0)}KB, ${(webpBuf.length/1024).toFixed(0)}KB)`);
}
console.log('done');
