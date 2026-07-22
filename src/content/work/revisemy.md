---
title: "ReviseMy"
date: 2026-07-21
description: "Marketing site and product UI for ReviseMy—human-in-the-loop design review for agentic workflows, built on Laravel Cloud in a weekend."
draft: false
highlight: true
workType: "Design & Development"
industry:
  - "devtools"
  - "startup"
dateCompleted: 2026-07-21
thumbnail: "/images/work/revisemy/gallery-01.webp"
gallery:
  - "/images/work/revisemy/gallery-02.webp"
  - "/images/work/revisemy/gallery-03.webp"
  - "/images/work/revisemy/gallery-04.webp"
  - "/images/work/revisemy/gallery-05.webp"
  - "/images/work/revisemy/gallery-06.webp"
video: "/images/work/revisemy/tour.mp4"
videoPoster: "/images/work/revisemy/video-poster.webp"
videoAspect: "1500 / 900"
videoCaption: "Product tour — marks, the board, guest links, and the agent checkup loop."
liveLink: "https://revisemy.com"
soloOrAgency: "Solo"
estimatedTimeSpent: "1 week"
brief: |
  ReviseMy is a self-serve design checkup loop for agents and humans. Agents upload screenshots; you mark what matters; the agent reads structured work packets and keeps going—without dragging the review into a meeting.

  I’d had the idea since 2024 as an unused domain. A weekend challenge to build on Laravel Cloud for the first time finally unstuck it: design and ship revisemy.com plus the review product as an MCP server your agent talks to from ChatGPT, Claude, or Cursor.
problem: |
  Agents are great at shipping and famously bad at knowing whether the thing looks right. Feedback usually means screenshots in chat, vague notes, or a sync—none of which give the agent a structured packet to act on and close the loop.

  The product needed a clear marketing surface and a review UI that made human marks authoritative, not another pinboard that died in Slack.
solution: |
  The site leads with the loop: try token on the homepage, paste MCP config, run a full agent↔human checkup in about two minutes. The product speaks in marks (yellow rectangles + M1/M2 badges), not pins—drag a region or click a point; guest feedback lands in gray. Marks become Board cards (Open → In progress → Resolved → Verified).

  Optional second-opinion hints stay hints until you accept them. Guests get an expirable link, not another account. Open source so the loop is inspectable.
specificWork: |
  - End-to-end design and build of revisemy.com and the review product UI
  - Marks, Board lifecycle, guest links, and second-opinion hint flows
  - Laravel MCP tools for agent workflows (create_review, get_review, work packets)
  - Try-token onboarding without signup; Laravel Cloud deploy
tags:
  - "devtools"
  - "startup"
  - "mcp"
  - "design"
  - "development"
---
