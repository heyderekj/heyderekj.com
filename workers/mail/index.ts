/**
 * heyderekj-mail: sends the site's emails to derekj@hey.com. Pages Functions can't send email
 * themselves, so they call this Worker through a service binding (MAIL) with a ready-made message.
 * It has no public URL, and it only sends from the site's addresses on koatiapp.com (a domain with
 * Cloudflare Email Routing on; heyderekj.com's mail lives at Hover, so it can't send from there).
 *
 *   POST { from: 'hire' | 'notes', raw: '<the whole MIME message>' }  →  { ok: true }
 */
import { EmailMessage } from 'cloudflare:email';

interface Env { SEND: { send(message: EmailMessage): Promise<void> } }
export const DOMAIN = 'koatiapp.com';
const TO = 'derekj@hey.com';
const SENDERS = ['hire', 'notes'];

export default {
  async fetch(request: Request, env: Env) {
    if (request.method !== 'POST') return new Response('Not found', { status: 404 });
    const { from, raw } = await request.json().catch(() => ({})) as { from?: string; raw?: string };
    if (!from || !SENDERS.includes(from) || typeof raw !== 'string' || raw.length > 200_000) return Response.json({ error: 'bad request' }, { status: 400 });
    try {
      await env.SEND.send(new EmailMessage(`${from}@${DOMAIN}`, TO, raw));
      return Response.json({ ok: true });
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 502 });
    }
  },
};
