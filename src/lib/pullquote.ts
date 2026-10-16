/**
 * What an essay shows when its row is hovered on the home page: a picture of the thing
 * it's about (a project or site named in it), or one sentence pulled from inside it.
 * `pullquote` in the post's frontmatter always wins over the automatic pick.
 */
import type { Post } from './posts';

export interface Subject { name: string; img: string; url: string; type: 'project' | 'work' }
export interface Peek { quote: string | null; img: string | null; url: string }

const word = (n: string) => new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');

function prose(body: string): string {
  return body
    .replace(/^import\s.+$/gm, '').replace(/^export\s.+$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/<[A-Z][\s\S]*?\/>/g, '').replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/https?:\S+/g, '')
    .replace(/^#+ .*$/gm, '').replace(/[*_`>]/g, '').replace(/\s+/g, ' ').trim();
}

/** The sentence most likely to stand on its own: mid-length, from the middle, with a point of view. */
function pickSentence(text: string): string | null {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z“"])/);
  let best: string | null = null, bestScore = -1;
  sentences.forEach((raw, n) => {
    const s = raw.trim(), L = s.length;
    if (L < 45 || L > 150 || !/^[A-Z“"]/.test(s) || !/[.!?]["”]?$/.test(s) || (s.match(/\d/g) || []).length > 2) return;
    if ((s.match(/["“”]/g) || []).length % 2) return;
    const pos = n / Math.max(1, sentences.length - 1);
    let score = 1 - Math.abs(L - 85) / 85;
    if (pos > 0.15 && pos < 0.9) score += 0.6;
    if (n === 0) score -= 1;
    if (/\b(I|you|we|my)\b/i.test(s)) score += 0.3;
    if (/\b(is|are|isn't|aren't|means|should|never|always)\b/i.test(s)) score += 0.3;
    if (score > bestScore) { bestScore = score; best = s; }
  });
  return best;
}

export function peekFor(post: Post, subjects: Subject[]): Peek {
  const text = prose(post.body);
  const title = post.data.title ?? '';
  const subject = subjects.find((s) => word(s.name).test(title))
    || subjects.find((s) => s.type === 'project' && (text.match(new RegExp(word(s.name).source, 'gi')) || []).length > 2);
  return { quote: post.data.pullquote ?? pickSentence(text), img: subject?.img ?? null, url: subject?.url ?? '' };
}

export function readingMinutes(post: Post): number {
  return Math.max(1, Math.round(prose(post.body).split(' ').length / 230));
}
