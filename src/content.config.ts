import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const workLink = z.string().refine((value) => {
  if (value.startsWith('#')) return true;
  if (value.startsWith('./')) {
    return value.slice(2).split('/').every((part) => part.length > 0 && part !== '.' && part !== '..');
  }

  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, 'Expected an HTTP(S) URL, an in-page anchor, or a relative asset path');

const works = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      venue: z.string(),
      authors: z.array(
        z.object({
          name: z.string(),
          url: z.string().url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol)).optional(),
          affiliation: z.string().optional(),
          equalContribution: z.boolean().optional(),
        })
      ),
      affiliations: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        )
        .optional(),
      teaser: image().optional(),
      teaserAlt: z.string().optional(),
      links: z
        .array(
          z.object({
            label: z.string(),
            url: workLink,
            icon: z.string().optional(),
          })
        )
        .default([]),
      bibtex: z.string().optional(),
      featured: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { works };
