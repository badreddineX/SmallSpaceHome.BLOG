import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://smallspacehome.ca',
  integrations: [sitemap()],
});