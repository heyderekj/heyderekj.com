import { defineCollection, z } from 'astro:content';

/**
 * One typed stream of writing:
 * - `essay` — long-form, titled; shows its state under the date + revision history
 * - `note`  — short thought; title optional (falls back to its first words)
 * - `link`  — Daring Fireball-style: title links out to `link`, ★ is the permalink
 */
const posts = defineCollection({
  type: 'content',
  schema: z
    .object({
      type: z.enum(['essay', 'note', 'link']).default('essay'),
      title: z.string().optional(),
      date: z.coerce.date(),
      description: z.string().optional(),
      /** Kebab-case topic slugs; labels live in `src/data/topics.ts`. */
      tags: z.array(z.string().regex(/^[a-z0-9-]+$/, 'tags are kebab-case slugs')).default([]),
      /** Hidden / unpublished (not the same as `status: working`). */
      draft: z.boolean().default(false),
      legacyUrl: z.string().url().optional(),
      /** Link posts: the external URL the title points to. */
      link: z.string().url().optional(),
      /** Link posts: where you found it. */
      via: z.object({ name: z.string(), url: z.string().url() }).optional(),
      /** Published maturity: working draft → stable → outdated. */
      status: z.enum(['working', 'stable', 'outdated']).default('stable'),
      /** Slug of the post that replaces an `outdated` one. */
      supersededBy: z.string().optional(),
      /** Overrides the git-derived "updated" date. */
      updated: z.coerce.date().optional(),
      /**
       * Human revision notes. Entries without `commit` count as revisions
       * (e.g. edits from before the git import); with `commit` they only
       * annotate that commit.
       */
      changelog: z
        .array(
          z.object({
            date: z.coerce.date(),
            note: z.string(),
            commit: z.string().optional(),
          }),
        )
        .optional(),
      /** "Assumed audience" callout under the header. */
      audience: z.string().optional(),
      /** Table of contents; defaults to on for essays with 4+ sections. */
      toc: z.boolean().optional(),
    })
    .superRefine((d, ctx) => {
      if (d.type !== 'note' && !d.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['title'],
          message: `title is required for ${d.type} posts`,
        });
      }
      if (d.type === 'link' && !d.link) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['link'],
          message: 'link posts need a `link` URL',
        });
      }
    }),
});

/** Case studies / client work — from Webflow/CSV; lives under `/work/`. */
const work = defineCollection({
  type: 'content',
  schema: z
    .object({
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
      /** Required when both liveLink and waybackUrl are set — live is not (only) this case study */
      liveLinkNote: z.string().optional(),
      waybackUrl: z.string().url().optional(),
      /** Unaccepted / alternate direction prototype (e.g. Netlify proposal) */
      proposalLink: z.string().url().optional(),
      /** Pill label for proposalLink; defaults to "Proposed redesign" in the template */
      proposalLinkLabel: z.string().optional(),
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
      /** `contain` frames the thumbnail on a light background instead of cropping */
      thumbnailFit: z.enum(['cover', 'contain']).default('cover'),
      desktop: z.string().optional(),
      mobile: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      /** Prior design stills for lightweight version history */
      priorGallery: z.array(z.string()).optional(),
      /** Label for prior version, e.g. "Jan 2026" */
      priorVersionLabel: z.string().optional(),
      /** Time spent on the earlier version (shown in Earlier version section) */
      priorEstimatedTimeSpent: z.string().optional(),
      /** Archived narrative for the earlier version section */
      priorBrief: z.string().optional(),
      priorProblem: z.string().optional(),
      priorSolution: z.string().optional(),
      /** Optional tour clip leading the case study (same pattern as project pages) */
      video: z.string().optional(),
      videoPoster: z.string().optional(),
      videoCaption: z.string().optional(),
      /** CSS aspect-ratio value, e.g. `1538 / 928` */
      videoAspect: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.waybackUrl && data.liveLink && !data.liveLinkNote?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'liveLinkNote is required when both liveLink and waybackUrl are set (Wayback = this design; live needs a disclaimer)',
          path: ['liveLinkNote'],
        });
      }
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
    image: z.string().optional(),
    /** Detail-page hero; falls back to `image` (which cards keep using) */
    hero: z.string().optional(),
    /** CSS object-position for the detail hero (default `center center`) */
    heroPosition: z.string().optional(),
    /** Extra crop-in for heroes with too much empty mat (e.g. `1.35`) */
    heroZoom: z.number().min(1).max(2.5).optional(),
    /** `contain` frames the card image on a light background instead of cropping */
    imageFit: z.enum(['cover', 'contain']).default('cover'),
    /** Square app icon for card thumbnails; falls back to `image` */
    icon: z.string().optional(),
    /** Design-detail money shots rendered after the body; videos are muted loops */
    media: z
      .array(
        z.object({
          type: z.enum(['image', 'video']).default('image'),
          src: z.string(),
          /** Video poster frame */
          poster: z.string().optional(),
          /** Solo tour video: CSS aspect-ratio (e.g. `1240 / 770`) and window corner radius (0–1 of width). */
          aspect: z.string().optional(),
          radius: z.number().min(0).max(0.2).optional(),
          caption: z.string().optional(),
          alt: z.string().optional(),
        }),
      )
      .optional(),
    /**
     * Where it sits on /projects and the homepage:
     * 1 = main focus, 2 = also building, 3 = everything else (default).
     */
    tier: z.number().int().min(1).max(3).default(3),
    /** Order within a tier (lower first); ties fall back to newest `started`. */
    order: z.number().default(0),
    status: z.enum(['active', 'maintained', 'paused', 'retired']).default('active'),
    draft: z.boolean().default(false),
  }),
});

/**
 * Library — things saved and collected: books, podcasts, bookmarks, saved X
 * posts, interests, people, tools. One file per item; a body (longer notes)
 * gives the item its own page. Lives under `/library/`.
 */
const library = defineCollection({
  type: 'content',
  schema: z
    .object({
      kind: z.enum(['book', 'podcast', 'bookmark', 'post', 'interest', 'tool']),
      title: z.string(),
      url: z.string().url().optional(),
      /** Author / host / site / handle. */
      by: z.string().optional(),
      /** One-liner shown on the card. */
      note: z.string().optional(),
      /** Cover, artwork, or photo (public path). */
      image: z.string().optional(),
      /** When saved / read / started. */
      date: z.coerce.date().optional(),
      favorite: z.boolean().default(false),
      /** Sub-grouping: tool sections ("Design web"), interests ("Legos", "F1"). */
      group: z.string().optional(),
      order: z.number().default(0),
      tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
      draft: z.boolean().default(false),
      /** Books. */
      reading: z.enum(['reading', 'read', 'want']).optional(),
      /** Saved X posts — rendered as a static card (no embed). */
      post: z
        .object({
          text: z.string(),
          handle: z.string(),
          postedAt: z.coerce.date(),
        })
        .optional(),
    })
    .superRefine((d, ctx) => {
      if (d.kind === 'post' && !d.post) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['post'],
          message: 'saved posts need `post: { text, handle, postedAt }`',
        });
      }
    }),
});

export const collections = { posts, work, projects, library };
