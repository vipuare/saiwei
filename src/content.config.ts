import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/products' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    category: z.enum(['football', 'basketball', 'uniforms', 'protective', 'mixed']).default('football'),
    featured: z.boolean().default(false),
    order: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { products };
