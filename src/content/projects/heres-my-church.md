---
name: Here's My Church
tagline: Interactive map of U.S. churches—accurate, searchable, crowd-sourced.
url: https://heresmychurch.com
year: 2026
started: 2026-03-01
role: Designer & builder
stack: [React, Supabase]
image: /assets/images/projects/heresmychurch-og.png
featured: true
order: 2
status: paused
burnerLevel: Back Burner
---

## About

Here's My Church is an interactive map of Christian churches in the United States with a simple goal: be a trustworthy place to find, filter, and correct church information. Visitors can browse and search by name, denomination, size, or language; see address, website, and service times where available; and add or update listings so the dataset stays accurate over time.

The project is free, open source, and crowd-sourced—built for clarity and usefulness for people exploring churches, not for paywalls or noise.

## Tools & process

- Claude — first pass of the interactive map and visual system in a prompt-driven visual build, then carried forward into production code.
- React — SVG-based map UI with Motion for animation and Lucide for icons (not a generic embedded map widget); Vite for the production bundle.
- Supabase — backing database for church records and crowd-sourced corrections.
- OpenStreetMap, Census, and denomination sources — blending free location and attribute data; attendance estimates refined with building footprint logic where available.
- Product & data — modeling what “accurate church data” means in the UI, review flows for edits, and ongoing stewardship of the map experience.
