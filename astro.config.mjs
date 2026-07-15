import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://smallspacehome.ca',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],
  redirects: {
    '/blog/storage-solutions-for-small-apartments': '/blog/storage-ideas-for-small-places',
  },
});