# SmallSpace Home

Editorial blog for Canadian apartment and small-space renters (Toronto, Vancouver, Montreal), covering storage, decor, organization, and budget-friendly tips for rental-friendly living. Live at [smallspacehome.ca](https://smallspacehome.ca).

## Tech stack

- [Astro](https://astro.build) v7 (content collections via `src/content.config.ts`)
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) for sitemap generation
- [`@vercel/analytics`](https://vercel.com/docs/analytics) (cookieless)
- Deployed on [Vercel](https://vercel.com), security headers set in `vercel.json`
- TypeScript, checked via `@astrojs/check`

## Project structure

```
src/
  content/blog/     # Blog post content (Markdown), categories: Organization, Decor, Storage, Budget Tips
  components/       # Reusable Astro components
  layouts/          # Page layouts (incl. BlogPost.astro)
  pages/            # Route pages
  styles/           # Global styles
public/             # Static assets served as-is
scripts/            # Build/maintenance scripts (e.g. image compression)
pin-generator/       # Pinterest pin / Instagram asset generation (Playwright + HTML templates)
digital-products/   # Content specs for the linked Fourthwall store products
```

## Development

```bash
npm install
npm run dev        # local dev server
npm run build       # production build
npm run preview     # preview the production build locally
npm run compress-images   # optimize images via sharp
```

## Content workflow

Blog posts are written as Markdown in `src/content/blog/`. Each post targets a specific Fourthwall store product per the site's article-to-product matching strategy — new posts should be paired with a relevant product, not published standalone.

## Deployment

Deploys automatically on push to `main` via Vercel. Security headers (CSP-adjacent: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are configured in `vercel.json`.
