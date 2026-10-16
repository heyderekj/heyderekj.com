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

### The 404 game's high scores

"Shall we play a game?" on the 404 page is Connect Four against me ([src/client/four.ts](src/client/four.ts)). Its arcade high score table is shared through a Pages Function, [functions/api/scores.ts](functions/api/scores.ts), which keeps the top ten (three initials, score, level, day) in Workers KV. One-time setup in the Cloudflare dashboard:

1. **Workers & Pages → KV → Create namespace**, named something like `heyderekj-scores`.
2. In the Pages project, go to **Settings → Bindings → Add → KV namespace**. Name it `SCORES` and pick that namespace.
3. Redeploy.

Until the binding exists, the function answers 503 and each player sees the scores kept in their own browser.
