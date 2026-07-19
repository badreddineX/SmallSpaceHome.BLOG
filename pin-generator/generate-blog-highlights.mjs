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

// ── Highlight story content — 1080x1920. Deliberately NOT the pin look
// (no editorial gradient-scrim-over-photo stack). Instead this mimics real
// Instagram Story chrome — progress segments, avatar/username row, and a
// white link-sticker widget — so it reads as native Story content rather
// than a repurposed Pinterest pin, while still using the site's palette.
const highlightStory = (title, slug, photoUrl) => `
  <style>${BASE_CSS}
    body{width:1080px;height:1920px;position:relative;background:var(--ink);
      font-family:'Inter',sans-serif;}
    .frame{position:absolute;inset:24px;border-radius:40px;overflow:hidden;
      background:var(--dark);}
    .photo{position:absolute;top:210px;left:0;right:0;height:1180px;
      background:url('${photoUrl}') center/cover no-repeat;}
    .photo::after{content:'';position:absolute;inset:0;
      background:linear-gradient(0deg, var(--dark) 0%, rgba(44,36,32,0) 22%);}
    .progress{position:absolute;top:32px;left:32px;right:32px;height:5px;
      display:flex;gap:8px;}
    .progress span{flex:1;height:100%;border-radius:4px;background:rgba(255,255,255,.28);}
    .progress span.active{background:var(--cream);}
    .idrow{position:absolute;top:56px;left:32px;right:32px;
      display:flex;align-items:center;gap:18px;}
    .avatar{width:64px;height:64px;border-radius:50%;
      background:linear-gradient(135deg, var(--tan), var(--sage));
      display:flex;align-items:center;justify-content:center;
      font-family:'Playfair Display',serif;font-weight:700;font-size:32px;color:#fff;}
    .idrow .name{font-weight:700;font-size:30px;color:#fff;}
    .idrow .time{font-weight:500;font-size:26px;color:rgba(255,255,255,.65);margin-left:-4px;}
    .caption{position:absolute;left:56px;right:56px;top:1120px;}
    .caption h1{font-family:'Playfair Display',serif;font-weight:600;font-size:64px;
      line-height:1.22;color:var(--cream);}
    .sticker{position:absolute;left:56px;right:56px;top:1440px;
      background:var(--cream);border-radius:24px;padding:30px 36px;
      display:flex;align-items:center;gap:20px;box-shadow:0 18px 40px rgba(0,0,0,.35);}
    .sticker .icon{width:44px;height:44px;border-radius:50%;border:4px solid var(--ink);
      display:flex;align-items:center;justify-content:center;font-size:26px;color:var(--ink);
      flex:none;}
    .sticker .text{display:flex;flex-direction:column;gap:4px;}
    .sticker .label{font-weight:700;font-size:22px;letter-spacing:.12em;text-transform:uppercase;
      color:var(--tan-deep);}
    .sticker .url{font-weight:600;font-size:28px;color:var(--ink);}
    .swipe{position:absolute;left:0;right:0;top:1650px;display:flex;flex-direction:column;
      align-items:center;gap:10px;}
    .swipe .chevron{font-size:34px;color:rgba(255,255,255,.85);}
    .swipe .label{font-weight:600;font-size:24px;letter-spacing:.14em;text-transform:uppercase;
      color:rgba(255,255,255,.75);}
  </style>
  <div class="frame">
    <div class="photo"></div>
    <div class="progress"><span class="active"></span><span></span><span></span></div>
    <div class="idrow">
      <div class="avatar">S</div>
      <div class="name">smallspacehome</div>
      <div class="time">· 1h</div>
    </div>
    <div class="caption"><h1>${title}</h1></div>
    <div class="sticker">
      <div class="icon">&#128279;</div>
      <div class="text">
        <div class="label">Tap the link</div>
        <div class="url">${SITE}/blog/${slug}</div>
      </div>
    </div>
    <div class="swipe">
      <div class="chevron">&#8963;</div>
      <div class="label">See more</div>
    </div>
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
