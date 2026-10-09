/**
 * Rehype plugin: give local markdown images a CDN srcset + intrinsic size.
 *
 * Handles both markdown `![]()` images (hast elements) and raw HTML `<img>`
 * inside `.md` bodies (e.g. project `.pfig` figures), which Astro keeps as
 * `raw` nodes. No-op locally — `imgAttrs` returns the plain path without the image CDN.
 */
import { imgAttrs } from './img';

/** Body images sit in the 530px rail; zoom.ts widens `sizes` while expanded. */
const BODY_SIZES = '(max-width: 560px) 100vw, 530px';

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function escAttr(v: string) {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function rewriteRawImg(tag: string): string {
  const src = tag.match(/\ssrc\s*=\s*"([^"]+)"/i)?.[1];
  if (!src || !src.startsWith('/') || /\ssrcset\s*=/i.test(tag)) return tag;
  const a = imgAttrs(src, { sizes: BODY_SIZES });
  let out = tag.replace(/\ssrc\s*=\s*"[^"]+"/i, ` src="${escAttr(a.src)}"`);
  const extra: string[] = [];
  if (a.srcset) extra.push(`srcset="${escAttr(a.srcset)}"`, `sizes="${escAttr(a.sizes!)}"`);
  if (a.width && !/\swidth\s*=/i.test(tag)) extra.push(`width="${a.width}"`, `height="${a.height}"`);
  if (!/\sloading\s*=/i.test(tag)) extra.push('loading="lazy"');
  if (!/\sdecoding\s*=/i.test(tag)) extra.push('decoding="async"');
  if (extra.length === 0 && out === tag) return tag;
  out = out.replace(/\s*(\/?)>$/, (_m, slash) => ` ${extra.join(' ')}${slash ? ' /' : ''}>`);
  return out;
}

function walk(node: HastNode) {
  if (node.type === 'element' && node.tagName === 'img' && node.properties) {
    const src = node.properties.src;
    if (typeof src === 'string' && src.startsWith('/') && !node.properties.srcSet) {
      const a = imgAttrs(src, { sizes: BODY_SIZES });
      node.properties.src = a.src;
      if (a.srcset) {
        node.properties.srcSet = a.srcset;
        node.properties.sizes = a.sizes;
      }
      if (a.width && node.properties.width === undefined) {
        node.properties.width = a.width;
        node.properties.height = a.height;
      }
      node.properties.loading ??= 'lazy';
      node.properties.decoding ??= 'async';
    }
  } else if (node.type === 'raw' && typeof node.value === 'string' && node.value.includes('<img')) {
    node.value = node.value.replace(/<img\b[^>]*>/gi, rewriteRawImg);
  }
  node.children?.forEach(walk);
}

export default function rehypeImgCdn() {
  return (tree: HastNode) => walk(tree);
}
