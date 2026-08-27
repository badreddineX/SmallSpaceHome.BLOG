import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().default('/images/placeholder.svg'),
    datePublished: z.string(),
    dateModified: z.string(),
    author: z.string().default('Badreddine Br'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    category: z.enum(['Organization', 'Decor', 'Storage', 'Budget Tips']),
    readTime: z.number(),
    relatedPosts: z.array(z.string()).optional(),
    faqs: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        })
      )
      .optional(),
  }),
});

// Weekly-idea queue for the newsletter. One .md file per idea: frontmatter
// below, body = the ~150-word tip (plain text / light markdown). They go out
// in `order` sequence, one per weekly email, and are never re-sent.
const ideas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ideas' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    price: z.string().optional(),          // e.g. "$14 CAD" — shown as a badge
    image: z.string().optional(),          // /images/... (thumb variant used automatically)
    relatedPost: z.string().optional(),    // blog slug for the "Full guide →" link
  }),
});

export const collections = { blog, ideas };
