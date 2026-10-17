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
2. Email goes through a tiny Worker, `heyderekj-mail` ([workers/mail](workers/mail)), which sends to `derekj@hey.com` from koatiapp.com (Email Routing is on there; heyderekj.com's mail is at Hover). Deploy it with `npx wrangler deploy --config workers/mail/wrangler.toml`, then in the Pages project add **Settings → Bindings → Service binding** `MAIL` → `heyderekj-mail`.
3. Redeploy.

Until the binding exists, the function answers 503 and the card tells the visitor to email instead. Notes come from `notes@heyderekj.com`.

### Work requests (/hire/)

The [/hire/](src/pages/hire.astro) form builds an estimate as people answer. Prices, payment terms and the availability line all live in [src/data/hire.ts](src/data/hire.ts), and [src/lib/estimate.ts](src/lib/estimate.ts) does the math. Requests post to [functions/api/hire.ts](functions/api/hire.ts), which recalculates the estimate, saves the request to D1 and emails it to derekj@hey.com. The email's Reply-To is the person who sent it, so you can just hit reply. One-time setup:

1. Create the database: `npx wrangler d1 create hdj-hire`
2. Make the table: `npx wrangler d1 execute hdj-hire --remote --file=migrations/0001_hire.sql`
3. In the Pages project, go to **Settings → Bindings → Add → D1 database**. Name it `HIRE_DB` and pick `hdj-hire`. The email uses the `MAIL` service binding from above.
4. Redeploy.

To read requests: `npx wrangler d1 execute hdj-hire --remote --command "SELECT created_at, name, email, org, total FROM requests ORDER BY created_at DESC LIMIT 20"`. With only one binding, it still saves or still emails. With neither, the form offers your email address instead.

#### The 404 chat, as me

Typed messages on the 404 page go to [functions/api/chat.ts](functions/api/chat.ts), which answers in my voice with Cloudflare Workers AI (Llama 3.3 70B): [src/data/voice.ts](src/data/voice.ts) (drawn from my posts; edit it to change how it talks) plus the site's own pages, so it links to real places. Commands (play, secrets, note, home) still answer instantly, and without the binding the chat searches the site like before.

Setup: in the Pages project, **Settings → Bindings → Workers AI**, named `AI` (Production and Preview), then redeploy.

#### One database for requests and the game's records

Requests from /hire/ ([functions/api/hire.ts](functions/api/hire.ts)) and each pet's record in the 404 game ([functions/api/four.ts](functions/api/four.ts)) share one D1 database. Until it's bound, requests can't be saved (they still email if `MAIL` is bound) and the game hides the records.

1. `npx wrangler d1 create heyderekj`
2. `npx wrangler d1 execute heyderekj --remote --file=migrations/0001_hire.sql`, then the same with `0002_four.sql`
3. In the Pages project, **Settings → Bindings → D1 database**: bind it as `DB` (Production and Preview), then redeploy.

#### Availability from Notion

The "Open for work" date follows the projects board in Notion (the "Projects" database on the Projects & Tasks page) instead of the line in `src/data/hire.ts`. [functions/api/availability.ts](functions/api/availability.ts) takes the projects that are booked (Staged, In Progress, Under Review: anything but done, Shaping or Proposal Sent), finds the latest end date in "Dates" (one that's run over counts as today), adds a week, and caches the result for an hour. To set it up:

1. Make a Notion token: an internal integration at notion.so/my-integrations with read content only (then, on the Projects & Tasks page, **… → Connections →** add it), or a personal access token.
2. Save it to the Pages project as a secret: `npx wrangler pages secret put NOTION_TOKEN --project-name heyderekj-com`.
3. Optional settings beside it: `NOTION_PROJECTS_DB` (another database, or a page holding one), `NOTION_DATE_PROP` / `NOTION_STATUS_PROP` (other column names), `NOTION_NOT_BOOKED` (statuses that don't count), `AVAILABILITY_BUFFER_DAYS` (7 by default).
4. Redeploy. Until there's a token, the site shows the date from the data file.
