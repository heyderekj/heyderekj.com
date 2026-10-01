---
name: Koati
tagline: Where a request turns into agreed work.
summary: One inbox for every request from Slack, email, Figma comments, and meeting notes—sort what's worth doing, agree on it in writing, and let whoever asked follow along without an account.
url: https://koati-site-redesign.harvous.workers.dev/
category: App
role: Designer & builder
stack: [Laravel, Laravel Cloud]
image: /assets/images/projects/koati-v2-card.webp
icon: /assets/images/projects/koati-icon-v2.webp
tier: 1
order: 2
status: active
media:
  - src: /assets/images/projects/koati-v2-catch.webp
    alt: Koati inbox with requests from Slack, email, a meeting, and a Figma comment waiting to be sorted
    caption: "Catch — every request, wherever it was asked, lands in one inbox."
  - src: /assets/images/projects/koati-v2-sort.webp
    alt: Sorting a Slack message into a card with a title, kind of work, and owner
    caption: "Sort — you decide what's worth doing before it becomes work."
  - src: /assets/images/projects/koati-v2-agree.webp
    alt: The requester's view showing what was asked, what the team agreed to do, and where each request stands
    caption: "Agree — write down what you'll do. Whoever asked sees it."
  - src: /assets/images/projects/koati-v2-tools.webp
    alt: Settings connecting Slack, email, meeting notes, an AI assistant, Figma, and Webflow
    caption: "Your tools — the work stays in Figma and Webflow; Koati keeps the agreement."
  - src: /assets/images/projects/koati-v2-ideas.webp
    alt: A board with a suggested card noticing a recurring request is about due
    caption: "Ideas — Koati spots the next ask before anyone makes it."
---

## The itch

I've made websites since 2010, and the hard part was rarely the website. It was the requests: a Slack thread here, an email there, a line from a call, a comment on a Figma frame—each one asked again a week later because nobody could see where it stood. Somebody asks. Then they ask again.

Koati is where those requests land with their original wording intact, next to what we actually agreed to do.

## How it works

1. **Catch.** Requests come in from Slack, email, meeting notes, Figma comments, or a link anyone can submit to. Nothing is work until you say so.
2. **Sort.** Decide what's worth doing—kind of work, who picks it up, where the files live—before it turns into a ticket.
3. **Agree.** Write down what you'll do beside what was asked. A thumbs-up isn't a plan.
4. **Follow along.** Whoever asked gets a link to the board: planned, in progress, ready for review, done. No account, no install.
5. **Ideas.** Koati notices recurring asks—the sampling kit that comes up every 30 days—and suggests the card before anyone sends the message.

The work itself stays in the tools it's made in. A card links to the Figma file or the Webflow site; an assistant like Claude or ChatGPT can draft the first pass, and a person approves it.

## Who it's for

Marketing teams fielding requests from sales, product, and leadership—and the design and development agencies they hire. It's the tool I wanted on both sides of that relationship.

## Where it stands

Koati is my main focus alongside [Harvous](/projects/harvous/). It's live with a free plan (two shared boards and an unlimited personal one) and paid plans priced by shared boards only—everyone on the team and everyone who asks is free.

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>Laravel on Laravel Cloud</summary>
    <p>The app, the shared boards, and the request inbox.</p>
  </details>
  <details class="pacc-item">
    <summary>Integrations</summary>
    <p>Slack, email, Figma, Webflow, Google Drive, Dropbox, Loom, Linear, Jira, GitHub, and Asana—with Teams, Google Chat, and a browser extension next.</p>
  </details>
  <details class="pacc-item">
    <summary>AI, with a human in the loop</summary>
    <p>Claude, ChatGPT, or Grok can draft the work from a card's brief. The draft comes back for a person to approve.</p>
  </details>
</div>
