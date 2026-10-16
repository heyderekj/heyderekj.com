# heyderekj.com

Personal site for Derek Castelli. Built with [Astro](https://astro.build), hosted on Cloudflare.

## Stack

- Astro 4 with content collections (posts, work, projects)
- Plain system-sans typography, light/dark via `prefers-color-scheme`
- RSS, sitemap, Fathom Analytics

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output to dist/
npm run preview   # preview the production build
```

## Write

- **Posts:** add markdown files under `src/content/posts/` using `YYYY-MM-DD-slug.md`.
- **Work:** add markdown files under `src/content/work/` using `slug.md`.
- **Projects:** add markdown files under `src/content/projects/` using `slug.md`.
- **Drafts:** `posts`, `work`, and `projects` support `draft: true` and stay hidden until set to `false`.
- **Scaffold commands:** use `npm run new:post`, `npm run new:work`, `npm run new:project`, or `npm run new:content`.
- **About/Tools:** edit `src/data/about.ts`, `src/data/now.ts`, and `src/pages/tools/index.astro`.

## Import posts from CSV

The one-time CSV → Markdown importer lives at `scripts/import-posts.mjs`.

Move your CSV out of `~/Downloads` (macOS sandbox) to somewhere readable, e.g. `./data/posts.csv`, then:

```sh
npm run import:posts           # reads ./data/posts.csv
node scripts/import-posts.mjs path/to/posts.csv
```

Everything is imported with `draft: true`. Review, expand, and flip to publish.

## Fathom Analytics

Site ID is set in `src/components/Head.astro` (`data-site` on the Fathom script).

## Deploy

Cloudflare is connected to the git repo (build: `npm run build`, output: `dist`, `NODE_VERSION=20`). Redirects live in [public/_redirects](public/_redirects) and headers in [public/_headers](public/_headers). Domain and DNS live in the Cloudflare dashboard. Set `IMAGE_CDN=cloudflare` in the build environment to serve resized images through Cloudflare Image Transformations (custom domain only). Without it, the build makes its own smaller WebP copies (480, 960 and 1600px) of the screenshots and photos in `public/_v/` (`scripts/image-variants.mjs`, run before `dev` and `build`; not committed), and pages use the nearest one.

Optional manual deploy: `npx wrangler pages deploy dist` when logged in locally.

### Notes from visitors

Triple-clicking the signature watermark opens a "Leave me a note" card (`src/client/sig-egg.ts`). Notes post to a Pages Function, [functions/api/note.ts](functions/api/note.ts), which emails them to derekj@hey.com. Nothing is stored. One-time setup in the Cloudflare dashboard:

1. **Email Routing** for heyderekj.com: turn it on, and add and verify **derekj@hey.com** as a destination address.
2. In the Pages project, go to **Settings → Bindings → Add → Send email**. Name it `NOTES_MAIL` and set the destination address to `derekj@hey.com`.
3. Redeploy.

Until the binding exists, the function answers 503 and the card tells the visitor to email instead. Notes come from `notes@heyderekj.com`.

### Work requests (/hire/)

The [/hire/](src/pages/hire.astro) form builds an estimate as people answer. Prices, payment terms and the availability line all live in [src/data/hire.ts](src/data/hire.ts), and [src/lib/estimate.ts](src/lib/estimate.ts) does the math. Requests post to [functions/api/hire.ts](functions/api/hire.ts), which recalculates the estimate, saves the request to D1 and emails it to derekj@hey.com. The email's Reply-To is the person who sent it, so you can just hit reply. One-time setup:

1. Create the database: `npx wrangler d1 create hdj-hire`
2. Make the table: `npx wrangler d1 execute hdj-hire --remote --file=migrations/0001_hire.sql`
3. In the Pages project, go to **Settings → Bindings → Add → D1 database**. Name it `HIRE_DB` and pick `hdj-hire`. The email uses the `NOTES_MAIL` binding from above, so there's nothing more to set up for it.
4. Redeploy.

To read requests: `npx wrangler d1 execute hdj-hire --remote --command "SELECT created_at, name, email, org, total FROM requests ORDER BY created_at DESC LIMIT 20"`. With only one binding, it still saves or still emails. With neither, the form offers your email address instead.

#### Availability from Notion

The "Open for work" date can follow your projects in Notion instead of the line in `src/data/hire.ts`. [functions/api/availability.ts](functions/api/availability.ts) finds the latest end date among projects that aren't done, adds a week, and caches the result for an hour. To set it up:

1. Go to notion.so/my-integrations, create an internal integration (read content only), and copy its secret.
2. Open the projects database, then **… → Connections →** add the integration. Copy the database id from its URL (the 32 characters before `?v=`).
3. In the Pages project, go to **Settings → Variables and secrets** and add `NOTION_TOKEN` (as a secret) and `NOTION_PROJECTS_DB`. If your properties aren't named "Dates" (a date with start and end) and "Status", also set `NOTION_DATE_PROP` and `NOTION_STATUS_PROP`. `NOTION_DONE` lists the statuses that don't count, and `AVAILABILITY_BUFFER_DAYS` sets the gap (7 by default).
4. Redeploy. Until it's set up, the site shows the date from the data file.
