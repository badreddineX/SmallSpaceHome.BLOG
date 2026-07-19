// Groups the 23 blog posts into 8 Instagram Highlights and renders one
// profile-cover icon per Highlight (1080x1080 circle, same ring design as
// generate-blog-highlights.mjs). The per-post Story graphics (image + blog
// link) already exist in profile-covers/instagram-stories/<slug>.jpg — this
// script just sorts them into a folder per Highlight so it's obvious which
// Stories belong to which Highlight.
//
// Usage: node pin-generator/generate-highlight-categories.mjs

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const IMAGES_DIR = 'public/images';
const STORIES_DIR = 'profile-covers/instagram-stories';
const OUT_ICONS = 'profile-covers/instagram-highlights';
const OUT_STORIES = 'profile-covers/instagram-stories';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">`;

const BASE_CSS = `
  :root{ --tan:#C4A882; --tan-deep:#8B6F47; --dark:#2C2420; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{overflow:hidden}
`;

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

const CATEGORIES = [
  {
    slug: 'storage',
    label: 'Storage',
    photo: 'blog-04-img1.jpg',
    posts: ['small-apartment-bathroom-storage', 'small-apartment-bedroom-storage-ideas', 'storage-ideas-for-small-places'],
  },
  {
    slug: 'organization',
    label: 'Organization',
    photo: 'blog-17-img1.jpg',
    posts: ['january-reset-organization-ideas', 'small-apartment-organization', 'small-space-kitchen-organization'],
  },
  {
    slug: 'budget-ikea',
    label: 'Budget & IKEA',
    photo: 'blog-12-img1.jpg',
    posts: ['apartment-decor-ideas-on-a-budget', 'small-apartment-organization-ideas-on-a-budget', 'ikea-small-space-hacks'],
  },
  {
    slug: 'living-room',
    label: 'Living Room',
    photo: 'blog-01-img1.jpg',
    posts: ['small-space-living-room-ideas', 'how-to-decorate-a-small-living-room', 'small-space-furniture'],
  },
  {
    slug: 'small-rooms',
    label: 'Small Rooms',
    photo: 'blog-06-img1.jpg',
    posts: ['small-bedroom-decor-ideas', 'small-apartment-home-office-ideas', 'how-to-make-a-small-room-look-bigger'],
  },
  {
    slug: 'studio-minimalist',
    label: 'Studio & Minimalist',
    photo: 'blog-05-img1.jpg',
    posts: ['studio-apartment-ideas', 'minimalist-small-apartment-ideas'],
  },
  {
    slug: 'decor-rules',
    label: 'Decor Rules',
    photo: 'blog-02-img1.jpg',
    posts: ['apartment-decor-ideas', 'renter-friendly-apartment-decor-ideas', 'small-space-decorating'],
  },
  {
    slug: 'seasonal',
    label: 'Seasonal',
    photo: 'blog-19-img1.jpg',
    posts: ['cozy-winter-apartment-decor', 'fall-apartment-decorating-ideas', 'spring-cleaning-organization-tips'],
  },
];

mkdirSync(OUT_ICONS, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.setViewportSize({ width: 1080, height: 1080 });

for (const { slug, photo, posts } of CATEGORIES) {
  const photoUrl = pathToFileURL(resolve(IMAGES_DIR, photo)).href;
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${highlightIcon(photoUrl)}</body></html>`;
  const file = resolve(`out-profile/category-icons/${slug}.html`);
  mkdirSync('out-profile/category-icons', { recursive: true });
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT_ICONS}/${slug}.jpg`, type: 'jpeg', quality: 90 });
  console.log(`✓ ${OUT_ICONS}/${slug}.jpg`);

  const destDir = resolve(OUT_STORIES, slug);
  mkdirSync(destDir, { recursive: true });
  for (const postSlug of posts) {
    const src = resolve(STORIES_DIR, `${postSlug}.jpg`);
    if (!existsSync(src)) {
      console.warn(`! Missing story for ${postSlug}, skipping`);
      continue;
    }
    copyFileSync(src, resolve(destDir, `${postSlug}.jpg`));
  }
  console.log(`✓ ${destDir}/ (${posts.length} stories)`);
}

await browser.close();
