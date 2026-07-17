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
image: /assets/images/projects/revisemy-og.png
icon: /assets/images/projects/revisemy-app-icon.png
media:
  - src: /assets/images/projects/revisemy-board.webp
    alt: The ReviseMy Board — kanban columns for Open (you), In progress (agent), Resolved, and Verified, with marks as cards
    caption: The Board — your marks move through Open → In progress → Resolved → Verified. You flag, the agent fixes, you verify.
  - src: /assets/images/projects/revisemy-marks.webp
    alt: The My marks panel with a Must fix and a Keep this mark, above a Second opinion panel of accept-or-dismiss hint cards
    caption: Marks speak human — "Must fix," "Keep this." Second-opinion hints stay hints until you accept them; human marks are authoritative.
  - src: /assets/images/projects/revisemy-share.webp
    alt: The Share menu with copy guest link, generate new link, expiry options from 1 day to never, and disable comments
    caption: Reviews travel as guest links with expiry you control — no account needed to leave marks.
  - src: /assets/images/projects/revisemy-board-mobile.webp
    alt: The ReviseMy Board collapsed to a narrow width with a dot pager under the columns
    caption: The Board collapses to one column at phone width — review from wherever the ping finds you.
featured: true
order: 2
status: active
---

## About

ReviseMy is an open-source human-in-the-loop design review tool. Your agent uploads UI screenshots over [Laravel MCP](https://laravel.com/docs/mcp); you open a review link, **mark** what matters like a design critique, then approve or request changes. The agent reads structured work packets and keeps going.

I'd had the idea since 2024—a self-serve feedback loop tool that sat as an unused domain while I kept not building it. Then a weekend challenge: build on Laravel Cloud for the first time. Two days later the domain finally meant something. Agents are great at shipping and famously bad at knowing whether the thing *looks right*—ReviseMy puts a human back in that loop without dragging the work into a meeting.

The product speaks in marks (rose rectangles + M1/M2 badges), not pins—human marks are authoritative. Drag to outline a region or click for a point note; zoom with +/− and pan with Space+drag. Optional second-opinion hints queue a type-aware design checklist on every screenshot. Agents can attach before/after evidence when resolving a mark, and multi-pass checkups let you request changes and open pass 2+ without losing context.

Try it without an account: get a try token on the homepage, paste MCP config for ChatGPT, Claude, or Cursor, and run a full agent↔human checkup loop in about two minutes.

## Tools & process

- Laravel 13 + Livewire 4 + Flux — review UI, marks panel, and server-rendered flows.
- Laravel MCP — `create_review`, `get_review`, `list_reviews`, `add_screenshot`, `add_findings`, and `request_second_opinion` tools for agent workflows.
- Laravel Sanctum — try tokens for frictionless onboarding without signup.
- Server-side capture (optional) — render `page_url`, PDF decks, or raw email HTML when agents should not screenshot manually.
- Laravel Cloud — deploy target with Postgres, object storage, and queue workers for second-opinion jobs.
