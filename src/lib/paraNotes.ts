/**
 * Which paragraphs of a post were revised, and what they said before, read from git at build time.
 * Walks every commit to the file, oldest first. A counted revision (a `Rev:` commit, see
 * lib/revisions.ts) stamps the paragraphs it changed or added with its date and keeps their earlier
 * wording; minor edits just carry existing notes along. The essay shows these as margin notes
 * (client/rev-notes.ts). Never fails the build: without history there are simply no notes.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export interface ParaNote {
  /** The paragraph's text, normalised and cut short, so the page can find it again. */
  key: string;
  /** When it was revised (ISO date). */
  date: string;
  /** What it said before, or null when the paragraph was added. */
  before: string | null;
}

/** Plain words only: how a paragraph is matched across versions and against the rendered page. */
export const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const keyOf = (s: string) => normalize(s).slice(0, 80);

/** Prose paragraphs of an MDX file, as readable text (no components, headings, lists or comments). */
export function paragraphs(src: string): string[] {
  const body = src.replace(/^---[\s\S]*?\n---\n/, '');
  return body.split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b && !/^(<|#|\{|-\s|\*\s|\d+\.\s|>|import\s|export\s|```|\|)/.test(b))
    .map((b) => b
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/(\*\*|__|\*|_|`)/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter((b) => normalize(b).length > 20);
}

const words = (s: string) => new Set(normalize(s).split(' ').filter((w) => w.length > 2));
function similarity(a: string, b: string): number {
  const A = words(a), B = words(b);
  let both = 0; A.forEach((w) => { if (B.has(w)) both++; });
  return both / Math.max(1, A.size + B.size - both);
}

type Version = { text: string; major: boolean; date: Date };

/** Pure part, so it can be tested: versions oldest first, the first being as published. */
export function notesFor(versions: Version[]): ParaNote[] {
  if (!versions.length) return [];
  let prev = paragraphs(versions[0].text);
  let notes = new Map<string, { date: string; before: string | null }>();
  for (const v of versions.slice(1)) {
    const next = paragraphs(v.text);
    const exact = new Map(prev.map((p) => [normalize(p), p]));
    const carried = new Map<string, { date: string; before: string | null }>();
    for (const p of next) {
      if (exact.has(normalize(p))) { const n = notes.get(normalize(p)); if (n) carried.set(normalize(p), n); continue; }
      let best = '', score = 0;
      for (const q of prev) { const s = similarity(p, q); if (s > score) { score = s; best = q; } }
      const old = score >= 0.35 ? notes.get(normalize(best)) : undefined;
      if (v.major) carried.set(normalize(p), { date: v.date.toISOString().slice(0, 10), before: score >= 0.35 ? (old?.before ?? best) : null });
      else if (old) carried.set(normalize(p), old);
    }
    notes = carried; prev = next;
  }
  return [...notes].map(([text, n]) => ({ key: text.slice(0, 80), ...n }));
}

/** Notes for a post file, from its git history. Major commits are the counted revisions' SHAs. */
export function paraNotesFor(file: string, published: Date, majorShas: string[]): ParaNote[] {
  try {
    const log = execFileSync('git', ['log', '--reverse', '--format=%H%x1f%aI', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .trim().split('\n').filter(Boolean).map((l) => { const [sha, iso] = l.split('\x1f'); return { sha, date: new Date(iso) }; });
    if (!log.length) return [];
    const show = (sha: string) => { try { return execFileSync('git', ['show', `${sha}:${file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 24 }); } catch { return null; } };
    const versions: Version[] = [];
    for (const c of log) {
      const text = show(c.sha); if (text == null) continue;
      versions.push({ text, major: c.date > published && majorShas.some((s) => s.startsWith(c.sha) || c.sha.startsWith(s)), date: c.date });
    }
    try { versions.push({ text: fs.readFileSync(file, 'utf8'), major: false, date: new Date() }); } catch { /* committed copy is current */ }
    return notesFor(versions);
  } catch {
    return [];
  }
}
