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
image: /assets/images/projects/harvous-1.png
hero: /assets/images/projects/harvous-3.webp
featured: true
order: 1
status: active
media:
  - type: video
    src: /assets/images/projects/harvous-demo.mp4
    poster: /assets/images/projects/harvous-demo-poster.webp
    caption: "A quick tour of Harvous — capture a note, keep scripture in the flow, pick up where you left off."
---

## The itch

I'm making Harvous because I need to remember the Bible, better. My study was scattered—notes in Apple Notes, highlights in YouVersion, sermon thoughts on whatever was nearby—and none of it ever came back to me when I needed it. So I'm building the place where Bible study gets remembered: keep your Bible app, add Harvous. Two years in, it's live at [app.harvous.com](https://app.harvous.com).

## Finding the shape

Two years, one massive messy Figma file. V1 shipped small on purpose—no sharing, no stickers, no captures—because the core loop had to earn everything else: save a note, organize it into threads, find it again. Captures came in v1.5; sharing, stickers, and groups in v2; shared stickers in v2.5. Then real feedback said the note view had gotten heavy—tabs and chrome stacked around the thing you came for—so I redesigned it. That wasn't a coat of paint: it took a refactor and a database migration, because the old shape had stopped serving the people using it. The small decisions got the same treatment—thread colors went through four side-by-side options before one won, onboarding through two full redesign rounds. The messy Figma file is the receipt.

<figure class="pembed">
  <iframe
    title="Making Harvous 1.0 — sketches through first ship in Figma"
    src="https://embed.figma.com/design/CHw1ZiUi48Cj1qmTFSNgYC/Making-Harvous-1.0--Copy-?node-id=13011-5625&embed-host=share"
    allowfullscreen
    loading="eager"
  ></iframe>
  <figcaption>The journey to Harvous 1.0 in Figma</figcaption>
</figure>

## The craft

The detail I sweat most: scripture should show up where you're thinking, not a tab away. Type `Romans 8:28` and the verse surfaces inline, with a translation picker (BSB, ESV, KJV, NKJV, NIV, NLT, NET) and verse-range controls right on the card. And every morning, Today's Passage waits at the top of My Home—a small nudge that keeps the app pointed at the actual habit.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/harvous-5.webp" alt="Harvous My Home with a personalized greeting, Today's Passage, and pick-up-where-you-left-off cards beside an empty note canvas" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/harvous-6.webp" alt="Inline Exodus scripture card with translation and verse-range controls open over a study note, plus highlight color swatches" loading="lazy" decoding="async" />
  <figcaption>My Home nudges the habit; inline scripture keeps study in the note—translation and range right on the card.</figcaption>
</figure>

## Staying close

Notes are private by default—but when you want to study with others, a note, a thread, or a whole space shares with a link. Not a social network, just a link. Onboarding is written the way I'd explain it across the table. And customer support mattered enough that I built Harvous its own internal ticketing system instead of bolting on a third-party widget—staying close to the people using it is the whole point.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/harvous-7.webp" alt="A shared Harvous note page for Jesus: our passover lamb with Open app and Add to my Harvous actions" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/harvous-8.webp" alt="Harvous sign-in screen with Open your study Bible headline and email sign-in" loading="lazy" decoding="async" />
  <figcaption>Sharing is a link, not a network — guests can read a note; signing in is how it becomes theirs.</figcaption>
</figure>

<figure class="pfig">
  <img src="/assets/images/projects/harvous-11.webp" alt="Harvous admin Support inbox with ticket list, selected question from Derek Castelli, device context, and triage notes" loading="lazy" decoding="async" />
  <figcaption>Custom support — tickets with app version, plan, and device context, plus triage notes. Built in-house so feedback stays next to the product.</figcaption>
</figure>

## Where it stands

Harvous is my front-burner product, open source under Testament Made LLC, and free at the core. The 2.0 UI is live at [app.harvous.com](https://app.harvous.com)—chrome stripped back until the notes are the interface, with appearance that feels like your study Bible, not a generic SaaS shell. Same principle as always: app first, AI second.

<figure class="pfig">
  <img src="/assets/images/projects/harvous-9.webp" alt="Harvous Appearance settings with Light Paper and Dark Night theme previews, Auto mode, and accent color swatches" loading="lazy" decoding="async" />
  <figcaption>Appearance in 2.0 — Paper or Night, Auto mode, and accents that feel personal without getting in the way.</figcaption>
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
    <summary>Cursor &amp; Claude</summary>
    <p>Feature work, refactors, and exploratory implementation with human-led product decisions.</p>
  </details>
  <details class="pacc-item">
    <summary>Vitest &amp; Playwright</summary>
    <p>Unit and E2E coverage for flows worth not regressing (shared spaces, invites, etc.).</p>
  </details>
  <details class="pacc-item">
    <summary>Principles</summary>
    <p>App first, AI second: opt-in assistance, suggestions not sermons, connections over generated theology (<a href="/posts/2025-03-11-app-first-ai-second">how that shows up in the product</a>).</p>
  </details>
</div>
