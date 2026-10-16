/**
 * Posts as rows for the writing lists (home, topics, "Keep reading"): title, date, tags, figure count,
 * and what to show in the margin preview (a picture of what it's about, or a sentence from inside).
 */
import { postHref, postTitle, type Post } from './posts';
import { peekFor, readingMinutes, type Peek, type Subject } from './pullquote';
import { getDeck, host, shot, shotsOf } from './deck';
import { figuresIn } from './figures';

export interface PostRow { href: string; title: string; year: number; at: number; date: string; tags: string; figures: number; peek: Peek; mins: number }

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let subjects: Promise<Subject[]> | null = null;

/** Things an essay might be about, with the picture we already have for each. */
function getSubjects(): Promise<Subject[]> {
  return (subjects ??= getDeck().then(({ apps, work }) => [
    ...apps.filter((p) => p.data.image || p.data.icon).map((p) => ({ name: p.data.name, img: shot((p.data.image || p.data.icon)!, 640), url: host(p.data.url), type: 'project' as const })),
    ...work.filter((w) => shotsOf(w).length).map((w) => ({ name: w.data.title.replace(/\.com$/, ''), img: shot(shotsOf(w)[0], 640), url: host(w.data.liveLink), type: 'work' as const })),
  ].filter((s) => s.name.length > 3)));
}

export async function postRows(posts: Post[]): Promise<PostRow[]> {
  const subs = await getSubjects();
  return posts.map((p) => ({
    href: postHref(p), title: postTitle(p), year: p.data.date.getUTCFullYear(), at: p.data.date.valueOf(),
    date: `${MON[p.data.date.getUTCMonth()]} ${p.data.date.getUTCDate()}`,
    tags: p.data.tags.join(' '),
    figures: figuresIn(p.body).length,
    peek: peekFor(p, subs), mins: readingMinutes(p),
  }));
}
