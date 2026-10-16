/**
 * /api/scores: the 404 game's arcade high score table (src/client/four.ts). Anonymous: three
 * initials, a score, the level reached and the day. GET returns the top ten; POST adds one and
 * returns the table and where it landed.
 *
 * Runs as a Cloudflare Pages Function. Needs a KV namespace bound as SCORES (setup: README.md).
 * Without it, it answers 503 and the game keeps scores in the player's own browser instead.
 */
interface KV { get(key: string, type: 'json'): Promise<unknown>; put(key: string, value: string): Promise<void> }
interface Env { SCORES?: KV }
type Score = { i: string; s: number; l: number; d: string };

const KEY = 'four:top';
const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const BAD = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'SEX', 'CUM', 'DIK', 'DIC', 'KKK', 'NIG', 'FAG', 'SHT', 'TIT', 'WTF', 'NAZ', 'KYS', 'PIS', 'VAG', 'COK', 'XXX', 'GAY', 'HOE', 'JIZ', 'POO']);
const top = async (env: Env) => ((await env.SCORES!.get(KEY, 'json')) as Score[] | null) ?? [];

export async function onRequestGet({ env }: { env: Env }) {
  if (!env.SCORES) return json(503, { error: 'scores are not set up yet' });
  return json(200, { scores: await top(env) });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let data: { i?: unknown; s?: unknown; l?: unknown; ms?: unknown };
  try { data = await request.json(); } catch { return json(400, { error: 'bad request' }); }
  const i = typeof data.i === 'string' ? data.i.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) : '';
  const s = Number(data.s), l = Number(data.l), ms = Number(data.ms);
  // A won round is worth at most 100 × its level + 410, and takes a few seconds to play
  const most = Array.from({ length: Math.max(0, l - 1) }, (_, k) => 100 * (k + 1) + 410).reduce((a, b) => a + b, 0) + 500 * l; // with room for draws
  if (!i || BAD.has(i) || !Number.isInteger(s) || s <= 0 || !Number.isInteger(l) || l < 1 || l > 99 || s > most || (Number.isFinite(ms) && ms < (l - 1) * 2500)) {
    return json(400, { error: 'that score doesn’t add up' });
  }
  if (!env.SCORES) return json(503, { error: 'scores are not set up yet' });
  const entry: Score = { i, s, l, d: new Date().toISOString().slice(0, 10) };
  const list = [...(await top(env)), entry].sort((a, b) => b.s - a.s).slice(0, 10);
  await env.SCORES.put(KEY, JSON.stringify(list));
  return json(200, { scores: list, rank: list.indexOf(entry) });
}
