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
