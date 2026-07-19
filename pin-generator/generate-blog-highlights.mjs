// Generates an Instagram Highlight set for EVERY blog post automatically —
// no hardcoded list. Reads title/image straight from each post's frontmatter
// in src/content/blog/*.md, so adding a new post means running this again,
// nothing to edit here.
//
// Per post, produces two assets in the site's own theme (Playfair Display +
// Inter, cream/sage/tan/ink — same tokens as src/styles/global.css):
//   1. highlights/<slug>.png       — 1080x1080 circular profile icon for the
//                                     Highlight itself (cropped from the post's
//                                     cover photo, tan ring border).
//   2. stories/<slug>.png          — 1080x1920 Story-shaped graphic that lives
//                                     inside the Highlight: cover photo full
//                                     bleed, post title, and the direct blog
//                                     link so it reads correctly even if the
//                                     Highlight is screenshotted or shared.
//
// Usage:
//   node pin-generator/generate-blog-highlights.mjs            # all posts
//   node pin-generator/generate-blog-highlights.mjs some-slug   # one post

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const SITE = 'smallspacehome.ca';
const BLOG_DIR = 'src/content/blog';
const IMAGES_DIR = 'public/images';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">`;

// Same palette as src/styles/global.css (--color-*) so exports read as this
// site's brand, not a one-off design.
const BASE_CSS = `
  :root{ --ink:#1C1917; --cream:#FAFAF7; --sage:#8FAF8A; --sage-deep:#6B8F66;
         --tan:#C4A882; --tan-deep:#8B6F47; --dark:#2C2420; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{overflow:hidden}
`;

function frontmatterField(src, key) {
  const m = src.match(new RegExp(`^${key}:\\s*"(.*)"\\s*$`, 'm'));
  return m ? m[1] : null;
}

function loadPosts(onlySlug) {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map((f) => {
    const slug = f.replace(/\.md$/, '');
    const src = readFileSync(resolve(BLOG_DIR, f), 'utf8');
    const title = frontmatterField(src, 'title');
    const image = frontmatterField(src, 'image'); // e.g. "/images/blog-01-img1.jpg"
    return { slug, title, image };
  });
  return onlySlug ? posts.filter((p) => p.slug === onlySlug) : posts;
}

// ── Highlight icon — 1080x1080, Instagram crops this to a circle.
const highlightIcon = (photoUrl) => `
  <style>${BASE_CSS}
    body{width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;
      background:var(--dark);}
    .ring{width:960px;height:960px;border-radius:50%;padding:14px;
      background:linear-gradient(135deg, var(--tan), var(--tan-deep));
      display:flex;align-items:center;justify-content:center;}
    .photo{width:100%;height:100%;border-radius:50%;
      background:url('${photoUrl}') center/cover no-repeat;
      box-shadow:inset 0 -140px 160px -80px rgba(20,26,18,.55);}
  </style>
  <div class="ring"><div class="photo"></div></div>
`;

// ── Highlight story content — 1080x1920, full-bleed cover photo with the
// post title and the actual blog link baked into the image.
const highlightStory = (title, slug, photoUrl) => `
  <style>${BASE_CSS}
    body{width:1080px;height:1920px;position:relative;background:var(--dark);
      font-family:'Inter',sans-serif;}
    .photo{position:absolute;inset:0;background:url('${photoUrl}') center/cover no-repeat;}
    .scrim-top{position:absolute;top:0;left:0;right:0;height:420px;
      background:linear-gradient(180deg, rgba(28,25,23,.65), rgba(28,25,23,0));}
    .scrim-bottom{position:absolute;bottom:0;left:0;right:0;height:900px;
      background:linear-gradient(0deg, rgba(28,25,23,.94) 20%, rgba(28,25,23,.55) 60%, rgba(28,25,23,0));}
    .kicker{position:absolute;top:72px;left:72px;right:72px;
      display:flex;align-items:center;gap:16px;
      font-weight:700;font-size:26px;letter-spacing:.28em;text-transform:uppercase;
      color:var(--cream);}
    .kicker .dot{width:10px;height:10px;border-radius:50%;background:var(--tan);}
    .content{position:absolute;left:72px;right:72px;bottom:150px;
      display:flex;flex-direction:column;gap:36px;}
    h1{font-family:'Playfair Display',serif;font-weight:600;font-size:76px;line-height:1.18;
      color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.35);}
    .cta{align-self:flex-start;display:flex;align-items:center;gap:14px;
      background:linear-gradient(135deg, var(--tan), var(--tan-deep));
      color:var(--ink);font-weight:700;font-size:30px;
      padding:24px 40px;border-radius:100px;box-shadow:0 12px 30px rgba(0,0,0,.35);}
    .cta .arrow{font-size:32px;line-height:1}
    .link{font-weight:600;font-size:28px;letter-spacing:.02em;color:var(--tan);
      opacity:.95}
  </style>
  <div class="photo"></div>
  <div class="scrim-top"></div>
  <div class="scrim-bottom"></div>
  <div class="kicker"><span class="dot"></span>Small Space Home</div>
  <div class="content">
    <h1>${title}</h1>
    <div class="link">${SITE}/blog/${slug}</div>
    <div class="cta">Read the full guide <span class="arrow">&#8594;</span></div>
  </div>
`;

const targetSlug = process.argv[2];
const posts = loadPosts(targetSlug);

if (posts.length === 0) {
  console.error(`No blog post found for slug "${targetSlug}".`);
  process.exit(1);
}

mkdirSync('out-profile/highlights', { recursive: true });
mkdirSync('out-profile/stories', { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ deviceScaleFactor: 1 });

for (const { slug, title, image } of posts) {
  if (!title || !image) {
    console.warn(`! Skipping ${slug} — missing title or image in frontmatter.`);
    continue;
  }
  const photoUrl = pathToFileURL(resolve(IMAGES_DIR, image.replace(/^\/images\//, ''))).href;

  await page.setViewportSize({ width: 1080, height: 1080 });
  let html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${highlightIcon(photoUrl)}</body></html>`;
  let file = resolve(`out-profile/highlights/${slug}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `out-profile/highlights/${slug}.jpg`, type: 'jpeg', quality: 90 });
  console.log(`✓ out-profile/highlights/${slug}.jpg`);

  await page.setViewportSize({ width: 1080, height: 1920 });
  html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${highlightStory(title, slug, photoUrl)}</body></html>`;
  file = resolve(`out-profile/stories/${slug}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `out-profile/stories/${slug}.jpg`, type: 'jpeg', quality: 90 });
  console.log(`✓ out-profile/stories/${slug}.jpg`);
}

await browser.close();
