/**
 * Prebuild: make sure git history is deep enough for post revision numbers
 * (src/lib/revisions.ts). CI clones are sometimes shallow; unshallow them.
 * Never fails the build — revisions.ts falls back gracefully without history.
 */
import { execFileSync } from 'node:child_process';

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

try {
  const shallow = git(['rev-parse', '--is-shallow-repository']) === 'true';
  if (shallow) {
    console.log('[revisions] shallow clone detected; fetching full history…');
    git(['fetch', '--unshallow', '--quiet'], { timeout: 60_000 });
    console.log('[revisions] history unshallowed');
  } else {
    console.log('[revisions] full git history available');
  }
} catch (err) {
  console.warn(`[revisions] could not verify git history (${err.message.split('\n')[0]}); revision lists will fall back`);
}
