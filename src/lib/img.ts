/**
 * Responsive image URLs via Cloudflare Image Transformations.
 *
 * Source files stay in `public/`; with `IMAGE_CDN=cloudflare` (set on the Pages
 * production build) local paths are rewritten to
 * `/cdn-cgi/image/width=…,format=auto/…` with a srcset so the browser fetches a
 * variant sized for its slot (AVIF/WebP negotiated from the Accept header).
 * Needs Image Transformations enabled on the zone; not available on *.pages.dev.
 * Without the CDN, it points at the nearest WebP copy built by scripts/image-variants.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import sizeOf from 'image-size';

const CDN = process.env.IMAGE_CDN === 'cloudflare';

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

/** Built-time WebP copies (scripts/image-variants.mjs): public/_v/<path>-<width>.webp */
const VARIANTS = [480, 960, 1600];
const variantCache = new Map<string, string>();
function variantOf(p: string, w: number): string {
  const key = `${p}@${w}`;
  if (variantCache.has(key)) return variantCache.get(key)!;
  const want = VARIANTS.find((v) => v >= w);
  let out = p;
  if (want) {
    const rel = `/_v${decodeURI(p).replace(/\.[^.]+$/, '')}-${want}.webp`;
    if (fs.existsSync(path.join(process.cwd(), 'public', rel))) out = encodeURI(rel);
  }
  variantCache.set(key, out);
  return out;
}

/** Single sized URL: the CDN's when it's on, else the nearest built WebP copy, else the raw path. */
export function imgSrc(p: string, w: number): string {
  if (!isTransformable(p)) return p;
  if (!CDN) return variantOf(p, w);
  const max = imgDims(p)?.width;
  const width = max ? Math.min(w, max) : w;
  return `/cdn-cgi/image/width=${width},format=auto,quality=80${p}`;
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
