---
name: Harvous
tagline: A notes app designed for Bible study—threads, scripture, and recall.
summary: A web-based notes app for Bible study that helps you save, organize, and reconnect what mattered from reading, sermons, and small group—without replacing your Bible reader.
url: https://harvous.com
year: 2024
started: 2024-03-01
category: App
burnerLevel: Front Burner
role: Designer & builder
stack: [React, Hono, Supabase, Clerk]
image: /assets/images/projects/harvous-preview.webp
imageFit: contain
media:
  - src: /assets/images/projects/harvous-app-scripture.png
    alt: An inline scripture card in Harvous showing Exodus 5:1-5 with a translation picker open (BSB, ESV, KJV, NKJV) and verse-range controls
    caption: Scripture surfaces inline — translation picker and verse-range controls right on the card, no app switching.
  - src: /assets/images/projects/harvous-app-note.png
    alt: The Harvous note editor with the formatting toolbar — bold, italic, lists, headings, links
    caption: The editor stays out of the way — one quiet formatting row, the note itself first.
featured: true
order: 1
status: active
---

## About

Harvous is a web-based notes app for Bible study—the place you save, organize, and find again what mattered from reading, sermons, or small group, without replacing your favorite Bible reader. Notes live in threads and spaces; type `Romans 8:28` and the text surfaces inline; highlights, cross-references, and tags help you reconnect ideas later. It's open source, free at the core, and I'm building it because I need to remember Scripture better.

## Iterations

![Harvous — from first wireframes to the launched app.](/assets/images/projects/harvous-start-to-launch.png)

Two years, one massive messy Figma file. The decisions that shaped each version—what changed, and why:

- **Start small on purpose.** V1 shipped with no sharing, no stickers, no captures. The core loop had to work first: save a note, organize it into threads, find it again. Everything else waited until that loop earned it. Captures came in v1.5; sharing, stickers, and groups in v2; shared stickers in v2.5.
- **The redesign.** Real feedback said the old note view was heavy—tabs and chrome stacked around the thing you came for. The new version puts the note itself first and moves actions out of the way. Getting there wasn't a coat of paint: it took a refactor and a database migration, because the old shape had stopped serving the people using it.
- **Sweating the small decisions.** Thread colors alone went through four side-by-side options before one won. Same with app icons, onboarding (two full redesign rounds), and the mobile menu. The messy Figma file is the receipt.
- **Support as a feature.** Staying close to users mattered enough that I built Harvous its own internal support ticketing system instead of bolting on a third-party widget.

## Tools & process

- React + Hono — React SPA for the note-centric UI; Hono handles the HTTP API that ships beside the static app as a bundled server handler in the repo.
- TanStack Router & React Query — client routing and server state that stay predictable as the surface area grows.
- TipTap — rich note editing and scripture-friendly workflows in the editor layer.
- Drizzle + Supabase — relational data model for notes, threads, spaces, and sync-friendly persistence.
- Clerk — authentication and session handling wired through the same stack as the API.
- Mast — marketing site layout: modular, tight first impression for [harvous.com](https://harvous.com/) ([Mast docs](https://www.nocodesupply.co/mast/docs)).
- Cursor & Claude — feature work, refactors, and exploratory implementation with human-led product decisions.
- Vitest & Playwright — unit and E2E coverage for flows worth not regressing (shared spaces, invites, etc.).
- Capacitor — native shell path in the repo for future iOS/Android packaging on top of the same web build.
- Principles — app first, AI second: opt-in assistance, suggestions not sermons, connections over generated theology ([how that shows up in the product](/posts/2025-03-11-app-first-ai-second)).
