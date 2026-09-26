/**
 * Warm case-study / project media before it enters the viewport.
 * - `[data-prefetch-images]` lists variants (JSON: string | {src, srcset, sizes});
 *   the first few warm once the block is ~1 viewport away
 * - `[data-prefetch-idle]` bundles warm their first couple of items on idle
 * - Thumb hover / focus warms the stage swap target
 *
 * Variants carry the same srcset/sizes as the real `<img>`, so the browser
 * warms the exact file it will later pick — not the multi-MB original.
 * Native `loading="lazy"` handles everything else.
 */

interface Variant {
  src: string;
  srcset?: string;
  sizes?: string;
}

/** Idle: the next slide or two. Near the viewport: a few more. Thumb hover covers the rest. */
const IDLE_WARM_COUNT = 2;
const AHEAD_WARM_COUNT = 4;
const warmed = new Set<string>();

function warmImage(v: Variant | null | undefined) {
  if (!v?.src || v.src.startsWith('data:')) return;
  const key = v.srcset ?? v.src;
  if (warmed.has(key)) return;
  warmed.add(key);
  const img = new Image();
  img.decoding = 'async';
  if (v.srcset) {
    img.sizes = v.sizes ?? '100vw';
    img.srcset = v.srcset;
  }
  img.src = v.src;
}

function parsePrefetchList(raw: string | undefined): Variant[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v): Variant | null =>
        typeof v === 'string'
          ? { src: v }
          : v && typeof v === 'object' && typeof (v as Variant).src === 'string'
            ? (v as Variant)
            : null,
      )
      .filter((v): v is Variant => v !== null && v.src.length > 0);
  } catch {
    return [];
  }
}

function idle(fn: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: 1500 });
  } else {
    window.setTimeout(fn, 200);
  }
}

function warmContainer(el: Element, limit: number) {
  parsePrefetchList((el as HTMLElement).dataset.prefetchImages).slice(0, limit).forEach(warmImage);
}

function bindThumbWarm(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-stage-thumb][data-src]').forEach((thumb) => {
    if (thumb.dataset.prefetchBound === '1') return;
    thumb.dataset.prefetchBound = '1';
    const warm = () =>
      warmImage({ src: thumb.dataset.src!, srcset: thumb.dataset.srcset, sizes: thumb.dataset.sizes });
    thumb.addEventListener('pointerenter', warm, { passive: true });
    thumb.addEventListener('focus', warm);
  });
}

function initMediaPrefetch() {
  // Case-study / stepper bundles: warm listed variants once the block is ~1vh away.
  if (typeof IntersectionObserver !== 'undefined') {
    const ahead = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          warmContainer(entry.target, AHEAD_WARM_COUNT);
          ahead.unobserve(entry.target);
        }
      },
      { rootMargin: '100% 0px', threshold: 0 },
    );

    document.querySelectorAll('[data-prefetch-images]').forEach((el) => ahead.observe(el));
  }

  // Above-the-fold bundles: warm just the next slide or two on idle after first paint.
  idle(() => {
    document
      .querySelectorAll('[data-prefetch-images][data-prefetch-idle]')
      .forEach((el) => warmContainer(el, IDLE_WARM_COUNT));
  });

  bindThumbWarm();
}

initMediaPrefetch();
document.addEventListener('astro:page-load', initMediaPrefetch);
