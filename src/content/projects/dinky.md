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
hero: /assets/images/projects/dinky-hero.webp
featured: true
order: 3
status: paused
burnerLevel: Back Burner
---

## The itch

The compressor I'd used for years kept crashing, so I built the tool I actually wanted: drag files onto the window, the Dock, or a watched folder—smaller copies land where you expect. Images, videos, and PDFs, with honest format choices (WebP, AVIF, HEIC, lossless PNG for stills; MP4 presets for video; flatten-or-preserve for PDFs). Free and open source.

## Honest by design

Compression tools love magic numbers. Dinky shows its work instead: the before/after slider is proof over promises—drag it and compare the 3.82 MB original with the 0.07 MB copy yourself. Presets say exactly what you're trading, results show the savings per file, and every single file gets an Undo. Watch folders take it hands-off: drop files in, Dinky handles them without the app open in front of you.

<figure class="pfig">
  <img src="/assets/images/projects/dinky-watch-f.webp" alt="Dinky's watch folder settings — a global watched folder plus per-preset folders, compressing anything added automatically" loading="lazy" decoding="async" />
  <figcaption>Watch folders — the app keeps working when you're not looking at it.</figcaption>
</figure>

## Personality in the details

The copy is where Dinky smiles. Finish a batch and the summary reads "Big in. Dinky out."—nine files, 193.6 MB saved, "about what you'd expect for a feature-length SD rip." Mid-run, the status bar says "Working through the pile." Utilities don't have to sound like utilities.

<figure class="pfig pfig--pair">
  <img src="/assets/images/projects/dinky-summary-f.webp" alt="Dinky's completion summary reading Big in. Dinky out. — 9 files compressed, 193.6 MB saved, with per-file results and Undo buttons" loading="lazy" decoding="async" />
  <img src="/assets/images/projects/dinky-queue-f.webp" alt="Dinky's queue processing nine JPGs to WebP with per-file progress and a Working through the pile status" loading="lazy" decoding="async" />
  <figcaption>"Big in. Dinky out." and "Working through the pile" — the receipts, narrated like a person.</figcaption>
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
