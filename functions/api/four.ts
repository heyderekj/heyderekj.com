/**
 * The 404 game's record for each pet, across everyone who plays (client/four.ts).
 *   GET  /api/four  → { stats: { Lilo: { wins, losses, draws }, … } }, cached a minute at the edge
 *   POST /api/four  { pet, result: 'you' | 'them' | 'draw', moves }  → adds one game
 * `result` is from the player's side: 'you' means the player won (a loss for the pet).
 * Stored in D1 (binding DB, or HIRE_DB if that's the one bound; table from migrations/0002_four.sql).
 * Without a database it answers 404 and the game just doesn't show records.
 */
interface D1 { prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<unknown>; all<T>(): Promise<{ results: T[] }> }; all<T>(): Promise<{ results: T[] }> } }
interface Env { DB?: D1; HIRE_DB?: D1 }

const PETS = ['Lilo', 'Leroy', 'Kiya', 'Irma'];
const json = (status: number, body: object, maxAge = 0) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...(maxAge ? { 'Cache-Control': `public, max-age=${maxAge}` } : { 'Cache-Control': 'no-store' }) },
});

export async function onRequestGet({ env }: { env: Env }) {
  const db = env.DB ?? env.HIRE_DB;
  if (!db) return json(404, { error: 'not set up' });
  try {
    const { results } = await db.prepare('SELECT pet, wins, losses, draws FROM pet_stats').all<{ pet: string; wins: number; losses: number; draws: number }>();
    return json(200, { stats: Object.fromEntries(results.map(({ pet, ...r }) => [pet, r])) }, 60);
  } catch { return json(502, { error: 'could not read' }); }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const db = env.DB ?? env.HIRE_DB;
  if (!db) return json(404, { error: 'not set up' });
  let data: { pet?: unknown; result?: unknown; moves?: unknown };
  try { data = await request.json(); } catch { return json(400, { error: 'bad request' }); }
  const pet = PETS.find((p) => p === data.pet), result = data.result, moves = Number(data.moves);
  // A real game: a known pet, a known result, and a plausible number of moves (a win takes at least 7)
  if (!pet || !['you', 'them', 'draw'].includes(result as string) || !(moves >= 7 && moves <= 42)) return json(400, { error: 'not a game' });
  // One game per player every few seconds
  const ip = request.headers.get('cf-connecting-ip') ?? '', cache = (caches as unknown as { default: Cache }).default;
  const key = new Request(`https://four.throttle/${encodeURIComponent(ip)}`);
  if (ip && (await cache.match(key))) return json(429, { error: 'slow down' });
  if (ip) await cache.put(key, new Response('1', { headers: { 'Cache-Control': 'max-age=5' } }));
  const col = result === 'you' ? 'losses' : result === 'them' ? 'wins' : 'draws';
  try {
    await db.prepare(`INSERT INTO pet_stats (pet, ${col}) VALUES (?, 1) ON CONFLICT(pet) DO UPDATE SET ${col} = ${col} + 1`).bind(pet).run();
    return json(200, { ok: true });
  } catch { return json(502, { error: 'could not save' }); }
}
