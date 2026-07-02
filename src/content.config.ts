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

export const collections = { blog };
