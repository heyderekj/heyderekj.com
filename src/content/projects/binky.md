---
name: Binky
tagline: Binky sorts your files.
summary: A native macOS app that watches your Downloads folder and quietly sorts incoming files into sensible folders—nothing disappears, unknowns go to Review.
url: https://binkyfiles.com
year: 2026
started: 2026-05-01
role: Designer & builder
stack: [Swift]
image: /assets/images/projects/binky-v2-sorting.webp
hero: /assets/images/projects/binky-v2-quick.webp
icon: /assets/images/projects/binky-icon-v2.webp
tier: 3
order: 2
status: paused
---

## About

Binky is a native macOS app that watches your inbox (defaults to `~/Downloads`), waits for files to finish landing, and sorts them into sensible folders like Images, PDFs, Media, Documents, Archives, Apps, Screenshots, and Misc.

Unknowns go to Review so nothing silently disappears, and Binky includes optional Finder tags plus a batch history with reveal and undo where macOS allows.

<figure class="pfig">
  <img src="/assets/images/projects/binky-v2-sorting.webp" alt="Binky's Currently sorting sheet with a progress bar and the files being moved, with pause and stop controls" loading="lazy" decoding="async" />
  <figcaption>A sorting run you can watch, pause, or stop—then undo where macOS allows.</figcaption>
</figure>

## Routing & routines

Routing decides where files go; routines decide when. Templates cover the common jobs—Downloads, Desktop, DMGs, archives, Finder tags—so you’re not starting from a blank rule every time.

<figure class="pfig">
  <img src="/assets/images/projects/binky-v2-routines.webp" alt="Binky Routines settings with the Sort my Downloads routine, its name, and when it runs" loading="lazy" decoding="async" />
  <figcaption>Routines for the folders you always sort · each one runs when you say it should.</figcaption>
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
