---
name: ReviseMy
tagline: Mark feedback for your agent.
summary: Human-in-the-loop design review for agentic workflows—upload UI screenshots, mark what matters, approve or request changes, and let your agent read structured work packets.
url: https://revisemy.com
year: 2026
started: 2026-07-01
updated: 2026-07-01
category: App
burnerLevel: Front Burner
role: Designer & builder
stack: [Laravel, Livewire, Flux, MCP]
image: /assets/images/projects/revisemy-1.webp
hero: /assets/images/projects/revisemy-3.webp
heroPosition: center center
icon: /assets/images/projects/revisemy-app-icon.png
featured: true
order: 2
status: active
---

## The itch

Agents are great at shipping and famously bad at knowing whether the thing *looks right*. I'd had the idea since 2024—a self-serve feedback loop tool—and it sat as an unused domain while I kept not building it. ReviseMy puts a human back in the agent's loop without dragging the work into a meeting: the agent uploads screenshots, you mark what matters, the agent reads structured work packets and keeps going.

## The weekend

What finally unstuck it was a challenge: build on [Laravel Cloud](https://cloud.laravel.com) for the first time, in a weekend. Two days later the domain finally meant something—reborn as an MCP server your agent talks to from inside ChatGPT, Claude, or Cursor. Sometimes the missing ingredient isn't the idea, it's the deadline.

## How the loop works

The product speaks in marks (rose rectangles + M1/M2 badges), not pins—human marks are authoritative. Drag to outline a region or click for a point note. Your marks become cards on the Board: Open (you) → In progress (agent) → Resolved → Verified (you again). Optional second-opinion hints queue a type-aware design checklist, but they stay hints until you accept them. Agents attach before/after evidence when resolving, and multi-pass checkups mean you can request changes and open pass 2+ without losing context.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/revisemy-4.webp" alt="ReviseMy review of a Customer.io homepage hero with an M1 mark on the cookie banner, My marks panel open, and Second opinion hint cards" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/revisemy-5.webp" alt="ReviseMy guest link menu with copy link, generate new link, expiry options, and disable comments" loading="lazy" decoding="async" />
  <figcaption>Your marks are authoritative; second-opinion hints stay optional. Guests get a link you can expire—not another account.</figcaption>
</figure>

## Try it

No account needed: grab a try token on the homepage, paste the MCP config into ChatGPT, Claude, or Cursor, and run a full agent↔human checkup loop in about two minutes. It's open source, so the loop is inspectable too.

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>Laravel 13 + Livewire 4 + Flux</summary>
    <p>Review UI, marks panel, and server-rendered flows.</p>
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
