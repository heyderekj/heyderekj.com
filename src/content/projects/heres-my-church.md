---
name: Here's My Church
tagline: Interactive map of U.S. churches—accurate, searchable, crowd-sourced.
summary: An interactive map of Christian churches in the U.S.—browse by name, denomination, size, or language, and help keep the data accurate with crowd-sourced corrections.
url: https://heresmychurch.com
year: 2026
started: 2026-03-01
role: Designer & builder
stack: [React, Supabase]
image: /assets/images/projects/heresmychurch-og.png
media:
  - src: /assets/images/projects/hmc-us-map.webp
    alt: The Here's My Church U.S. choropleth — 244,360 churches across 50 states with state-by-state density shading
    caption: 244,360 churches across 50 states — the whole dataset at a glance, one person browsing with you now.
  - src: /assets/images/projects/hmc-iowa-map.webp
    alt: Iowa zoomed in — 5,176 churches plotted county by county with a filters panel
    caption: Zoom into a state and every church is a dot — 5,176 in Iowa alone, filterable by size, denomination, and language.
  - src: /assets/images/projects/hmc-church-detail.webp
    alt: A church detail panel showing service times, estimated attendance, denomination, ministries, and a sentiment row
    caption: A church page in one panel — service times, attendance, ministries, and how people feel about it.
  - src: /assets/images/projects/hmc-update-panel.webp
    alt: The Update Church Info panel for Parkside Baptist Church with missing fields flagged and a website submitted for review
    caption: Crowd-sourced accuracy — missing fields are flagged, anyone can fill them in, edits queue for review.
  - src: /assets/images/projects/hmc-review-queue.webp
    alt: The review queue — proposed address and name changes with Approve and Reject actions
    caption: The review queue keeps the crowd honest — every proposed change gets human eyes before it lands.
  - src: /assets/images/projects/hmc-origin-figma-make.webp
    alt: The Figma Make prototype that started it all — an interactive world conflict map built with Claude
    caption: Where it started — a Figma Make conflict-map experiment. Swap the dataset, and a church directory was born.
featured: true
order: 2
status: maintained
burnerLevel: Simmering
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
