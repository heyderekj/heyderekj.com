/**
 * Post revision history from git, read at build time.
 *
 * Counting rules (see docs/CONTENT_WORKFLOW.md):
 * - rev 1 is publication (frontmatter `date`)
 * - +1 for each later commit touching the file with a `Rev: <note>` trailer
 * - +1 for each frontmatter `changelog` entry without `commit` (pre-git edits)
 * - a `changelog` entry with `commit` only replaces that commit's note
 * - every other commit is a minor edit: listed, never counted
 *
 * Never fails the build: on a shallow clone or missing git it falls back to
 * the frontmatter changelog and a link to the file's history on GitHub.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import type { Post } from './posts';

const REPO = 'https://github.com/heyderekj/heyderekj.com';
const BRANCH = 'main';

export interface Revision {
  rev: number;
  date: Date;
  note: string;
  sha?: string;
  diffUrl?: string;
  blobUrl?: string;
}

export interface MinorEdit {
  date: Date;
  subject: string;
  sha: string;
  diffUrl: string;
}

export interface RevisionInfo {
  /** Current revision number (1 = as published). */
  rev: number;
  /** Frontmatter `updated`, else the latest counted revision after publication. */
  updated?: Date;
  /** Newest first, including rev 1. */
  revisions: Revision[];
  /** Newest first. */
  minor: MinorEdit[];
  /** Set when git history begins after publication (posts imported into this repo). */
  trackedSince?: Date;
  /** False when git history was unavailable or shallow. */
  complete: boolean;
  historyUrl: string;
}

interface Commit {
  sha: string;
  date: Date;
  subject: string;
  body: string;
}

let shallow: boolean | null = null;
function isShallow(): boolean {
  if (shallow !== null) return shallow;
  try {
    shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() === 'true';
  } catch {
    shallow = true;
  }
  return shallow;
}

function gitLog(file: string): Commit[] | null {
  try {
    const out = execFileSync(
      'git',
      ['log', '--follow', '--format=%H%x1f%aI%x1f%s%x1f%B%x1e', '--', file],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return out
      .split('\x1e')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [sha, iso, subject, body] = chunk.split('\x1f');
        return { sha, date: new Date(iso), subject, body: body ?? '' };
      });
  } catch {
    return null;
  }
}

const diffAnchor = (file: string) => createHash('sha256').update(file).digest('hex');
const revTrailer = (body: string) => body.match(/^Rev:\s*(.+)$/m)?.[1]?.trim();
const sameSha = (a: string, b: string) => a.startsWith(b) || b.startsWith(a);

const memo = new Map<string, RevisionInfo>();

export function getRevisions(post: Post): RevisionInfo {
  const hit = memo.get(post.id);
  if (hit && !import.meta.env.DEV) return hit;

  const file = `src/content/posts/${post.id}`;
  const historyUrl = `${REPO}/commits/${BRANCH}/${file}`;
  const published = post.data.date;
  const changelog = post.data.changelog ?? [];
  const annotations = changelog.filter((c) => c.commit);

  const commits = isShallow() ? null : gitLog(file);
  const complete = commits !== null;

  // Counted revisions after publication, oldest first.
  const counted: Omit<Revision, 'rev'>[] = [];
  const minor: MinorEdit[] = [];

  for (const c of changelog) {
    if (!c.commit) counted.push({ date: c.date, note: c.note });
  }

  for (const c of commits ?? []) {
    const diffUrl = `${REPO}/commit/${c.sha}#diff-${diffAnchor(file)}`;
    const note = annotations.find((a) => sameSha(c.sha, a.commit!))?.note ?? revTrailer(c.body);
    if (note && c.date > published) {
      counted.push({ date: c.date, note, sha: c.sha, diffUrl, blobUrl: `${REPO}/blob/${c.sha}/${file}` });
    } else {
      minor.push({ date: c.date, subject: c.subject, sha: c.sha, diffUrl });
    }
  }

  counted.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  const revisions: Revision[] = [
    { rev: 1, date: published, note: 'Published' },
    ...counted.map((r, i) => ({ ...r, rev: i + 2 })),
  ].reverse();

  const earliest = commits?.length ? commits[commits.length - 1].date : undefined;
  const dayMs = 86_400_000;
  const trackedSince = earliest && earliest.valueOf() - published.valueOf() > dayMs ? earliest : undefined;

  const info: RevisionInfo = {
    rev: revisions[0].rev,
    updated: post.data.updated ?? (counted.length ? counted[counted.length - 1].date : undefined),
    revisions,
    minor: minor.sort((a, b) => b.date.valueOf() - a.date.valueOf()),
    trackedSince,
    complete,
    historyUrl,
  };
  memo.set(post.id, info);
  return info;
}
