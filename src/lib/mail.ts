/**
 * Email to me from the site's Pages Functions (hire, notes). Pages can't send email itself, so this hands a
 * ready-made message to the heyderekj-mail Worker (workers/mail) through a service binding named MAIL.
 * It sends from koatiapp.com, a domain with Cloudflare Email Routing on (heyderekj.com's mail is at Hover).
 */
export const MAIL_DOMAIN = 'koatiapp.com';
export const MAIL_TO = 'derekj@hey.com';
export interface MailEnv { MAIL?: { fetch(input: string, init?: RequestInit): Promise<Response> } }
export const mailFrom = (who: 'hire' | 'notes') => `${who}@${MAIL_DOMAIN}`;

/** Send a whole MIME message from hire@ or notes@; true when it went */
export async function sendMail(env: MailEnv, from: 'hire' | 'notes', raw: string): Promise<boolean> {
  if (!env.MAIL) return false;
  try {
    const r = await env.MAIL.fetch('https://mail/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from, raw }) });
    return r.ok;
  } catch { return false; }
}
