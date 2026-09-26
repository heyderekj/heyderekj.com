# Content Workflow (Internal)

This document is the day-to-day workflow for drafting and publishing content.

## Create Draft Content

All scaffold commands create entries with `draft: true` by default.

```sh
npm run new:essay -- --slug my-new-essay --title "My New Essay"   # add --mdx for components
npm run new:note                                                   # slug + title optional
npm run new:link -- --slug cool-thing --title "Cool thing" --link https://example.com
npm run new:post -- --slug my-new-post --title "My New Post"      # = new:essay
npm run new:work -- --slug client-case-study --title "Client Case Study"
npm run new:project -- --slug app-name --title "App Name"
```

Or use one generic command:

```sh
npm run new:content -- --type post --slug my-new-post --title "My New Post"
```

## Review Locally

```sh
npm run dev
```

Use local preview to review copy, links, and formatting. In `astro dev`, drafts are listed and viewable (with a "Draft preview" banner) so you can see them in place; `npm run build` leaves them out entirely.

## Publish

1. Change `draft: true` to `draft: false` in the target file.
2. Build and verify:

```sh
npm run build
```

3. Deploy when ready.

## Writing: essays, notes, links

Posts are one typed stream (`src/content/posts/`, schema in `src/content/config.ts`):

| `type` | What it is | Title | Shows |
| --- | --- | --- | --- |
| `essay` (default) | Long-form with an argument | required | status chip + rev number, revision history |
| `note` | A short thought | optional (falls back to its opening words) | "Note" label, ★ permalink |
| `link` | Daring Fireball-style link + commentary | required, links out to `link` | host, `via`, ★ permalink |

Useful frontmatter:

```yaml
type: essay
title: "Designing in public"
date: 2026-09-26
tags: [design, ai]            # slugs from src/data/topics.ts
status: working               # working | stable | outdated
supersededBy: 2027-01-01-slug # when outdated
audience: "Designers who…"    # "Assumed audience" callout
toc: true                     # default: on for essays with 4+ h2s
updated: 2026-10-01           # override the git-derived updated date
link: https://…               # link posts
via: { name: "Maggie Appleton", url: "https://maggieappleton.com" }
```

`draft: true` means hidden. `status: working` means published but still in progress.

### Revisions (`Rev:` trailer)

Every essay shows `Status · rev N` and a revision list at the end, read from git at build time (`src/lib/revisions.ts`).

- rev 1 is publication (`date`).
- A commit that touches the post counts as a revision when its message has a `Rev:` trailer, and the trailer text is the note shown on the site:

  ```sh
  git commit -m "Tighten the argument in section 3" -m "Rev: Rewrote the conclusion after feedback"
  ```

- Every other commit (typos, tags, housekeeping) is a **minor edit**: listed, collapsed, and it doesn't bump the number or the updated date.
- For edits from before git (posts imported in April 2026), add `changelog` entries, and each one counts as a revision:

  ```yaml
  changelog:
    - date: 2025-06-01
      note: "Added the section on pricing"
    - date: 2026-10-02
      note: "Clarified the intro"
      commit: 1a2b3c4   # annotates an existing commit instead of adding a rev
  ```

Netlify builds unshallow the clone first (`scripts/ensure-git-history.mjs`). If history is ever unavailable, pages fall back to the frontmatter changelog and a "Full history on GitHub" link.

### Topics

Tags are kebab-case slugs. Add labels and one-line descriptions in `src/data/topics.ts`; each tag gets `/topics/<tag>/`. Unknown tags still build, with a warning.

### Feed

`/rss.xml` carries everything. Essays are prefixed `★`. Link items point at the external URL, with the permalink as the guid and a trailing ★. `.md` posts go out in full; `.mdx` posts send a summary and a link.

## Components in `.mdx` posts

Use `.mdx` (or `npm run new:essay -- --mdx`) for deep dives. These components are available **without imports** (`src/components/post/`). See the draft `2026-09-26-component-kitchen-sink.mdx` for every one of them rendered; it's visible at `/posts/2026-09-26-component-kitchen-sink/` in `npm run dev`.

```mdx
A claim worth qualifying.<Sidenote>Shows in the margin on wide screens, as a tap-to-open note on phones.</Sidenote>

<Figure src="/images/posts/slug/shot.png" alt="…" caption="…" />

<Compare
  before={{ src: '/images/posts/slug/v1.png', alt: '…' }}
  after={{ src: '/images/posts/slug/v2.png', alt: '…', label: 'v2' }}
  caption="Nav, v1 → v2"
  mode="pair"
/>

<Snapshots items={[
  { src: '/images/posts/slug/v1.png', caption: 'v1 · Jan' },
  { src: '/images/posts/slug/v2.png', caption: 'v2 · Feb' },
]} />

<Prompt model="Claude Opus 5.5" tool="Claude Code" date="2026-09-26">
  <div slot="prompt">The prompt, verbatim.</div>
  <div slot="response">What came back (markdown OK).</div>
</Prompt>

<Prompt label="Transcript" model="Claude Opus 5.5" visible={2} turns={[
  { role: 'user', text: '…' },
  { role: 'assistant', text: '…' },
]} />

<Callout kind="note">…</Callout>

<Appendix title="Raw numbers" label="Appendix A">
…markdown, tables, lists…
</Appendix>
```

`Compare` also takes `mode="stepper"`. `Callout` kinds are `note`, `update`, `audience`, and `outdated`.

GFM footnotes (`[^1]`) and tables work in both `.md` and `.mdx`. Put post images under `public/images/posts/<slug>/`. On Netlify they're resized automatically (`src/lib/img.ts`).

## Library

`/library/` collects things I've saved and love, laid out as a blueprint grid (`src/styles/library.css`). Each item is one file in `src/content/library/<kind>-<slug>.md`. The kind prefix keeps item URLs from colliding with `/library/books/` and the other kind pages.

```sh
npm run new:save -- --kind book --slug shape-up --title "Shape Up" --by "Ryan Singer"
npm run new:save -- --kind bookmark --slug garden --title "Maggie's garden" --url https://maggieappleton.com/garden
npm run new:save -- --kind post --slug some-post --url https://x.com/…   # then fill in post.text / handle / postedAt
```

Kinds: `interest`, `book`, `podcast`, `bookmark`, `post` (saved X post), `person`, `tool`.

| Field | Use |
| --- | --- |
| `title`, `url`, `by`, `note` | Card basics; `note` is the one-liner |
| `image` | Cover, artwork, or photo under `public/` (resized via the image CDN) |
| `date` | When saved, read, or started; also sets the catalog number (`BK-003`) |
| `group` | Sub-sections: tool groups ("Design web"), interests ("Legos", "F1", "Tesla") |
| `favorite` | Orange corner flag |
| `reading` | Books: `reading`, `read`, or `want` |
| `met`, `remembered` | People |
| `post: { text, handle, postedAt }` | Saved X posts, rendered as a static card (no embed, survives deletion) |
| `order` | Manual ordering (lower first) |

Covers and artwork live in `public/images/library/<file-name>.<ext>`. Book covers came from Open Library and podcast artwork from Apple Podcasts listings. Interest illustrations are generated line drawings: edit or add one in `scripts/library-art.mjs`, then run `node scripts/library-art.mjs`.

Write anything in the body and the item gets its own page (`/library/<file-name>/`) with a spec-sheet header. MDX post components work there too. Items without a body link straight to `url`.

`/people` and `/tools` redirect to `/library/people/` and `/library/tools/`.

## Import work from Webflow / CSV

Bulk update existing `src/content/work/<slug>.md` files (and download images to `public/images/work/`) from an exported **Works** CSV:

```sh
npm run import:work -- /path/to/works.csv
```

Use `--dry-run` to only log which files would be written and which downloads would run. The CSV must be readable by Node (avoid sandboxed locations if the script cannot read the file). Only slugs that already have a matching `.md` in `src/content/work/` are updated; other rows are skipped and listed in the console.

## Notes

- Drafts are excluded from public listings, detail pages, the feed, and `sitemap.xml` in builds.
- For projects, `featured: true` controls homepage surfacing.
