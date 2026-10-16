/**
 * GET /api/availability: when I'm free, from my projects in Notion. Takes every project whose date
 * runs today or later and is booked (not done, and not still a lead), finds the latest end, and adds a
 * buffer (a week by default).
 * Answers { from: 'now' } or { from: 'YYYY-MM-DD' }; client/availability.ts puts it on the page.
 * Cached for an hour so Notion isn't asked on every visit. Without a token it answers 404 and the page
 * keeps the date written in src/data/hire.ts.
 *
 * Settings (Cloudflare Pages → Settings → Variables and secrets; README.md):
 *   NOTION_TOKEN          the secret (an integration's, or a personal access token)
 *   NOTION_PROJECTS_DB    the projects database, or a page holding it (default: my Projects & Tasks page,
 *                         where it's the database called "Projects")
 *   NOTION_DATE_PROP      the date property with each project's start → end (default "Dates"; failing
 *                         that, the first date property)
 *   NOTION_STATUS_PROP    the status or select property (default "Status"; failing that, the first one)
 *   NOTION_NOT_BOOKED     statuses that don't count, comma-separated (default: done, cancelled and the
 *                         like, plus my board's leads, "Shaping" and "Proposal Sent")
 *   AVAILABILITY_BUFFER_DAYS  days between finishing one project and starting the next (default 7)
 */
interface Env {
  NOTION_TOKEN?: string; NOTION_PROJECTS_DB?: string; NOTION_DATE_PROP?: string; NOTION_STATUS_PROP?: string;
  NOTION_NOT_BOOKED?: string; NOTION_DONE?: string; AVAILABILITY_BUFFER_DAYS?: string;
}
type Prop = { type: string; date?: { start: string; end: string | null } | null; status?: { name: string } | null; select?: { name: string } | null };
type Page = { properties: Record<string, Prop> };

/** My "Projects & Tasks" page in Notion; the projects database lives inside it */
const PROJECTS_PAGE = 'da02560483d74b17af0a78cd4edc7765';
const NOT_BOOKED = 'Done,Complete,Completed,Cancelled,Canceled,Archived,Paused,Shaping,Proposal Sent';
const API = 'https://api.notion.com/v1';

const json = (status: number, body: object, maxAge = 0) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...(maxAge ? { 'Cache-Control': `public, max-age=${maxAge}` } : {}) },
});
const day = (d: Date) => d.toISOString().slice(0, 10);

/** A property by name, or else the first of that type (so a renamed column still works) */
const prop = (p: Page, name: string, types: string[]) =>
  (types.includes(p.properties[name]?.type) ? p.properties[name] : Object.values(p.properties).find((x) => types.includes(x.type)));

/** The latest end date among booked projects (a project without an end counts its start; one that's run over, today) */
export function latestEnd(results: Page[], dateProp: string, statusProp: string, notBooked: string[], today = '') {
  let latest = '', count = 0;
  for (const p of results) {
    const d = prop(p, dateProp, ['date'])?.date, status = prop(p, statusProp, ['status', 'select']);
    const name = (status?.status?.name ?? status?.select?.name ?? '').toLowerCase();
    if (!d?.start || notBooked.includes(name)) continue;
    // Still booked past its date (running over) means busy now, so it counts as ending today
    const end = [(d.end ?? d.start).slice(0, 10), today].sort()[1];
    count++; if (end > latest) latest = end;
  }
  return { latest, count };
}

/** The id to query: the database itself, or the "Projects" database inside a page */
async function databaseOf(id: string, headers: Record<string, string>): Promise<string | null> {
  if ((await fetch(`${API}/databases/${id}`, { headers })).ok) return id;
  const r = await fetch(`${API}/blocks/${id}/children?page_size=100`, { headers });
  if (!r.ok) return null;
  const blocks = ((await r.json()) as { results: { id: string; type: string; child_database?: { title: string } }[] }).results.filter((b) => b.type === 'child_database');
  return (blocks.find((b) => /^projects$/i.test(b.child_database?.title.trim() ?? '')) ?? blocks[0])?.id ?? null;
}
/** Free the day after the buffer; 'now' if that's already past */
export function freeFrom(latest: string, buffer: number, today: string): string {
  if (!latest) return 'now';
  const free = new Date(`${latest}T00:00:00Z`); free.setUTCDate(free.getUTCDate() + buffer);
  return day(free) > today ? day(free) : 'now';
}

export async function onRequestGet({ request, env, waitUntil }: { request: Request; env: Env; waitUntil(p: Promise<unknown>): void }) {
  if (!env.NOTION_TOKEN) return json(404, { error: 'not set up' });
  const cache = (caches as unknown as { default: Cache }).default, key = new Request(new URL('/api/availability', request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const dateProp = env.NOTION_DATE_PROP || 'Dates', statusProp = env.NOTION_STATUS_PROP || 'Status';
  const notBooked = (env.NOTION_NOT_BOOKED || env.NOTION_DONE || NOT_BOOKED).split(',').map((s) => s.trim().toLowerCase());
  const buffer = Number(env.AVAILABILITY_BUFFER_DAYS ?? 7) || 0;
  const today = day(new Date());

  // Every project, a hundred at a time (newest edits first); the date and status are checked here, so a
  // renamed column doesn't break the query
  const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
  let latest = '', cursor: string | undefined, n = 0;
  try {
    const db = await databaseOf((env.NOTION_PROJECTS_DB || PROJECTS_PAGE).replace(/-/g, ''), headers);
    if (!db) return json(502, { error: 'no projects database found' });
    for (let page = 0; page < 5; page++) {
      const r = await fetch(`${API}/databases/${db}/query`, {
        method: 'POST', headers,
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}), sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }] }),
      });
      if (!r.ok) return json(502, { error: `notion ${r.status}` });
      const data = await r.json() as { results: Page[]; has_more: boolean; next_cursor: string | null };
      const found = latestEnd(data.results, dateProp, statusProp, notBooked, today);
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
