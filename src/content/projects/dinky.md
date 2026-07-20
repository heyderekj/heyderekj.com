---
name: Dinky
tagline: Smaller images, videos, and PDFs on macOS.
summary: A tiny macOS app that shrinks images, videos, and PDFs. Drag files in, compressed copies land where you expect—free, open source, and honest about format tradeoffs.
url: https://dinkyfiles.com
year: 2026
started: 2026-04-01
role: Designer & builder
stack: [Swift]
image: /assets/images/projects/dinky-1.png
hero: /assets/images/projects/dinky-3.webp
featured: true
order: 3
status: paused
burnerLevel: Back Burner
media:
  - type: video
    src: /assets/images/projects/dinky-demo.mp4
    poster: /assets/images/projects/dinky-demo-poster.webp
    caption: Drop files in — watch them shrink, then undo any file you want.
  - type: image
    src: /assets/images/projects/dinky-4.webp
    alt: Dinky Quality panel with Photo, Graphic, and Mixed image modes plus PDF, video, and audio quality choices
    caption: Quality that says what you're trading — Photo vs Graphic, Balanced vs High, Max width when you need it.
---

## The itch

The compressor I'd used for years kept crashing, so I built the tool I actually wanted: drag files onto the window, the Dock, or a watched folder—smaller copies land where you expect. Images, videos, and PDFs, with honest format choices (WebP, AVIF, HEIC, lossless PNG for stills; MP4 presets for video; flatten-or-preserve for PDFs). Free and open source.

## Honest by design

Compression tools love magic numbers. Dinky shows its work instead: format and quality choices that mean something, presets that say exactly what you're trading, and results you can undo file by file. Watch folders take it hands-off: drop files in, Dinky handles them without the app open in front of you.

## Casual and pro

The goal was to feel friendly for someone who just wants smaller files—and deep enough for someone who lives in presets. A “Websites” preset can lock WebP, max width, and H.264 in one place; the sidebar can stay simple or show every media type. Same app, two tempos.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/dinky-5.webp" alt="Dinky Presets settings editing a Websites preset with Smart quality, media types, and format options" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/dinky-6.webp" alt="Dinky Sidebar settings with toggles for showing Images, Audio, Videos, and PDFs in the sidebar" loading="lazy" decoding="async" />
  <figcaption>Presets for the workflow you repeat · a sidebar you can keep simple or fully loaded.</figcaption>
</figure>

## Traction

I shipped it, shared it, and let real use decide what it became. The [GitHub repo](https://github.com/heyderekj/dinky) grew past 400 stars; people wanted it via Homebrew, so it installs with `brew install --cask dinky`; PRs and user replies steered it from an image compressor into a full file-compression app. It's calmly on the back burner now—stable, useful, and done being urgent.

## Tools & process

<div class="pacc">
  <details class="pacc-item" open>
    <summary>Swift</summary>
    <p>Native macOS app (primary codebase per <a href="https://github.com/heyderekj/dinky">the repo</a>); <a href="https://dinkyfiles.com/">dinkyfiles.com</a> marketing and comparisons are HTML/CSS, with Python for small automation in the project.</p>
  </details>
  <details class="pacc-item">
    <summary>Design &amp; shipping</summary>
    <p>Product UX, copy, and release flow; distribution via GitHub Releases and Homebrew (<code>brew install --cask dinky</code>).</p>
  </details>
</div>
