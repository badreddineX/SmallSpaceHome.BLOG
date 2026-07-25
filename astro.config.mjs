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
  },
});