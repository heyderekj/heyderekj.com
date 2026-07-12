---
name: ReviseMy
tagline: Mark feedback for your agent.
summary: Human-in-the-loop design review for agentic workflows—upload UI screenshots, mark what matters, approve or request changes, and let your agent read structured work packets.
url: https://revisemy.com
year: 2024
started: 2024-09-01
category: App
burnerLevel: Front Burner
role: Designer & builder
stack: [Laravel, Livewire, Flux, MCP]
image: /assets/images/projects/revisemy-og.svg
featured: true
order: 2
status: active
---

## About

ReviseMy is an open-source human-in-the-loop design review tool. Your agent uploads UI screenshots over [Laravel MCP](https://laravel.com/docs/mcp); you open a review link, **mark** what matters like a design critique, then approve or request changes. The agent reads structured work packets and keeps going.

The product speaks in marks (rose rectangles + M1/M2 badges), not pins—human marks are authoritative. Drag to outline a region or click for a point note; zoom with +/− and pan with Space+drag. Optional second-opinion hints queue a type-aware design checklist on every screenshot. Agents can attach before/after evidence when resolving a mark, and multi-pass checkups let you request changes and open pass 2+ without losing context.

Try it without an account: get a try token on the homepage, paste MCP config for ChatGPT, Claude, or Cursor, and run a full agent↔human checkup loop in about two minutes.

## Tools & process

- Laravel 13 + Livewire 4 + Flux — review UI, marks panel, and server-rendered flows.
- Laravel MCP — `create_review`, `get_review`, `list_reviews`, `add_screenshot`, `add_findings`, and `request_second_opinion` tools for agent workflows.
- Laravel Sanctum — try tokens for frictionless onboarding without signup.
- Server-side capture (optional) — render `page_url`, PDF decks, or raw email HTML when agents should not screenshot manually.
- Laravel Cloud — deploy target with Postgres, object storage, and queue workers for second-opinion jobs.
