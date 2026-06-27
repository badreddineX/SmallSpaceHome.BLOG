import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().default('/images/placeholder.jpg'),
    datePublished: z.string(),
    dateModified: z.string(),
    author: z.string().default('Badreddine Briar'),
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
