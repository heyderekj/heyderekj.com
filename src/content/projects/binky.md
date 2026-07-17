---
name: Binky
tagline: Binky sorts your files.
summary: A native macOS app that watches your Downloads folder and quietly sorts incoming files into sensible folders—nothing disappears, unknowns go to Review.
url: https://binkyfiles.com
year: 2026
started: 2026-05-01
role: Designer & builder
stack: [Swift]
image: /assets/images/projects/binky-sorting-2.webp
featured: true
order: 4
status: paused
burnerLevel: Back Burner
---

## About

Binky is a native macOS app that watches your inbox (defaults to `~/Downloads`), waits for files to finish landing, and sorts them into sensible folders like Images, PDFs, Media, Documents, Archives, Apps, Screenshots, and Misc.

Unknowns go to Review so nothing silently disappears, and Binky includes optional Finder tags plus a batch history with reveal and undo where macOS allows.

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
