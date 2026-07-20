---
name: Binky
tagline: Binky sorts your files.
summary: A native macOS app that watches your Downloads folder and quietly sorts incoming files into sensible folders—nothing disappears, unknowns go to Review.
url: https://binkyfiles.com
year: 2026
started: 2026-05-01
role: Designer & builder
stack: [Swift]
image: /assets/images/projects/binky-1.png
hero: /assets/images/projects/binky-1.webp
featured: true
order: 4
status: paused
burnerLevel: Back Burner
---

## About

Binky is a native macOS app that watches your inbox (defaults to `~/Downloads`), waits for files to finish landing, and sorts them into sensible folders like Images, PDFs, Media, Documents, Archives, Apps, Screenshots, and Misc.

Unknowns go to Review so nothing silently disappears, and Binky includes optional Finder tags plus a batch history with reveal and undo where macOS allows.

<figure class="pfig">
  <img src="/assets/images/projects/binky-1.webp" alt="Binky main window with Quick Sort for Downloads, Sort Now, and routines listed in the sidebar" loading="lazy" decoding="async" />
  <figcaption>Quick Sort for the folder in front of you — routines keep watching in the background.</figcaption>
</figure>

## Routing & routines

Routing decides where files go; routines decide when. Templates cover the common jobs—Downloads, Desktop, DMGs, archives, Finder tags—so you’re not starting from a blank rule every time.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/binky-2.webp" alt="Binky New routing sheet with options for website, file kind, name, Finder tag, disk images, and archives" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/binky-3.webp" alt="Binky Routines settings with Sort my Downloads selected and the Templates menu open" loading="lazy" decoding="async" />
  <figcaption>Pick a routing shape · start from a routine template when the job is familiar.</figcaption>
</figure>

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>Swift</summary>
    <p>Native macOS app in <a href="https://github.com/heyderekj/binky">the repo</a>.</p>
  </details>
  <details class="pacc-item">
    <summary>Product + website</summary>
    <p>Positioning, UX, and release flow on <a href="https://binkyfiles.com/">binkyfiles.com</a>, with distribution via GitHub Releases and Homebrew (<code>brew install --cask binky</code>).</p>
  </details>
</div>
