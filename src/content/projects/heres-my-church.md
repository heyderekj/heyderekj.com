---
name: Here's My Church
tagline: Interactive map of U.S. churches—accurate, searchable, crowd-sourced.
summary: An interactive map of Christian churches in the U.S.—browse by name, denomination, size, or language, and help keep the data accurate with crowd-sourced corrections.
url: https://heresmychurch.com
year: 2026
started: 2026-03-01
role: Designer & builder
stack: [React, Supabase]
image: /assets/images/projects/hmc-1.png
hero: /assets/images/projects/hmc-3.webp
featured: true
order: 2
status: maintained
burnerLevel: Simmering
---

## The 3am text

It started with a text from one of my best friends at 3am on a Sunday: "A map of every Christian church in the US would be pretty interesting to see." I agreed, so I started to build. The spark had a spark, too—a couple weeks earlier I'd made an interactive world-conflict map in Figma Make for fun, so I knew exactly what the tooling could do. Swap the dataset, and 48 hours later a church directory existed: idea, name, domain, data, and announcement, all inside a weekend.

<figure class="pfig">
  <img src="/assets/images/projects/hmc-4.webp" alt="Here's My Church Iowa map with a New Hope search open and results listed above the search bar" loading="lazy" decoding="async" />
  <figcaption>Where it landed — search a state, pick a church. The directory from that weekend, usable.</figcaption>
</figure>

## Data does the design

The surprise wasn't building the map—it was that no comprehensive, well-designed church directory existed. So the design work became data work: OpenStreetMap locations cross-referenced with U.S. Census and denomination records, all free and public. Attendance estimates were the fun part—building square footage, portioned down to a sanctuary and shrunk below full capacity, gave 40–50% of churches a realistic weekly number instead of a guess. Not perfect, but honest about what it is.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/hmc-5.webp" alt="Iowa map with Filters open — verified criteria and attendance size ranges controlling which churches show" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/hmc-6.webp" alt="Church detail card for Meadowbrook Baptist Church with estimated attendance, denomination, reactions, and bilingual estimate" loading="lazy" decoding="async" />
  <figcaption>“Verified” has a definition you can read. Attendance is labeled an estimate—and the card is where size, denomination, and feel live together.</figcaption>
</figure>

## Kept accurate by strangers

Church directories rot because updating them is a chore. Here's My Church makes corrections anonymous—no account, just fix the field—and keeps the crowd honest with a review queue: every proposed change gets human eyes before it lands. 1,640 corrections and 74 churches improved so far, from people who just wanted the map to be right.

## Where it stands

244,360 churches across all 50 states—about one church per 1,368 people. It's free, open source, and simmering: I steward the data and the map, and the crowd keeps it honest.

<figure class="pfig">
  <img src="/assets/images/projects/hmc-9.webp" alt="National Here's My Church map showing 244,363 churches across 50 states with Texas highlighted at 16,596 churches" loading="lazy" decoding="async" />
  <figcaption>The whole country on one map — denser purple where the churches are, and a clear count of what still needs review.</figcaption>
</figure>

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>Claude</summary>
    <p>First pass of the interactive map and visual system in a prompt-driven visual build, then carried forward into production code.</p>
  </details>
  <details class="pacc-item">
    <summary>React</summary>
    <p>SVG-based map UI with Motion for animation and Lucide for icons (not a generic embedded map widget); Vite for the production bundle.</p>
  </details>
  <details class="pacc-item">
    <summary>Supabase</summary>
    <p>Backing database for church records and crowd-sourced corrections.</p>
  </details>
  <details class="pacc-item">
    <summary>OpenStreetMap, Census &amp; denomination sources</summary>
    <p>Blending free location and attribute data; attendance estimates refined with building footprint logic where available.</p>
  </details>
  <details class="pacc-item">
    <summary>Product &amp; data</summary>
    <p>Modeling what “accurate church data” means in the UI, review flows for edits, and ongoing stewardship of the map experience.</p>
  </details>
</div>
