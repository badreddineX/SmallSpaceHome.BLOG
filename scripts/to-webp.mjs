import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

// Converts jpg/png files in the given directories to sibling .webp files.
// Originals are left in place untouched (safety net / nothing else references them by old ext after the code change).
const dirs = process.argv.slice(2);

for (const dir of dirs) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (e) {
    console.error(`skip ${dir}: ${e.message}`);
    continue;
  }
  let count = 0, totalBefore = 0, totalAfter = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (!/\.(jpe?g|png)$/i.test(ext)) continue;
    const path = join(dir, entry.name);
    const webpPath = path.replace(/\.(jpe?g|png)$/i, '.webp');
    const before = (await stat(path)).size;
    const buf = await sharp(path).webp({ quality: 80 }).toBuffer();
    const { writeFile } = await import('fs/promises');
    await writeFile(webpPath, buf);
    totalBefore += before;
    totalAfter += buf.length;
    count++;
    console.log(`${entry.name} -> ${entry.name.replace(/\.(jpe?g|png)$/i, '.webp')}  ${(before/1024).toFixed(0)}KB -> ${(buf.length/1024).toFixed(0)}KB`);
  }
  console.log(`\n${dir}: ${count} converted, ${(totalBefore/1024).toFixed(0)}KB -> ${(totalAfter/1024).toFixed(0)}KB\n`);
}
