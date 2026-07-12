import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    legacyUrl: z.string().url().optional(),
  }),
});

/** Case studies / client work — from Webflow/CSV; lives under `/work/`. */
const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    legacyUrl: z.string().url().optional(),
    /** From CSV: work type (e.g. design-dev, design, development) */
    workType: z.string().optional(),
    industry: z.array(z.string()).optional(),
    dateCompleted: z.coerce.date().optional(),
    weeksToComplete: z.union([z.number(), z.string()]).optional(),
    /** Featured on index / cards */
    highlight: z.boolean().default(false),
    liveLink: z.string().url().optional(),
    waybackUrl: z.string().url().optional(),
    /** CMS row archived */
    archived: z.boolean().default(false),
    partnership: z.string().optional(),
    partnershipWorkLink: z.string().url().optional(),
    soloOrAgency: z.string().optional(),
    estimatedTimeSpent: z.string().optional(),
    /** Narrative blocks (markdown) */
    brief: z.string().optional(),
    problem: z.string().optional(),
    solution: z.string().optional(),
    specificWork: z.string().optional(),
    /** Local public paths, e.g. /images/work/slug/... */
    thumbnail: z.string().optional(),
    desktop: z.string().optional(),
    mobile: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    /** One-sentence hook shown on the detail page before the body content; max ~140 chars. */
    summary: z.string().max(200).optional(),
    url: z.string().url().optional(),
    year: z.number().optional(),
    /** Prefer this for card footer; falls back to Jan 1 of `year` if omitted */
    started: z.coerce.date().optional(),
    /** Last meaningful update; shown when different from `started` month */
    updated: z.coerce.date().optional(),
    role: z.string().optional(),
    stack: z.array(z.string()).optional(),
    /** From Webflow / legacy exports (e.g. App, Blog) */
    category: z.string().optional(),
    /** From Webflow / legacy exports (e.g. Front Burner) */
    burnerLevel: z.string().optional(),
    image: z.string().optional(),
    /** Square app icon for card thumbnails; falls back to `image` */
    icon: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    status: z.enum(['active', 'maintained', 'paused', 'retired']).default('active'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, work, projects };
