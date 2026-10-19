import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
          url: z.string().url().optional(),
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
            url: z.string(),
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
