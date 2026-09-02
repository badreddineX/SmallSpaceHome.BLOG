// internal-links.mjs — curated automatic internal linking for the blog.
//
//   node scripts/internal-links.mjs            # dry run: validate + report + preview edits
//   node scripts/internal-links.mjs --apply    # write the links into src/content/blog/*.md
//
// Reads src/lib/internal-links.json ({ "phrase": "target-slug" }) and, for each
// post body, turns the FIRST unlinked plain-text occurrence of a mapped phrase
// into [phrase](/blog/<slug>). Deliberately conservative:
//
//   - curated map only — never guesses a target
//   - MAX_PER_POST auto-links per post; each phrase and each target used once
//   - never links a post to itself
//   - skips headings, fenced/inline code, blockquotes, tables, image lines, and
//     any text already inside a markdown link
//   - longest phrase wins ("small home office" beats "home office")
//   - idempotent: re-running makes no further changes
//
// The report also lists pages that receive NO in-body inbound link (the footer
// Related-posts block is not counted) — that list is the main payoff even if you never --apply.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const BLOG_DIR = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const MAP_URL = new URL('../src/lib/internal-links.json', import.meta.url);
const MAX_PER_POST = 2;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const rawMap = JSON.parse(readFileSync(MAP_URL, 'utf8'));
const entries = Object.entries(rawMap)
  .filter(([p, s]) => p && s && !p.startsWith('_'))
  .map(([phrase, slug]) => ({ phrase, slug, re: new RegExp(`\\b${escapeRe(phrase)}\\b`, 'i') }))
  .sort((a, b) => b.phrase.length - a.phrase.length);

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const slugs = new Set(files.map((f) => f.replace(/\.md$/, '')));

// ---- validate every target exists ----
const missing = [...new Set(entries.map((e) => e.slug))].filter((s) => !slugs.has(s));
if (missing.length) {
  console.error('MISSING TARGET POSTS — map points at slugs with no .md file:');
  for (const m of missing) console.error('  - ' + m);
  process.exit(1);
}

// ---- is index i inside an existing markdown link on this line? ----
function insideLink(line, i) {
  // already the anchor text of [ ... ](...) ?
  const linkRe = /\[[^\]]*\]\([^)]*\)/g;
  let m;
  while ((m = linkRe.exec(line))) {
    if (i >= m.index && i < m.index + m[0].length) return true;
  }
  return false;
}

const skipLine = (l) =>
  /^\s{0,3}#{1,6}\s/.test(l) ||        // heading
  /^\s{0,3}>/.test(l) ||               // blockquote
  /^\s{0,3}!\[/.test(l) ||             // image
  /^\s*\|/.test(l) ||                  // table row
  /^\s{0,3}(```|~~~)/.test(l);         // fence marker

let totalLinks = 0;
const perPost = [];
const inbound = new Map([...slugs].map((s) => [s, 0]));

for (const file of files) {
  const selfSlug = file.replace(/\.md$/, '');
  const src = readFileSync(BLOG_DIR + file, 'utf8');
  const fmEnd = src.indexOf('\n---', 4);
  const head = src.slice(0, fmEnd + 4);
  let body = src.slice(fmEnd + 4);

  // count existing manual inbound links (from every file) once
  for (const m of src.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
    if (slugs.has(m[1]) && m[1] !== selfSlug) inbound.set(m[1], inbound.get(m[1]) + 1);
  }

  const lines = body.split('\n');
  let inFence = false;
  let budget = MAX_PER_POST;
  const usedSlug = new Set([selfSlug]);
  const usedPhrase = new Set();
  const made = [];

  for (let li = 0; li < lines.length && budget > 0; li++) {
    let line = lines[li];
    if (/^\s{0,3}(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence || skipLine(line)) continue;

    for (const e of entries) {
      if (budget <= 0) break;
      if (usedSlug.has(e.slug) || usedPhrase.has(e.phrase)) continue;
      const m = e.re.exec(line);
      if (!m) continue;
      const i = m.index;
      const j = i + m[0].length;
      if (line[i - 1] === '[' || insideLink(line, i)) continue;   // already linked
      line = line.slice(0, i) + `[${line.slice(i, j)}](/blog/${e.slug})` + line.slice(j);
      lines[li] = line;
      usedSlug.add(e.slug);
      usedPhrase.add(e.phrase);
      inbound.set(e.slug, inbound.get(e.slug) + 1);
      made.push(`${m[0]} → ${e.slug}`);
      budget -= 1;
      totalLinks += 1;
      break; // one phrase per line
    }
  }

  perPost.push({ slug: selfSlug, made });
  if (made.length && APPLY) writeFileSync(BLOG_DIR + file, head + lines.join('\n'));
}

// ---- report ----
const orphans = [...inbound.entries()].filter(([, n]) => n === 0).map(([s]) => s).sort();
console.log(`\n  ${APPLY ? 'APPLIED' : 'DRY RUN'} — ${entries.length} phrases → ${new Set(entries.map((e) => e.slug)).size} targets, ${files.length} posts`);
console.log(`  ${APPLY ? 'wrote' : 'would write'} ${totalLinks} internal links\n`);
for (const p of perPost.filter((p) => p.made.length)) {
  console.log(`  ${p.slug}`);
  for (const m of p.made) console.log(`      + ${m}`);
}
console.log(`\n  NO INBOUND — pages that receive no in-body link from any post after this pass (footer Related-posts block not counted): ${orphans.length}`);
for (const s of orphans) console.log('    - ' + s);
console.log('');
if (!APPLY && totalLinks) console.log('  Re-run with --apply to write these. Review the git diff before committing.\n');
