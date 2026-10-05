import sharp from 'sharp';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const blogDir = join(root, 'src/content/blog');
const publicDir = join(root, 'public');
const MOBILE_WIDTH = 800;

const files = readdirSync(blogDir).filter(f => f.endsWith('.md'));
let generated = 0;
let skipped = 0;

for (const f of files) {
  const content = readFileSync(join(blogDir, f), 'utf8');
  const match = content.match(/^image:\s*"(.+)"/m);
  if (!match) continue;

  const imgPath = match[1];
  const webpPath = imgPath.replace(/\.(jpe?g|png)$/i, '.webp');
  const mobilePath = webpPath.replace(/\.webp$/, '-mobile.webp');

  const srcFile = join(publicDir, webpPath);
  const outFile = join(publicDir, mobilePath);

  if (!existsSync(srcFile)) continue;
  if (existsSync(outFile)) { skipped++; continue; }

  try {
    const meta = await sharp(srcFile).metadata();
    if (meta.width && meta.width <= MOBILE_WIDTH) {
      // Already small enough — copy as-is so srcset reference resolves
      const { copyFileSync } = await import('node:fs');
      copyFileSync(srcFile, outFile);
      generated++;
      continue;
    }

    await sharp(srcFile)
      .resize(MOBILE_WIDTH)
      .webp({ quality: 80 })
      .toFile(outFile);
    generated++;
  } catch (e) {
    console.error(`  skip ${webpPath}: ${e.message}`);
  }
}

console.log(`gen-hero-mobile: ${generated} generated, ${skipped} skipped`);
