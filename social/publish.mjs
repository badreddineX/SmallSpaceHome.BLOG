// Instagram auto-poster.
//
// Runs from GitHub Actions on a cron (see .github/workflows/social.yml). Each
// run: take the next unposted item(s) from social/queue.json and publish to
// Instagram via the Meta Graph API. Records what went out in social/state.json
// so nothing is posted twice. No server, no scheduler subscription — GitHub
// runs it, your machine can be off.
//
// Env:
//   META_TOKEN     (required) long-lived / system-user access token
//   IG_USER_ID     (required) Instagram *Business* account id (numeric)
//   POSTS_PER_RUN  (default 1) how many queue items to publish per run
//   RAW_BASE       (default below) public base URL for the image files
//   DRY_RUN=1      compute + log, call nothing
//
// Local dry run:  DRY_RUN=1 node social/publish.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRAPH = 'https://graph.facebook.com/v21.0';
const here = dirname(fileURLToPath(import.meta.url));
const QUEUE = resolve(here, 'queue.json');
const STATE = resolve(here, 'state.json');

const TOKEN = process.env.META_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const PER_RUN = Math.max(1, parseInt(process.env.POSTS_PER_RUN || '1', 10));
const RAW_BASE = (
  process.env.RAW_BASE ||
  'https://raw.githubusercontent.com/badreddineX/SmallSpaceHome.BLOG/main/'
).replace(/\/?$/, '/');
const DRY = process.env.DRY_RUN === '1';

if (!DRY && (!TOKEN || !IG_USER_ID)) {
  console.error('Missing META_TOKEN or IG_USER_ID. Set them as GitHub repo secrets.');
  process.exit(1);
}

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'));
let state;
try {
  state = JSON.parse(readFileSync(STATE, 'utf8'));
} catch {
  state = { instagram: [] };
}
state.instagram ||= [];

async function graph(path, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(`${GRAPH}/${path}`, { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`Graph ${path}: HTTP ${res.status} ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

async function postInstagram(item, imageUrl) {
  const container = await graph(`${IG_USER_ID}/media`, {
    image_url: imageUrl,
    caption: item.igCaption,
  });
  await new Promise((r) => setTimeout(r, 4000)); // image containers ready ~instantly
  const published = await graph(`${IG_USER_ID}/media_publish`, { creation_id: container.id });
  return published.id;
}

const done = new Set(state.instagram);
const pending = queue.filter((q) => !done.has(q.slug));

let published = 0;
let changed = false;
const errors = [];

for (const item of pending.slice(0, PER_RUN)) {
  const imageUrl = RAW_BASE + encodeURI(item.image);
  if (DRY) {
    console.log(`[dry] ${item.slug}\n     img: ${imageUrl}\n     cap: ${item.igCaption.split('\n')[0]}…`);
    continue;
  }
  try {
    const id = await postInstagram(item, imageUrl);
    state.instagram.push(item.slug);
    changed = true;
    published++;
    console.log(`published ${item.slug} -> ${id}`);
  } catch (e) {
    errors.push(`${item.slug}: ${e.message}`);
    console.error(`FAILED ${item.slug}: ${e.message}`);
    break; // stop on first failure so the same item retries next run
  }
}

if (changed) writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');

console.log(`\ndone: ${published} published | ${pending.length - published} left in queue`);
if (errors.length) process.exit(1);
