import sharp from 'sharp';
import { readdirSync, unlinkSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
const dir = process.argv[2];
const files = readdirSync(dir).filter(f => f.endsWith('-S.png'));
let before = 0, after = 0;
for (const f of files) {
  const src = resolve(dir, f);
  before += statSync(src).size;
  const out = src.replace(/\.png$/, '.jpg');
  await sharp(src).resize(1000, 1500, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  after += statSync(out).size;
  unlinkSync(src);
}
console.log(`${files.length} pins: ${(before/1e6).toFixed(0)}MB PNG -> ${(after/1e6).toFixed(1)}MB JPG`);
