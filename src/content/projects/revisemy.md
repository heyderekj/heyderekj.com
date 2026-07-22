---
name: ReviseMy
tagline: Mark feedback for your agent.
summary: Human-in-the-loop design review for agentic workflows—agents upload UI, you mark what matters, guests can weigh in from a link, and the Board keeps Open through Verified until the loop closes.
url: https://revisemy.com
year: 2026
started: 2026-07-01
updated: 2026-07-22
category: App
burnerLevel: Front Burner
role: Designer & builder
stack: [Laravel, Livewire, Flux, MCP]
image: /assets/images/projects/revisemy-1.webp
hero: /assets/images/projects/revisemy-1.webp
heroPosition: center center
icon: /assets/images/projects/revisemy-app-icon.png
featured: true
order: 2
status: active
---

## The itch

Agents are great at shipping and famously bad at knowing whether the thing *looks right*. Feedback usually means screenshots in chat, vague notes, or a sync—none of which give the agent a structured packet to act on. I'd had the idea since 2024 for a self-serve loop tool; it sat as an unused domain while I kept not building it.

## The weekend

What finally unstuck it was a challenge: build on [Laravel Cloud](https://cloud.laravel.com) for the first time, in a weekend. Two days later the domain meant something—an MCP server your agent talks to from ChatGPT, Claude, or Cursor, with a review UI that makes human marks authoritative. Sometimes the missing ingredient isn't the idea, it's the deadline.

## How the loop works

The product speaks in **marks**, not pins: yellow rectangles and M1/M2 badges on the capture. Drag a region or click a point. Guest feedback shows up in gray so you can tell it apart from yours. Optional second-opinion hints can queue a type-aware checklist, but they stay hints until you accept them—your marks are the ones that count.

Need another human without another account? Share a guest link you can expire (or rotate). Guests mark from the link; you stay the owner.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/revisemy-2.webp" alt="ReviseMy Share menu with copy guest link, generate new link, and expiry options" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/revisemy-3.webp" alt="ReviseMy Board with Open, In progress, Resolved, and Verified columns for a design checkup" loading="lazy" decoding="async" />
  <figcaption>Guest links you can expire · Board columns that close the loop.</figcaption>
</figure>

Every mark becomes a Board card: **Open** (you) → **In progress** (agent) → **Resolved** → **Verified** (you again). Agents attach before/after evidence when they resolve; request changes and open pass 2+ without losing context.

## Try it

No account needed: grab a try token on the homepage, paste the MCP config into ChatGPT, Claude, or Cursor, and run a full agent↔human checkup in about two minutes. Open source, so the loop is inspectable too.

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>Laravel 13 + Livewire 4 + Flux</summary>
    <p>Review UI, marks panel, Board, and server-rendered flows.</p>
  </details>
  <details class="pacc-item">
    <summary>Laravel MCP</summary>
    <p><code>create_review</code>, <code>get_review</code>, <code>list_reviews</code>, <code>add_screenshot</code>, <code>add_findings</code>, and <code>request_second_opinion</code> tools for agent workflows.</p>
  </details>
  <details class="pacc-item">
    <summary>Laravel Sanctum</summary>
    <p>Try tokens for frictionless onboarding without signup.</p>
  </details>
  <details class="pacc-item">
    <summary>Server-side capture</summary>
    <p>Optional render of <code>page_url</code>, PDF decks, or raw email HTML when agents should not screenshot manually.</p>
  </details>
  <details class="pacc-item">
    <summary>Laravel Cloud</summary>
    <p>Deploy target with Postgres, object storage, and queue workers for second-opinion jobs.</p>
  </details>
</div>
