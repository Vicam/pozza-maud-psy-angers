import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    category: z.string().optional(),
    thumbnail: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const settings = defineCollection({
  type: 'data',
  schema: z.object({
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    rdv_url: z.string().url().optional(),
    socials: z
      .object({
        facebook: z.string().url().or(z.literal('')).optional(),
        instagram: z.string().url().or(z.literal('')).optional(),
        linkedin: z.string().url().or(z.literal('')).optional(),
      })
      .optional(),
  }),
});

export const collections = { pages, blog, settings };
