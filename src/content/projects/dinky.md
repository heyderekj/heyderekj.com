---
name: Dinky
tagline: Smaller images, videos, and PDFs on macOS.
summary: A tiny macOS app that shrinks images, videos, and PDFs. Drag files in, compressed copies land where you expect—free, open source, and honest about format tradeoffs.
url: https://dinkyfiles.com
year: 2026
started: 2026-04-01
role: Designer & builder
stack: [Swift]
image: /assets/images/projects/dinky-og.png
media:
  - src: /assets/images/projects/dinky-before-after.webp
    alt: Dinky's before/after slider comparing a 3.82 MB original against the 0.07 MB compressed copy
    caption: The before/after slider — proof over promises. Drag to compare the 3.82 MB original with the 0.07 MB copy.
  - src: /assets/images/projects/dinky-summary.webp
    alt: Dinky's completion summary reading "Big in. Dinky out." — 9 files compressed, 193.6 MB saved, with per-file results and Undo buttons
    caption: '"Big in. Dinky out." — the summary talks like a person, shows the receipts, and every file gets an Undo.'
  - src: /assets/images/projects/dinky-queue.webp
    alt: Dinky's queue processing nine JPGs to WebP with per-file progress and a "Working through the pile" status
    caption: Batch runs narrate themselves — "Working through the pile," live progress per file, Stop always in reach.
  - src: /assets/images/projects/dinky-drop-active.webp
    alt: Dinky's drop zone lighting up as files are dragged over the window
    caption: The drop zone lights up the moment files enter — the whole window is the target.
  - src: /assets/images/projects/dinky-preset-selected.webp
    alt: Dinky's sidebar with a compression preset selected
    caption: Presets over magic numbers — pick a format, see exactly what you're trading.
  - src: /assets/images/projects/dinky-results.webp
    alt: Dinky's results list showing per-file savings after a batch compression
    caption: Results show the savings per file, so batch runs feel earned.
  - src: /assets/images/projects/dinky-watch-folder.webp
    alt: Dinky's watch folder settings automatically compressing anything added to a folder
    caption: Watch folders — drop files in a folder and Dinky handles them without the app open in front of you.
featured: true
order: 3
status: paused
burnerLevel: Back Burner
---

## About

Dinky is a tiny macOS app that shrinks images, videos, and PDFs. Drag files onto the window, the Dock, or use the file picker—compressed copies land where you expect, with honest format choices (WebP, AVIF, HEIC, lossless PNG for stills; MP4 presets for video; flatten-or-preserve paths for PDFs). It is free and open source.

I care about clarity over magic numbers: presets, before/after preview, batch speed controls, watch folders, clipboard compress (⌘⇧V), URL-to-download-then-compress, Finder Quick Actions, and comparison pages that explain tradeoffs versus tools like ImageOptim, HandBrake, and Acrobat.

## Tools & process

- Swift — native macOS app (primary codebase per [the repo](https://github.com/heyderekj/dinky)); [dinkyfiles.com](https://dinkyfiles.com/) marketing and comparisons are HTML/CSS, with Python for small automation in the project.
- Design & shipping — product UX, copy, and release flow; distribution via GitHub Releases and Homebrew (`brew install --cask dinky`).
