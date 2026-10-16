/**
 * Playable figures (components/post/Fig*.astro) and where they sit, so the home list can badge
 * essays that have them and the bar can jump to each one.
 */
const FIGURES: Record<string, { id: string; title: string }> = {
  FigSidebarDesk: { id: 'fig-desk', title: 'Sidebar to desk' },
  FigSameList: { id: 'fig-twins', title: 'The same list, twice' },
};

export function figuresIn(body: string): { id: string; no: string; title: string }[] {
  return [...body.matchAll(/<(Fig[A-Z]\w*)\b([^>]*)>/g)]
    .filter((m) => FIGURES[m[1]])
    .map((m, i) => ({ ...FIGURES[m[1]], n: Number(m[2].match(/\bn=\{?["']?(\d+)/)?.[1] ?? i + 1) }))
    .sort((a, b) => a.n - b.n)
    .map(({ id, title, n }) => ({ id, title, no: `FIG ${n}` }));
}
