/**
 * GET /api/availability: when I'm free, from my projects in Notion. Takes every project whose date
 * runs today or later and isn't done, finds the latest end, and adds a buffer (a week by default).
 * Answers { from: 'now' } or { from: 'YYYY-MM-DD' }; client/availability.ts puts it on the page.
 * Cached for an hour so Notion isn't asked on every visit. Without the settings below it answers 404
 * and the page keeps the date written in src/data/hire.ts.
 *
 * Settings (Cloudflare Pages → Settings → Variables and secrets; README.md):
 *   NOTION_TOKEN          an internal integration's secret, shared with the projects database
 *   NOTION_PROJECTS_DB    the database id (from its URL)
 *   NOTION_DATE_PROP      the date property with each project's start → end (default "Dates")
 *   NOTION_STATUS_PROP    the status or select property (default "Status")
 *   NOTION_DONE           statuses that don't count, comma-separated (default "Done,Complete,Completed,Cancelled,Canceled,Archived,Paused")
 *   AVAILABILITY_BUFFER_DAYS  days between finishing one project and starting the next (default 7)
 */
interface Env {
  NOTION_TOKEN?: string; NOTION_PROJECTS_DB?: string; NOTION_DATE_PROP?: string; NOTION_STATUS_PROP?: string;
  NOTION_DONE?: string; AVAILABILITY_BUFFER_DAYS?: string;
}
type Prop = { type: string; date?: { start: string; end: string | null } | null; status?: { name: string } | null; select?: { name: string } | null };

const json = (status: number, body: object, maxAge = 0) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...(maxAge ? { 'Cache-Control': `public, max-age=${maxAge}` } : {}) },
});
const day = (d: Date) => d.toISOString().slice(0, 10);

/** The latest end date among projects that aren't done (a project without an end counts its start) */
export function latestEnd(results: { properties: Record<string, Prop> }[], dateProp: string, statusProp: string, done: string[]) {
  let latest = '', count = 0;
  for (const p of results) {
    const status = p.properties[statusProp], d = p.properties[dateProp]?.date;
    const name = (status?.status?.name ?? status?.select?.name ?? '').toLowerCase();
    if (!d || done.includes(name)) continue;
    const end = (d.end ?? d.start).slice(0, 10);
    count++; if (end > latest) latest = end;
  }
  return { latest, count };
}
/** Free the day after the buffer; 'now' if that's already past */
export function freeFrom(latest: string, buffer: number, today: string): string {
  if (!latest) return 'now';
  const free = new Date(`${latest}T00:00:00Z`); free.setUTCDate(free.getUTCDate() + buffer);
  return day(free) > today ? day(free) : 'now';
}

export async function onRequestGet({ request, env, waitUntil }: { request: Request; env: Env; waitUntil(p: Promise<unknown>): void }) {
  if (!env.NOTION_TOKEN || !env.NOTION_PROJECTS_DB) return json(404, { error: 'not set up' });
  const cache = (caches as unknown as { default: Cache }).default, key = new Request(new URL('/api/availability', request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const dateProp = env.NOTION_DATE_PROP || 'Dates', statusProp = env.NOTION_STATUS_PROP || 'Status';
  const done = (env.NOTION_DONE || 'Done,Complete,Completed,Cancelled,Canceled,Archived,Paused').split(',').map((s) => s.trim().toLowerCase());
  const buffer = Number(env.AVAILABILITY_BUFFER_DAYS ?? 7) || 0;
  const today = day(new Date());

  // Every project that's still going (its date reaches today or later), a page of a hundred at a time
  let latest = '', cursor: string | undefined, n = 0;
  try {
    for (let page = 0; page < 5; page++) {
      const r = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_PROJECTS_DB}/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}), filter: { property: dateProp, date: { on_or_after: today } } }),
      });
      if (!r.ok) return json(502, { error: `notion ${r.status}` });
      const data = await r.json() as { results: { properties: Record<string, Prop> }[]; has_more: boolean; next_cursor: string | null };
      const found = latestEnd(data.results, dateProp, statusProp, done);
      n += found.count; if (found.latest > latest) latest = found.latest;
      if (!data.has_more || !data.next_cursor) break;
      cursor = data.next_cursor;
    }
  } catch { return json(502, { error: 'notion unreachable' }); }

  const from = freeFrom(latest, buffer, today);
  const res = json(200, { from, busyUntil: latest || null, projects: n, checked: new Date().toISOString() }, 3600);
  waitUntil(cache.put(key, res.clone()));
  return res;
}
