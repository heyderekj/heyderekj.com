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
featured: true
order: 1
status: active
---

## About

Harvous is a web-based notes app for Bible study. It is meant to be the place you save, organize, and find again what mattered from reading, sermons, or small group—without replacing your favorite Bible reader. Notes live in threads (flexible groupings) and spaces for focused study; type a reference like `Romans 8:28` and the text can surface inline; highlights, cross-references, and keyword-aware tags help you reconnect ideas later.

Keep your Bible app; add Harvous. The product is deliberately notes-first: capture from your physical Bible, a reader app, or conversation, then search across scripture, threads, and tags when you need that thought again. Supported translations today include BSB, ESV, KJV, NKJV, NIV, NLT, and NET (more planned).

Notes are private by default (the [marketing site](https://harvous.com/) describes them as encrypted); you can share a note, a whole thread, or a shared space with a link when you want to study with others—useful for small groups or church without turning the whole app into a social network. Everything works in the browser; on mobile, add to Home Screen gives an app-like shell. Offline is partial: you can create notes offline and sync when you are back online (sync status lives under profile / data). You can export everything as CSV from Profile → My Data.

Harvous is open source, free at the core, and published under Testament Made LLC. I am building it because I need to remember Scripture better—and to prove you can ship faith-rooted software with a clear point of view and AI in the background, not as the headline feature.

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
