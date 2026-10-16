/**
 * The /hire/ estimate (pages/hire.astro), as a small app: one screen at a time (what you need, a screen
 * for each of those, when, who you are, a review), with the proposal beside it rewritten as you go and
 * priced by lib/estimate.ts (the same code the request function uses). Sends to /api/hire, then a
 * signed note from me. Answers are kept in this browser until they're sent.
 */
import { clean, DEFAULTS, estimate, money, schedule, short, type Answers } from '../lib/estimate';
import { EXTRAS, SERVICES, TIMELINE, type ServiceId } from '../data/hire';
import { copyText, toast } from './toast';

const form = document.querySelector<HTMLFormElement>('#hireForm');
if (form) {
  const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
  const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
  const app = form.closest<HTMLElement>('.est')!, prop = $('#proposal'), sum = $('#hireSum');
  const P = (k: string) => $(`[data-p="${k}"]`, prop);
  const nextBtn = $<HTMLButtonElement>('[data-next]', form), backBtn = $<HTMLButtonElement>('[data-back]', form), hint = $('.est__hint', form);
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pencil = document.querySelector<HTMLTemplateElement>('#hirePencil')?.innerHTML ?? '';
  // When my hours free up: the date written on the page, then Notion's when client/availability.ts has it
  const free = () => document.documentElement.dataset.availFrom || prop.dataset.free || 'now';
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const openedAt = Date.now();

  // ---- What's been answered (each service's options start at sensible defaults)
  type Draft = Answers & { unsure: boolean; budget: string };
  const fresh = (): Draft => ({ services: [], unsure: false, retainer: false, timeline: 'flexible', extras: [], budget: '', ...structuredClone(DEFAULTS) } as unknown as Draft);
  let draft = fresh();
  try { const saved = JSON.parse(localStorage.getItem('hdj:hire') || 'null'); if (saved) draft = { ...draft, ...saved }; } catch {}
  const save = () => { try { localStorage.setItem('hdj:hire', JSON.stringify(draft)); } catch {} };
  const get = (path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], draft);
  const set = (path: string, v: unknown) => {
    const keys = path.split('.'), last = keys.pop()!;
    const parent = keys.reduce<Record<string, unknown>>((o, k) => (o[k] ??= {}) as Record<string, unknown>, draft as unknown as Record<string, unknown>);
    parent[last] = v;
  };
  const ORDER = SERVICES.map((s) => s.id);
  const toggleService = (id: ServiceId | 'unsure', on?: boolean) => {
    // "Not sure yet" stands alone: picking it clears the rest, and picking anything else clears it
    if (id === 'unsure') { draft.unsure = on ?? !draft.unsure; if (draft.unsure) draft.services = []; return; }
    const want = on ?? !draft.services.includes(id);
    if (want) draft.unsure = false;
    draft.services = ORDER.filter((s) => (s === id ? want : draft.services.includes(s)));
  };
  const field = (n: string) => (form!.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? '';

  // ---- The screens: what you need, one for each of those, when, you, review
  const flow = () => ['services', ...draft.services, 'timing', 'you', 'review'];
  const DOT: Record<string, string> = { services: 'services', timing: 'timing', you: 'you', review: 'review', sent: 'review' };
  let at = 'services';
  function show(name: string, dir: 1 | -1 = 1) {
    at = name;
    $$('.est__screen', form!).forEach((s) => { const on = s.dataset.screen === name; s.classList.toggle('is-on', on); s.classList.toggle('from-back', on && dir < 0); });
    const f = flow(), i = name === 'sent' ? f.length - 1 : f.indexOf(name), dot = DOT[name] ?? 'details';
    const dots = ['services', 'details', 'timing', 'you', 'review'], di = dots.indexOf(dot);
    $$('[data-dot]', app).forEach((li, n) => { li.classList.toggle('is-on', n === di && name !== 'sent'); li.classList.toggle('is-done', n < di || name === 'sent'); });
    prop.classList.toggle('is-final', name === 'sent');
    app.style.setProperty('--p', String(name === 'sent' ? 1 : i / (f.length - 1)));
    $('.est__count', app).textContent = name === 'sent' ? 'Sent' : `Step ${i + 1} of ${f.length}`;
    backBtn.hidden = i === 0 || name === 'sent';
    const nav = $('.est__nav', form!); nav.hidden = name === 'sent';
    const last = name === 'review';
    nextBtn.innerHTML = last ? 'Send it my way <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>' : 'Continue <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
    nextBtn.classList.toggle('est__btn--send', last);
    say('');
    if (last) paintReview();
    const first = $$<HTMLElement>('.est__screen.is-on input:not([type=checkbox]):not([type=range]):not(.hire-hp)', form!)[0];
    if (first && name === 'you') first.focus({ preventScroll: true });
  }
  const say = (t: string, bad = false) => { hint.textContent = t; hint.classList.toggle('is-bad', bad); };

  function next() {
    if (at === 'services' && !draft.services.length && !draft.unsure) return say('Pick at least one, or “Not sure yet”.', true);
    if (at === 'you') {
      const name = form!.elements.namedItem('name') as HTMLInputElement, email = form!.elements.namedItem('email') as HTMLInputElement;
      const bad = [!name.value.trim() && name, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) && email].filter(Boolean) as HTMLInputElement[];
      bad.forEach((i) => i.classList.add('is-bad'));
      if (bad.length) { bad[0].focus(); return say(bad.includes(name) ? 'Your name, and an email to reply to.' : 'That email doesn’t look quite right.', true); }
    }
    if (at === 'review') return send();
    const f = flow(); show(f[Math.min(f.length - 1, f.indexOf(at) + 1)], 1);
    if (innerWidth <= 900) app.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
  }
  const back = () => { const f = flow(); show(f[Math.max(0, f.indexOf(at) - 1)], -1); };
  nextBtn.addEventListener('click', next);
  backBtn.addEventListener('click', back);
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !(e.target as HTMLElement).closest('textarea, button')) { e.preventDefault(); next(); }
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); next(); });

  // ---- Painting the controls from the draft
  function paintForm() {
    $$<HTMLButtonElement>('[data-service]', form!).forEach((b) => {
      const id = b.dataset.service as ServiceId | 'unsure';
      b.setAttribute('aria-pressed', String(id === 'unsure' ? draft.unsure : draft.services.includes(id)));
    });
    $$('[data-k]:not(input)', form!).forEach((group) => {
      const v = get(group.dataset.k!);
      group.setAttribute('role', 'radiogroup');
      $$<HTMLButtonElement>('[data-v]', group).forEach((b) => { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(b.dataset.v === (v ?? ''))); });
    });
    $$<HTMLInputElement>('input[type="checkbox"][data-k]', form!).forEach((i) => { i.checked = get(i.dataset.k!) === true; });
    $$<HTMLInputElement>('input[type="checkbox"][data-also]', form!).forEach((i) => { i.checked = draft.services.includes(i.dataset.also as ServiceId); });
    $$<HTMLInputElement>('input[type="checkbox"][data-extra]', form!).forEach((i) => { i.checked = draft.extras?.includes(i.dataset.extra!) ?? false; });
    $$<HTMLInputElement>('input[type="range"][data-k]', form!).forEach((i) => { i.value = String(get(i.dataset.k!)); $(`[data-out="${i.dataset.k}"]`, form!).textContent = i.value; });
    $$('[data-when]', form!).forEach((el) => { const [k, v] = el.dataset.when!.split('='); el.hidden = get(k) !== v; });
    $$('[data-when-any]', form!).forEach((el) => { el.hidden = !el.dataset.whenAny!.split(' ').some((s) => draft.services.includes(s as ServiceId)); });
  }

  // ---- The proposal, in the shape of the ones I send
  const LABEL: Record<ServiceId, (a: Answers) => string> = {
    site: (a) => (a.site?.kind === 'redesign' ? 'a website redesign' : 'a new website'),
    logo: (a) => (a.logo?.kind === 'refresh' ? 'a logo refresh' : 'a new logo'),
    rebrand: () => 'a rebrand',
    feedback: (a) => `feedback on their ${a.feedback?.on ?? 'site'}`,
    ai: (a) => ({ workflow: 'an AI workflow', tool: 'an AI tool', prototype: 'a first version of an app' })[a.ai?.kind ?? 'workflow'],
  };
  const TAGS: Record<ServiceId, (a: Answers) => string[]> = {
    site: (a) => [a.site?.scope !== 'build' ? 'Web Design' : '', a.site?.scope !== 'design' ? (a.site?.platform === 'webflow' ? 'Webflow Development' : 'Development') : ''].filter(Boolean),
    logo: () => ['Logo Design'], rebrand: () => ['Brand Identity'], feedback: () => ['Design Feedback'], ai: () => ['AI Workflows'],
  };
  const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

  function paintProposal() {
    const a = clean(draft), e = estimate(a), org = field('org'), name = field('name'), who = org || name;
    P('org').textContent = org || 'Your project';
    const d = new Date(); P('date').textContent = `${d.getMonth() + 1}.${d.getDate()}.${String(d.getFullYear()).slice(2)}`;
    P('tags').innerHTML = [...new Set(a.services.flatMap((s) => TAGS[s](a)))].map((t) => `<span>${t}</span>`).join('');
    const wants = a.services.map((s) => LABEL[s](a));
    const when = { asap: ' They’re hoping to start as soon as possible.', soon: ' They’re hoping to start in the next month or two.', flexible: '' }[a.timeline ?? 'flexible'];
    P('overview').textContent = !wants.length && !draft.unsure
      ? 'Pick what you need and your estimate builds here, line by line.'
      : `${who || 'You'} ${who ? 'has' : 'have'} requested a project estimate ${wants.length ? `covering ${list(wants)} ` : 'to talk through what’s needed '}from Derek Castelli of Derek J Design / Testament Made, LLC.${when}`;
    P('lines').innerHTML = e.lines.map((l) => `<li><b>${esc(l.title)}</b><em>${money(l.price)}${l.unit ?? ''}</em><small>${esc(l.desc)}</small>${l.step ? `<button type="button" class="prop__edit" data-go="${l.step}" aria-label="Change ${esc(l.title)}">${pencil}</button>` : ''}</li>`).join('');
    P('scope-wrap').hidden = !e.lines.length;
    P('totals').innerHTML = `<li><b>Total</b><em>${money(e.total)}</em></li>${e.monthly ? `<li><b>Total Ongoing</b><em>${money(e.monthly)}/mo</em></li>` : ''}`;
    P('total-wrap').hidden = !e.total;
    P('pay').innerHTML = e.payments.map((p) => `<li>${esc(p.when)} <em>${p.pct}% (${money(p.amount)})</em> ${esc(p.after)}</li>`).join('');
    P('terms').textContent = e.terms;
    // When: from my free date (Notion's, once it's in) and how they want to start
    const plan = schedule(a, e, free(), today());
    P('time-wrap').hidden = !plan;
    if (plan) {
      P('time-note').textContent = plan.steps.length > 1 ? `Assumes approval by ${short(plan.approveBy)} and content delivered on schedule.` : '';
      P('time').innerHTML = plan.steps.map((s) => `<li><b>${esc(s.title)}</b><em>~${short(s.when)}</em>${s.desc ? `<small>${esc(s.desc)}</small>` : ''}</li>`).join('');
    }
    fade();
    P('pay-wrap').hidden = !e.payments.length && !e.monthly;
    $('[data-p="sum"]', sum).textContent = money(e.total) + (e.monthly ? ` + ${money(e.monthly)}/mo` : '');
    showSum();
  }

  // Review: what's being sent, each part a tap away from changing
  function paintReview() {
    const a = clean(draft), names = a.services.map((s) => SERVICES.find((x) => x.id === s)!.name);
    const extras = EXTRAS.filter((x) => a.extras?.includes(x.id)).map((x) => x.name);
    const rows: [string, string, string][] = [
      ['What', [...names, ...(draft.unsure ? ['Not sure yet'] : [])].join(', ') + (extras.length ? `, with ${list(extras.map((x) => x.toLowerCase()))}` : ''), 'services'],
      ['When', `${TIMELINE[a.timeline ?? 'flexible'].label}${draft.budget ? ` · Budget ${draft.budget}` : ''}${a.retainer ? ' · Retainer after launch' : ''}`, 'timing'],
      ['You', [field('name'), field('org'), field('email')].filter(Boolean).join(' · '), 'you'],
      ...(field('message') ? [['Note', field('message').slice(0, 160) + (field('message').length > 160 ? '…' : ''), 'you'] as [string, string, string]] : []),
      ['Estimate', `${money(estimate(a).total)}${estimate(a).monthly ? ` + ${money(estimate(a).monthly)}/mo` : ''}`, ''],
    ];
    $('[data-review]', form!).innerHTML = rows.map(([k, v, go]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd>${go ? `<button type="button" data-go="${go}">Edit</button>` : '<span></span>'}</div>`).join('');
  }
  form.addEventListener('click', (e) => { const go = (e.target as HTMLElement).closest<HTMLElement>('[data-go]')?.dataset.go; if (go) show(go, -1); });
  // The floating Get an estimate button shows whenever the estimate itself isn't on screen
  const float = document.querySelector<HTMLAnchorElement>('[data-float]'), section = document.getElementById('estimate');
  if (float && section) {
    new IntersectionObserver(([e]) => { float.toggleAttribute('data-on', !e.isIntersecting); float.tabIndex = e.isIntersecting ? -1 : 0; }).observe(section);
    float.addEventListener('click', (e) => { e.preventDefault(); section.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' }); });
  }

  // A long estimate scrolls inside the sheet: fades where there's more, and See all goes to the bottom
  const body = P('body'), more = P('more') as HTMLButtonElement;
  function fade() {
    const below = body.scrollHeight - body.scrollTop - body.clientHeight > 8;
    body.toggleAttribute('data-top', body.scrollTop > 4); body.toggleAttribute('data-more', below); more.hidden = !below;
  }
  body.addEventListener('scroll', fade, { passive: true });
  new ResizeObserver(fade).observe(body);
  more.addEventListener('click', () => body.scrollTo({ top: body.scrollHeight, behavior: calm() ? 'auto' : 'smooth' }));
  // A line on the proposal opens the screen where it's decided
  prop.addEventListener('click', (e) => {
    const go = (e.target as HTMLElement).closest<HTMLElement>('[data-go]')?.dataset.go;
    if (!go || at === 'sent' || go === at) return;
    const f = flow(); show(go, f.indexOf(go) < f.indexOf(at) ? -1 : 1);
    form!.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  });

  // On phones, a bar keeps the total in sight while the proposal is off screen
  let propVisible = false, inApp = false;
  const showSum = () => { sum.hidden = !inApp || propVisible || !estimate(clean(draft)).total || at === 'sent'; };
  new IntersectionObserver(([e]) => { propVisible = e.isIntersecting; showSum(); }).observe(prop);
  new IntersectionObserver(([e]) => { inApp = e.isIntersecting; showSum(); }).observe(form);

  const paint = () => { paintForm(); paintProposal(); save(); };
  window.addEventListener('hdj:avail', () => paintProposal());

  // ---- Answering
  form.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const pick = t.closest<HTMLButtonElement>('[data-service]');
    if (pick) { toggleService(pick.dataset.service as ServiceId | 'unsure'); say(''); paint(); return; }
    const opt = t.closest<HTMLButtonElement>('[data-k]:not(input) [data-v]');
    if (opt) { set(opt.closest<HTMLElement>('[data-k]')!.dataset.k!, opt.dataset.v); paint(); }
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.type === 'range' && t.dataset.k) { set(t.dataset.k, Number(t.value)); paint(); }
    else if (t.type === 'checkbox' && t.dataset.k) { set(t.dataset.k, t.checked); paint(); }
    else if (t.type === 'checkbox' && t.dataset.also) { toggleService(t.dataset.also as ServiceId, t.checked); paint(); }
    else if (t.type === 'checkbox' && t.dataset.extra) { const id = t.dataset.extra; draft.extras = t.checked ? [...new Set([...(draft.extras ?? []), id])] : (draft.extras ?? []).filter((x) => x !== id); paint(); }
    else if (t.name === 'org' || t.name === 'name') paintProposal();
    if (t.classList.contains('is-bad')) { t.classList.remove('is-bad'); say(''); }
  });

  // "What I do" picks that service and opens its screen
  $$<HTMLButtonElement>('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.pick as ServiceId;
    toggleService(id, true); paint(); show(id);
    app.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
  }));

  // ---- Sending
  async function send() {
    nextBtn.disabled = true; say('Sending…');
    try {
      const r = await fetch('/api/hire', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: clean(draft), free: free(), today: today(), unsure: draft.unsure, name: field('name'), email: field('email'), org: field('org'), link: field('link'),
          message: field('message'), budget: draft.budget, website: field('website'), ms: Date.now() - openedAt, page: location.pathname,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      try { localStorage.removeItem('hdj:hire'); } catch {}
      $('[data-thanks]', form!).textContent = field('name').split(/\s+/)[0] || 'friend';
      show('sent'); showSum(); sign();
    } catch {
      say('');
      hint.innerHTML = 'That didn’t send. Email me at <a href="mailto:derekj@hey.com">derekj@hey.com</a> and I’ll take it from there.';
      hint.classList.add('is-bad');
    } finally { nextBtn.disabled = false; }
  }
  // My signature, written out on the thank-you note (as client/signature.ts does for the others)
  function sign() {
    const box = $('[data-sign]', form!), tpl = $<HTMLTemplateElement>('#hireSign');
    box.replaceChildren(tpl.content.cloneNode(true));
    const sig = $('.sig', box);
    if (calm()) { sig.classList.add('is-drawn'); return; }
    requestAnimationFrame(() => { sig.classList.add('is-signing'); setTimeout(() => { sig.classList.add('is-drawn'); sig.classList.remove('is-signing'); }, Number(sig.dataset.total || 1600) + 50); });
  }
  $('[data-print]', form).addEventListener('click', () => window.print());
  $('[data-again]', form).addEventListener('click', () => { draft = fresh(); form.reset(); paint(); show('services', -1); });

  // Copy my email
  $$<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', async () => { if (await copyText(b.dataset.copy!)) toast('Email copied'); }));

  // What people say: a slider under the intro, moving on every 7 seconds unless you're reading it
  const said = document.querySelector<HTMLElement>('.hire-said');
  if (said) {
    const track = $('.said', said), cards = $$('.said__card', track), dots = $$('.hire-said__dots i', said);
    const step = () => Math.max(1, cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth); // a card and the gap
    const index = () => Math.round(track.scrollLeft / step());
    const go = (i: number) => track.scrollTo({ left: ((i + cards.length) % cards.length) * step(), behavior: calm() ? 'auto' : 'smooth' });
    track.addEventListener('scroll', () => dots.forEach((d, n) => d.classList.toggle('is-on', n === index())), { passive: true });
    $$<HTMLButtonElement>('[data-said]', said).forEach((b) => b.addEventListener('click', () => go(index() + Number(b.dataset.said))));
    let held = false;
    said.addEventListener('pointerenter', () => (held = true)); said.addEventListener('pointerleave', () => (held = false));
    said.addEventListener('focusin', () => (held = true)); said.addEventListener('focusout', () => (held = false));
    if (!calm()) setInterval(() => { if (!held && !document.hidden) go(index() + 1); }, 7000);
  }

  // The examples strips under What I do scroll sideways with a plain mouse wheel too
  $$('.hire-cap__strip').forEach((strip) => strip.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // a trackpad already scrolls it
    const max = strip.scrollWidth - strip.clientWidth, next = strip.scrollLeft + e.deltaY;
    if (max <= 0 || (next <= 0 && strip.scrollLeft <= 0) || (next >= max && strip.scrollLeft >= max)) return; // at an end, let the page scroll
    e.preventDefault(); strip.scrollLeft = next;
  }, { passive: false }));

  // A service named in the address (/hire/#site) starts picked
  const fromHash = location.hash.slice(1) as ServiceId;
  if (ORDER.includes(fromHash)) toggleService(fromHash, true);
  paint(); show('services');
}
