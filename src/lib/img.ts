/**
 * Responsive image URLs via an image CDN.
 *
 * Source files stay in `public/`; on Netlify builds (or `IMAGE_CDN=1`) local
 * paths are rewritten to `/.netlify/images?url=…&w=…`, and with
 * `IMAGE_CDN=cloudflare` to `/cdn-cgi/image/width=…,format=auto/…` (needs Image
 * Transformations enabled on the zone; not available on *.pages.dev). Either way
 * a srcset lets the browser fetch a variant sized for its slot (AVIF/WebP
 * negotiated from the Accept header). Locally the raw path is returned untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import sizeOf from 'image-size';

const CF = process.env.IMAGE_CDN === 'cloudflare';
const CDN = CF || process.env.NETLIFY === 'true' || process.env.IMAGE_CDN === '1';

export const WIDTHS = [320, 480, 640, 960, 1280, 1760];

/** What `<img>` / preload / prefetch need to request the same variant. */
export interface ImgVariant {
  src: string;
  srcset?: string;
  sizes?: string;
}

export interface ImgAttrs extends ImgVariant {
  width?: number;
  height?: number;
}

function isTransformable(p: string | undefined): p is string {
  if (!p || !p.startsWith('/') || p.startsWith('//')) return false;
  return /\.(png|jpe?g|webp|avif)$/i.test(p.split('?')[0]);
}

const dimsCache = new Map<string, { width: number; height: number } | undefined>();

/** Intrinsic size of a `public/` image (memoized); undefined for remote/unknown. */
export function imgDims(p: string): { width: number; height: number } | undefined {
  if (!isTransformable(p)) return undefined;
  if (dimsCache.has(p)) return dimsCache.get(p);
  let dims: { width: number; height: number } | undefined;
  try {
    const file = path.join(process.cwd(), 'public', decodeURI(p));
    if (fs.existsSync(file)) {
      const r = sizeOf(file);
      if (r.width && r.height) dims = { width: r.width, height: r.height };
    }
  } catch {
    dims = undefined;
  }
  dimsCache.set(p, dims);
  return dims;
}

/** Single sized URL (CDN) or the raw path (local / non-raster / remote). */
export function imgSrc(p: string, w: number): string {
  if (!CDN || !isTransformable(p)) return p;
  const max = imgDims(p)?.width;
  const width = max ? Math.min(w, max) : w;
  if (CF) return `/cdn-cgi/image/width=${width},format=auto,quality=80${p}`;
  return `/.netlify/images?url=${encodeURIComponent(p)}&w=${width}`;
}

/** `srcset` across `widths`, capped at the original's width. */
export function imgSrcset(p: string, widths: number[] = WIDTHS): string | undefined {
  if (!CDN || !isTransformable(p)) return undefined;
  const max = imgDims(p)?.width;
  const usable = max ? widths.filter((w) => w < max) : widths;
  if (max && (usable.length === 0 || usable[usable.length - 1] < max)) {
    // Include the original width as the top candidate when it's within range.
    if (max <= widths[widths.length - 1]) usable.push(max);
  }
  if (usable.length === 0) return undefined;
  return usable.map((w) => `${imgSrc(p, w)} ${w}w`).join(', ');
}

/**
 * Attributes to spread on `<img>`: src (fallback width `w`), srcset, sizes,
 * and intrinsic width/height so the browser can reserve space.
 */
export function imgAttrs(
  p: string,
  opts: { sizes: string; widths?: number[]; w?: number; dims?: boolean },
): ImgAttrs {
  const srcset = imgSrcset(p, opts.widths);
  const dims = opts.dims === false ? undefined : imgDims(p);
  return {
    src: imgSrc(p, opts.w ?? 960),
    ...(srcset ? { srcset, sizes: opts.sizes } : {}),
    ...(dims ?? {}),
  };
}

/** Same shape as `imgAttrs` minus dimensions — for preloads and prefetch lists. */
export function imgVariant(p: string, opts: { sizes: string; widths?: number[]; w?: number }): ImgVariant {
  const { src, srcset, sizes } = imgAttrs(p, { ...opts, dims: false });
  return srcset ? { src, srcset, sizes } : { src };
}

/** `1x, 2x` density srcset for fixed-size images (avatars, icons). */
export function imgFixed(p: string, cssWidth: number): ImgVariant {
  if (!CDN || !isTransformable(p)) return { src: p };
  return {
    src: imgSrc(p, cssWidth * 2),
    srcset: `${imgSrc(p, cssWidth)} 1x, ${imgSrc(p, cssWidth * 2)} 2x`,
  };
}
