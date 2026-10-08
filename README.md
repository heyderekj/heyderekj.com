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

Site ID is set in `src/layouts/Base.astro` (`data-site` on the Fathom script).

## Deploy

Cloudflare is connected to the git repo (build: `npm run build`, output: `dist`, `NODE_VERSION=20`). Redirects live in [public/_redirects](public/_redirects) and headers in [public/_headers](public/_headers). Domain and DNS live in the Cloudflare dashboard. Set `IMAGE_CDN=cloudflare` in the build environment to serve resized images through Cloudflare Image Transformations (custom domain only).

Optional manual deploy: `npx wrangler pages deploy dist` when logged in locally.
