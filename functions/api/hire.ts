/**
 * POST /api/hire: a request from /hire/ (src/client/hire.ts). It's saved to D1 and emailed to me,
 * with Reply-To set to the person so I can answer from my inbox.
 *
 * The estimate is worked out again here from the answers, with the same code the page uses
 * (src/lib/estimate.ts), so the number in my inbox is mine, not whatever the browser sent.
 *
 * Bindings (Cloudflare Pages → Settings → Bindings; setup in README.md):
 *   HIRE_DB    — D1 database, table from migrations/0001_hire.sql
 *   NOTES_MAIL — the same send_email binding as /api/note (to derekj@hey.com)
 * With only one of them, it still does that one; with neither, it answers 503 and the page offers my email.
 */
import { EmailMessage } from 'cloudflare:email';
import { clean, estimate, money, schedule, short } from '../../src/lib/estimate';
import { availability } from '../../src/data/hire';
import { SERVICES } from '../../src/data/hire';

interface D1 { prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<unknown> } } }
interface Env { HIRE_DB?: D1; NOTES_MAIL?: { send(message: EmailMessage): Promise<void> } }

const FROM = 'hire@heyderekj.com';
const TO = 'derekj@hey.com';
const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const oneLine = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').trim().slice(0, max) : '');
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s)));
const TIMELINE = { asap: 'As soon as possible', soon: 'In the next month or two', flexible: 'Flexible' } as const;

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json(400, { error: 'bad request' }); }

  // Bots fill the hidden field, or send faster than anyone can answer
  if (oneLine(data.website, 200)) return json(200, { ok: true });
  if (typeof data.ms === 'number' && data.ms < 4000) return json(200, { ok: true });

  const name = oneLine(data.name, 80), email = oneLine(data.email, 120), org = oneLine(data.org, 100);
  const link = oneLine(data.link, 200), budget = oneLine(data.budget, 40), page = oneLine(data.page, 200);
  const message = typeof data.message === 'string' ? data.message.trim().slice(0, 3000) : '';
  if (!name) return json(400, { error: 'a name' });
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) return json(400, { error: 'an email I can reply to' });

  const answers = clean(data.answers), unsure = data.unsure === true;
  if (!answers.services.length && !unsure) return json(400, { error: 'at least one thing you need' });
  const est = estimate(answers);
  // The timeline they saw: from the free date their page had (Notion's or the written one) and their today
  const ymd = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
  const day = new Date().toISOString().slice(0, 10), seen = ymd(data.today);
  const plan = schedule(answers, est, data.free === 'now' ? 'now' : ymd(data.free) || availability.from, seen && Math.abs(Date.parse(seen) - Date.parse(day)) < 2 * 86_400_000 ? seen : day);
  if (!env.HIRE_DB && !env.NOTES_MAIL) return json(503, { error: 'requests are not set up yet' });

  const id = crypto.randomUUID(), at = new Date();
  const names = answers.services.map((s) => SERVICES.find((x) => x.id === s)!.name);
  let saved = false, sent = false;

  if (env.HIRE_DB) {
    try {
      await env.HIRE_DB.prepare(
        `INSERT INTO requests (id, created_at, name, email, org, link, message, services, answers, timeline, budget, total, monthly, page, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(id, at.toISOString(), name, email, org, link, message, JSON.stringify(unsure ? [...answers.services, 'unsure'] : answers.services), JSON.stringify(answers),
        answers.timeline ?? 'flexible', budget, est.total, est.monthly, page, oneLine(request.headers.get('user-agent'), 300)).run();
      saved = true;
    } catch { /* still try the email */ }
  }

  if (env.NOTES_MAIL) {
    const what = names.length ? names.join(', ') : 'Not sure yet';
    const subject = `Work request: ${org || name} — ${what}${est.total ? ` — ~${money(est.total)}` : ''}`;
    const body = [
      `${name}${org ? ` (${org})` : ''} <${email}>`,
      link && `Site: ${link}`,
      '',
      message || '(No message)',
      '',
      '— What they picked',
      ...(names.length ? names.map((n) => `· ${n}`) : []),
      ...(unsure ? ['· Not sure yet, wants to talk it through'] : []),
      `Start: ${TIMELINE[answers.timeline ?? 'flexible']}${budget ? ` · Budget in mind: ${budget}` : ''}`,
      '',
      '— Their estimate',
      ...est.lines.map((l) => `${l.title}: ${money(l.price)}${l.unit ?? ''}\n  ${l.desc}`),
      est.total ? `Total: ${money(est.total)}` : '',
      est.monthly ? `Ongoing: ${money(est.monthly)}/mo` : '',
      ...est.payments.map((p) => `${p.when} ${p.pct}% (${money(p.amount)}) ${p.after}`),
      est.terms && `Payment plan: ${est.plan}. ${est.terms}`,
      ...(plan ? ['', '— Their timeline', `Approval by ${short(plan.approveBy)}`, ...plan.steps.map((s) => `${s.title}: ~${short(s.when)}${s.desc ? ` (${s.desc})` : ''}`)] : []),
      '',
      `Answers: ${JSON.stringify(answers)}`,
      saved ? `Saved as ${id}` : 'Not saved to D1 (binding missing or the insert failed)',
    ].filter((l): l is string => typeof l === 'string').join('\n');
    const raw = [
      `From: Work requests on heyderekj.com <${FROM}>`,
      `To: ${TO}`,
      `Reply-To: ${name.replace(/[<>"]/g, '')} <${email}>`,
      `Subject: =?utf-8?B?${b64(subject)}?=`,
      `Message-ID: <${id}@heyderekj.com>`,
      `Date: ${at.toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      body,
    ].join('\r\n');
    try { await env.NOTES_MAIL.send(new EmailMessage(FROM, TO, raw)); sent = true; } catch { /* reported below */ }
  }

  if (!saved && !sent) return json(502, { error: 'could not save or send' });
  return json(200, { ok: true, id, saved, sent, total: est.total, monthly: est.monthly });
}
