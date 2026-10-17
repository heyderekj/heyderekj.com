/**
 * POST /api/note: a note left from the watermark easter egg (src/client/sig-egg.ts), emailed to me.
 * Anonymous unless the visitor gives a name. Nothing is stored.
 *
 * Runs as a Cloudflare Pages Function. Sends through the heyderekj-mail Worker (service binding MAIL;
 * src/lib/mail.ts). Without it, it answers 503 and the page tells the visitor to email me instead.
 */
import { mailFrom, MAIL_TO, sendMail, type MailEnv } from '../../src/lib/mail';

type Env = MailEnv;

const FROM = mailFrom('notes');
const TO = MAIL_TO;
const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let data: { note?: unknown; name?: unknown; website?: unknown; page?: unknown; ms?: unknown };
  try { data = await request.json(); } catch { return json(400, { error: 'bad request' }); }

  const note = typeof data.note === 'string' ? data.note.trim() : '';
  const name = typeof data.name === 'string' ? oneLine(data.name).slice(0, 80) : '';
  const page = typeof data.page === 'string' ? oneLine(data.page).slice(0, 200) : '';
  // Bots fill the hidden field, or submit faster than anyone can type
  if (typeof data.website === 'string' && data.website) return json(200, { ok: true });
  if (typeof data.ms === 'number' && data.ms < 2000) return json(200, { ok: true });
  if (!note || note.length > 2000) return json(400, { error: 'a note between 1 and 2000 characters' });
  if (!env.MAIL) return json(503, { error: 'notes are not set up yet' });

  const from = name || 'Someone';
  const raw = [
    `From: Notes from heyderekj.com <${FROM}>`,
    `To: ${TO}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(`A note from ${from}`)))}?=`,
    `Message-ID: <${crypto.randomUUID()}@heyderekj.com>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    note,
    '',
    '—',
    `${name ? `From ${name}` : 'Left anonymously'}${page ? ` on heyderekj.com${page}` : ''}`,
  ].join('\r\n');

  return (await sendMail(env, 'notes', raw)) ? json(200, { ok: true }) : json(502, { error: 'could not send' });
}
