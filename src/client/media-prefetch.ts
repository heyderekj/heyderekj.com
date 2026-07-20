/**
 * Warm case-study / project media before it enters the viewport.
 * - `[data-prefetch-images]` lists URLs (JSON array) to fetch early
 * - Lazy `<img>`s in main get promoted ~1 viewport ahead via IO
 * - Thumb hover / focus warms the stage swap target
 */

const warmed = new Set<string>();

function warmImage(src: string | null | undefined) {
  if (!src || warmed.has(src) || src.startsWith('data:')) return;
  warmed.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

function parsePrefetchList(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string' && v.length > 0);
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

function warmContainer(el: Element) {
  const listed = parsePrefetchList((el as HTMLElement).dataset.prefetchImages);
  listed.forEach(warmImage);
  el.querySelectorAll<HTMLImageElement>('img[src]').forEach((img) => warmImage(img.currentSrc || img.src));
  el.querySelectorAll<HTMLElement>('[data-src]').forEach((node) => warmImage(node.dataset.src));
  el.querySelectorAll<HTMLVideoElement>('video[poster]').forEach((v) => warmImage(v.poster));
}

/** Promote a lazy image so the browser starts the real fetch soon. */
function promoteLazyImg(img: HTMLImageElement) {
  if (img.loading === 'lazy') img.loading = 'eager';
  warmImage(img.currentSrc || img.src);
}

function bindThumbWarm(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-stage-thumb][data-src]').forEach((thumb) => {
    if (thumb.dataset.prefetchBound === '1') return;
    thumb.dataset.prefetchBound = '1';
    const warm = () => warmImage(thumb.dataset.src);
    thumb.addEventListener('pointerenter', warm, { passive: true });
    thumb.addEventListener('focus', warm);
  });
}

function initMediaPrefetch() {
  // Case-study / stepper bundles: warm listed URLs once the block is ~1vh away.
  if (typeof IntersectionObserver !== 'undefined') {
    const ahead = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          warmContainer(entry.target);
          ahead.unobserve(entry.target);
        }
      },
      { rootMargin: '100% 0px', threshold: 0 },
    );

    document.querySelectorAll('[data-prefetch-images]').forEach((el) => ahead.observe(el));

    // Body / device / remaining lazy imgs: start fetch a viewport before they show.
    const lazyImgs = document.querySelectorAll<HTMLImageElement>(
      'main.main img[loading="lazy"]',
    );
    if (lazyImgs.length > 0) {
      const lazyAhead = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting || !(entry.target instanceof HTMLImageElement)) continue;
            promoteLazyImg(entry.target);
            lazyAhead.unobserve(entry.target);
          }
        },
        { rootMargin: '120% 0px', threshold: 0 },
      );
      lazyImgs.forEach((img) => lazyAhead.observe(img));
    }
  }

  // Above-the-fold bundles: don’t wait for IO — warm on idle after first paint.
  idle(() => {
    document.querySelectorAll('[data-prefetch-images][data-prefetch-idle]').forEach(warmContainer);
  });

  bindThumbWarm();
}

initMediaPrefetch();
document.addEventListener('astro:page-load', initMediaPrefetch);
