/**
 * Library helpers — kinds, ordering, codes, and links for `/library/`.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type LibraryItem = CollectionEntry<'library'>;
export type LibraryKind = LibraryItem['data']['kind'];

export interface KindMeta {
  one: string;
  many: string;
  /** Route segment under /library/. */
  path: string;
  /** Mono prefix for item codes (BK-003). */
  code: string;
  icon: string;
  intro: string;
}

/** Display order on /library/. */
export const KIND_META: Record<LibraryKind, KindMeta> = {
  interest: {
    one: 'Interest',
    many: 'Interests',
    path: 'interests',
    code: 'IN',
    icon: 'ph-sparkle',
    intro: 'Things I’m into outside of work.',
  },
  book: {
    one: 'Book',
    many: 'Books',
    path: 'books',
    code: 'BK',
    icon: 'ph-book-open',
    intro: 'Books I’ve read, am reading, or want to.',
  },
  podcast: {
    one: 'Podcast',
    many: 'Podcasts',
    path: 'podcasts',
    code: 'PC',
    icon: 'ph-microphone',
    intro: 'Shows in my ears.',
  },
  bookmark: {
    one: 'Bookmark',
    many: 'Bookmarks',
    path: 'bookmarks',
    code: 'BM',
    icon: 'ph-bookmark-simple',
    intro: 'Pages worth keeping.',
  },
  post: {
    one: 'Saved post',
    many: 'Saved posts',
    path: 'posts',
    code: 'XP',
    icon: 'ph-x-logo',
    intro: 'Posts on X I keep coming back to.',
  },
  tool: {
    one: 'Tool',
    many: 'Tools',
    path: 'tools',
    code: 'TL',
    icon: 'ph-wrench',
    intro: 'What I use to design, build, write, and ship.',
  },
};

export const KINDS = Object.keys(KIND_META) as LibraryKind[];

/** Interest icons by group, falling back to the kind icon. */
const GROUP_ICONS: Record<string, string> = {
  legos: 'ph-cube',
  lego: 'ph-cube',
  tesla: 'ph-lightning',
  f1: 'ph-flag-checkered',
  'formula 1': 'ph-flag-checkered',
  drums: 'ph-music-notes',
  streaming: 'ph-game-controller',
  sitcoms: 'ph-television',
};

export function itemIcon(item: LibraryItem): string {
  const g = item.data.group?.toLowerCase();
  return (g && GROUP_ICONS[g]) || KIND_META[item.data.kind].icon;
}

/** Items (drafts included in dev only): order, then newest, then title. */
export async function getLibrary(): Promise<LibraryItem[]> {
  const items = await getCollection('library', ({ data }) => import.meta.env.DEV || !data.draft);
  return items.sort(
    (a, b) =>
      a.data.order - b.data.order ||
      (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0) ||
      a.data.title.localeCompare(b.data.title),
  );
}

export function byKind(items: LibraryItem[], kind: LibraryKind): LibraryItem[] {
  return items.filter((i) => i.data.kind === kind);
}

/**
 * Stable-ish catalog codes: numbered by date added (then `order`) within a kind,
 * so new saves get the next number. Returns a map of entry id → "BK-003".
 */
export function itemCodes(items: LibraryItem[]): Map<string, string> {
  const codes = new Map<string, string>();
  for (const kind of KINDS) {
    byKind(items, kind)
      .slice()
      .sort(
        (a, b) =>
          (a.data.date?.valueOf() ?? 0) - (b.data.date?.valueOf() ?? 0) ||
          a.data.order - b.data.order ||
          a.id.localeCompare(b.id),
      )
      .forEach((item, i) => codes.set(item.id, `${KIND_META[kind].code}-${String(i + 1).padStart(3, '0')}`));
  }
  return codes;
}

export function hasPage(item: LibraryItem): boolean {
  return item.body.trim().length > 0;
}

export function itemPage(item: LibraryItem): string {
  return `/library/${item.slug}/`;
}

/** Card link: own page when there are notes, otherwise the source. */
export function itemHref(item: LibraryItem): string | undefined {
  return hasPage(item) ? itemPage(item) : item.data.url;
}

export function kindHref(kind: LibraryKind): string {
  return `/library/${KIND_META[kind].path}/`;
}

export function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
