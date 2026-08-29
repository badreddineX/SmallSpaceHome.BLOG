// Turns social/queue.json into social/queue-sheet.csv — the file you import
// into the Google Sheet that Make.com reads from.
//
// Columns: order | slug | image_url | caption | posted
//   image_url = full public URL (raw.githubusercontent) — Make posts this directly
//   posted    = left blank; Make writes a date here after it posts the row
//
//   node social/build-sheet.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const RAW_BASE = 'https://raw.githubusercontent.com/badreddineX/SmallSpaceHome.BLOG/main/';

const queue = JSON.parse(readFileSync(resolve(here, 'queue.json'), 'utf8'));

const csvField = (s) => `"${String(s).replace(/"/g, '""')}"`;
const rows = [
  ['order', 'slug', 'image_url', 'caption', 'posted'].join(','),
  ...queue.map((q, i) =>
    [
      i + 1,
      csvField(q.slug),
      csvField(RAW_BASE + encodeURI(q.image)),
      csvField(q.igCaption),
      '',
    ].join(',')
  ),
];

writeFileSync(resolve(here, 'queue-sheet.csv'), rows.join('\n') + '\n');
console.log(`social/queue-sheet.csv — ${queue.length} rows`);
