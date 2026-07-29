import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Read each post's dateModified straight from frontmatter (no astro:content
// access is available here in the config file) so the sitemap can carry a
// real lastmod per URL -- it had none before, which gives Google nothing to
// prioritize a recrawl against after a content/code change.
const blogDir = fileURLToPath(new URL('./src/content/blog/', import.meta.url));
const postDates = {};
let mostRecentDate = '2026-01-01';
for (const file of readdirSync(blogDir)) {
  if (!file.endsWith('.md')) continue;
  const content = readFileSync(blogDir + file, 'utf-8');
  const match = content.match(/^dateModified:\s*"([^"]+)"/m);
  if (match) {
    const slug = file.replace(/\.md$/, '');
    postDates[slug] = match[1];
    if (match[1] > mostRecentDate) mostRecentDate = match[1];
  }
}

export default defineConfig({
  site: 'https://smallspacehome.ca',
  trailingSlash: 'never',
  // Inline all page stylesheets instead of shipping them as separate
  // render-blocking <link> requests (PSI flagged ~650ms wasted across two
  // small CSS files) -- total CSS is only a few KB, cheap to inline.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you') && !page.includes('/404'),
      serialize(item) {
        const slug = item.url.replace('https://smallspacehome.ca/blog/', '');
        if (postDates[slug]) {
          item.lastmod = postDates[slug];
        } else if (/\/blog(\/category\/[a-z-]+)?\/?$/.test(item.url) || item.url.replace(/\/$/, '') === 'https://smallspacehome.ca') {
          // homepage, /blog index, and category pages all surface/aggregate
          // recent posts, so their real freshness tracks the newest post
          item.lastmod = mostRecentDate;
        }
        return item;
      },
    }),
  ],
  redirects: {
    '/blog/storage-solutions-for-small-apartments': '/blog/storage-ideas-for-small-places',
    // Cannibalization consolidation, 2026-07-29: merged near-duplicate/low-value
    // posts into their stronger sibling rather than leaving them competing for
    // the same query. Seasonal (fall/winter) and room-specific long-tail posts
    // were deliberately left separate -- distinct search intent, not duplicates.
    '/blog/january-reset-organization-ideas': '/blog/small-apartment-organization',
    '/blog/spring-cleaning-organization-tips': '/blog/small-apartment-organization',
    '/blog/small-apartment-organization-ideas-on-a-budget': '/blog/small-apartment-organization',
    '/blog/small-space-kitchen-organization': '/blog/small-apartment-organization',
    '/blog/apartment-decor-ideas-on-a-budget': '/blog/small-space-decorating',
    '/blog/apartment-decor-ideas': '/blog/small-space-decorating',
    '/blog/small-living-room-storage-solutions': '/blog/small-space-living-room-ideas',
    '/blog/small-closet-organization-rental-apartment': '/blog/storage-ideas-for-small-places',
    '/blog/small-entryway-hallway-storage-ideas': '/blog/storage-ideas-for-small-places',
    '/blog/under-bed-storage-ideas-small-apartment': '/blog/small-apartment-bedroom-storage-ideas',
  },
});