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
hero: /assets/images/projects/harvous-hero.webp
imageFit: contain
featured: true
order: 1
status: active
---

## The itch

I'm making Harvous because I need to remember the Bible, better. My study was scattered—notes in Apple Notes, highlights in YouVersion, sermon thoughts on whatever was nearby—and none of it ever came back to me when I needed it. So I'm building the place where Bible study gets remembered: keep your Bible app, add Harvous. Two years in, it's live at [app.harvous.com](https://app.harvous.com).

## Finding the shape

Two years, one massive messy Figma file. V1 shipped small on purpose—no sharing, no stickers, no captures—because the core loop had to earn everything else: save a note, organize it into threads, find it again. Captures came in v1.5; sharing, stickers, and groups in v2; shared stickers in v2.5. Then real feedback said the note view had gotten heavy—tabs and chrome stacked around the thing you came for—so I redesigned it. That wasn't a coat of paint: it took a refactor and a database migration, because the old shape had stopped serving the people using it. The small decisions got the same treatment—thread colors went through four side-by-side options before one won, onboarding through two full redesign rounds. The messy Figma file is the receipt.

<figure class="pfig">
  <img src="/assets/images/projects/harvous-note-detail.webp" alt="A Harvous note titled 'God is faithful, even here' with inline scripture chips for Exodus 1:1-22, Genesis 50:20, and Romans 8:28" loading="lazy" decoding="async" />
  <figcaption>The note view after the redesign — the note itself first, actions tucked into the rail. Type a reference and the verse lives in the note.</figcaption>
</figure>

## The craft

The detail I sweat most: scripture should show up where you're thinking, not a tab away. Type `Romans 8:28` and the verse surfaces inline, with a translation picker (BSB, ESV, KJV, NKJV, NIV, NLT, NET) and verse-range controls right on the card. And every morning, Today's Passage waits at the top of My Home—a small nudge that keeps the app pointed at the actual habit.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/harvous-today-passage-f.webp" alt="The Today's Passage card on My Home showing Matthew 7:7-8 with Add to my Harvous and Create note actions" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/harvous-scripture-inline.webp" alt="An inline scripture card for Exodus 5:1-5 with the translation picker open and verse-range controls" loading="lazy" decoding="async" />
  <figcaption>Today's Passage greets you at the door; inline scripture keeps you in the note. No app switching, no copy-paste.</figcaption>
</figure>

## Staying close

Notes are private by default—but when you want to study with others, a note, a thread, or a whole space shares with a link. Not a social network, just a link. Onboarding is written the way I'd explain it across the table. And customer support mattered enough that I built Harvous its own internal ticketing system instead of bolting on a third-party widget—staying close to the people using it is the whole point.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/harvous-share-flow.webp" alt="The Share Note sheet with Only I can see this note and Shared with link to anyone options plus a copyable link" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/harvous-onboarding-f.webp" alt="The Finding your way around onboarding note with the note actions menu open" loading="lazy" decoding="async" />
  <figcaption>Sharing is a link, not a network — and onboarding reads like a note, because it is one.</figcaption>
</figure>

## Where it stands

Harvous is my front-burner product, open source under Testament Made LLC, and free at the core. Right now I'm mid-redesign—stripping the chrome back until the notes are the interface at [new.harvous.com](https://new.harvous.com)—and experimenting with a native Mac app for capture that feels instant. Same principle as always: app first, AI second.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/harvous-new-ui-f.webp" alt="The new Harvous redesign at new.harvous.com — a minimal notes list and a Pick a note to open empty state" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/harvous-mac-app.webp" alt="An experimental native Harvous Mac app with a translucent sidebar and a No Note Selected empty state" loading="lazy" decoding="async" />
  <figcaption>What's cooking — the redesign in progress, and a native Mac app experiment. Both chasing capture without friction.</figcaption>
</figure>

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>React + Hono</summary>
    <p>React SPA for the note-centric UI; Hono handles the HTTP API that ships beside the static app as a bundled server handler in the repo.</p>
  </details>
  <details class="pacc-item">
    <summary>TanStack Router &amp; React Query</summary>
    <p>Client routing and server state that stay predictable as the surface area grows.</p>
  </details>
  <details class="pacc-item">
    <summary>TipTap</summary>
    <p>Rich note editing and scripture-friendly workflows in the editor layer.</p>
  </details>
  <details class="pacc-item">
    <summary>Drizzle + Supabase</summary>
    <p>Relational data model for notes, threads, spaces, and sync-friendly persistence.</p>
  </details>
  <details class="pacc-item">
    <summary>Clerk</summary>
    <p>Authentication and session handling wired through the same stack as the API.</p>
  </details>
  <details class="pacc-item">
    <summary>Mast</summary>
    <p>Marketing site layout: modular, tight first impression for <a href="https://harvous.com/">harvous.com</a> (<a href="https://www.nocodesupply.co/mast/docs">Mast docs</a>).</p>
  </details>
  <details class="pacc-item">
    <summary>Cursor &amp; Claude</summary>
    <p>Feature work, refactors, and exploratory implementation with human-led product decisions.</p>
  </details>
  <details class="pacc-item">
    <summary>Vitest &amp; Playwright</summary>
    <p>Unit and E2E coverage for flows worth not regressing (shared spaces, invites, etc.).</p>
  </details>
  <details class="pacc-item">
    <summary>Capacitor</summary>
    <p>Native shell path in the repo for future iOS/Android packaging on top of the same web build.</p>
  </details>
  <details class="pacc-item">
    <summary>Principles</summary>
    <p>App first, AI second: opt-in assistance, suggestions not sermons, connections over generated theology (<a href="/posts/2025-03-11-app-first-ai-second">how that shows up in the product</a>).</p>
  </details>
</div>
