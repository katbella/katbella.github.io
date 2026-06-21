import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { topicSlugValues } from './lib/taxonomy';

const stableSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const notes = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/notes',
    generateId: ({ data }) => {
      if (typeof data.slug !== 'string') {
        throw new Error('Every note needs a canonical slug.');
      }
      return data.slug;
    },
  }),
  schema: z.object({
    slug: z
      .string()
      .regex(stableSlug, 'Use a lowercase kebab-case canonical slug.'),
    title: z.string().min(1),
    publishedAt: z.coerce.date(),
    topics: z.array(z.enum(topicSlugValues)).optional().default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
