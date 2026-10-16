/**
 * The /hire/ form (pages/hire.astro): pick what you need, answer a few questions about each, and the
 * proposal beside it is rewritten as you go, priced by lib/estimate.ts (the same code the request
 * function uses). Sends to /api/hire; afterwards the proposal can be saved as a PDF. Your answers are
 * kept in this browser until you send them.
 */
import { clean, DEFAULTS, estimate, money, type Answers } from '../lib/estimate';
import { SERVICES, type ServiceId } from '../data/hire';
import { copyText, toast } from './toast';

const form = document.querySelector<HTMLFormElement>('#hireForm');
if (form) {
  const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
  const prop = $('#proposal'), sum = $('#hireSum'), done = $('#hireDone');
  const P = (k: string) => $(`[data-p="${k}"]`, prop);
  const openedAt = Date.now();

  // ---- What's been answered (services in the order picked; each service's options start at sensible defaults)
  type Draft = Answers & { unsure: boolean };
  let draft: Draft = { services: [], unsure: false, retainer: false, timeline: 'flexible', ...structuredClone(DEFAULTS) } as Draft;
  try { const saved = JSON.parse(localStorage.getItem('hdj:hire') || 'null'); if (saved) draft = { ...draft, ...saved }; } catch {}
  const save = () => { try { localStorage.setItem('hdj:hire', JSON.stringify(draft)); } catch {} };

  const get = (path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], draft);
  const set = (path: string, v: unknown) => {
    const keys = path.split('.'), last = keys.pop()!;
    const parent = keys.reduce<Record<string, unknown>>((o, k) => (o[k] ??= {}) as Record<string, unknown>, draft as unknown as Record<string, unknown>);
    parent[last] = v;
  };
  const toggleService = (id: ServiceId | 'unsure', on?: boolean) => {
    if (id === 'unsure') { draft.unsure = on ?? !draft.unsure; return; }
    const has = draft.services.includes(id), want = on ?? !has;
    draft.services = want ? (has ? draft.services : [...draft.services, id]) : draft.services.filter((s) => s !== id);
  };

  // ---- Painting the form from the draft
  function paintForm() {
    form!.querySelectorAll<HTMLButtonElement>('[data-service]').forEach((b) => {
      const id = b.dataset.service as ServiceId | 'unsure';
      b.setAttribute('aria-pressed', String(id === 'unsure' ? draft.unsure : draft.services.includes(id)));
    });
    form!.querySelectorAll<HTMLElement>('[data-for]').forEach((f) => { f.hidden = !draft.services.includes(f.dataset.for as ServiceId); });
    const started = draft.services.length > 0 || draft.unsure;
    form!.querySelectorAll<HTMLElement>('[data-step="when"], [data-step="you"]').forEach((f) => { f.hidden = !started; });
    form!.querySelectorAll<HTMLElement>('.hire-seg[data-k]').forEach((seg) => {
      const v = get(seg.dataset.k!);
      seg.querySelectorAll<HTMLButtonElement>('[data-v]').forEach((b) => { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(b.dataset.v === v)); });
      seg.setAttribute('role', 'radiogroup');
    });
    form!.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-k]').forEach((i) => { i.checked = get(i.dataset.k!) === true; });
    form!.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-also]').forEach((i) => { i.checked = draft.services.includes(i.dataset.also as ServiceId); });
    form!.querySelectorAll<HTMLInputElement>('input[type="range"][data-k]').forEach((i) => { i.value = String(get(i.dataset.k!)); $(`[data-out="${i.dataset.k}"]`, form!).textContent = i.value; });
    form!.querySelectorAll<HTMLElement>('[data-when]').forEach((el) => { const [k, v] = el.dataset.when!.split('='); el.hidden = get(k) !== v; });
    form!.querySelectorAll<HTMLElement>('[data-when-any]').forEach((el) => { el.hidden = !el.dataset.whenAny!.split(' ').some((s) => draft.services.includes(s as ServiceId)); });
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
  const field = (n: string) => (form!.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? '';

  function paintProposal() {
    const a = clean(draft), e = estimate(a), org = field('org'), name = field('name');
    const who = org || name;
    P('org').textContent = org || 'Your project';
    const d = new Date(); P('date').textContent = `${d.getMonth() + 1}.${d.getDate()}.${String(d.getFullYear()).slice(2)}`;
    P('tags').innerHTML = [...new Set(a.services.flatMap((s) => TAGS[s](a)))].map((t) => `<span>${t}</span>`).join('');
    const wants = a.services.map((s) => LABEL[s](a));
    const when = { asap: ' They’re hoping to start as soon as possible.', soon: ' They’re hoping to start in the next month or two.', flexible: '' }[a.timeline ?? 'flexible'];
    P('overview').textContent = !wants.length && !draft.unsure
      ? 'Pick what you need and your estimate builds here, line by line.'
      : `${who || 'You'} ${who ? 'has' : 'have'} requested a project estimate ${wants.length ? `covering ${list(wants)} ` : 'to talk through what’s needed '}from Derek Castelli of Derek J Design / Testament Made, LLC.${when}`;
    P('lines').innerHTML = e.lines.map((l) => `<li><b>${esc(l.title)}</b><em>${money(l.price)}${l.unit ?? ''}</em><small>${esc(l.desc)}</small></li>`).join('');
    P('scope-wrap').hidden = !e.lines.length;
    P('totals').innerHTML = `<li><b>Total</b><em>${money(e.total)}</em></li>${e.monthly ? `<li><b>Total Ongoing</b><em>${money(e.monthly)}/mo</em></li>` : ''}`;
    P('total-wrap').hidden = !e.total;
    P('pay').innerHTML = e.payments.map((p) => `<li>${esc(p.when)} <em>${p.pct}% (${money(p.amount)})</em> ${esc(p.after)}</li>`).join('');
    P('pay-wrap').hidden = !e.payments.length;
    $('[data-p="sum"]', sum).textContent = money(e.total) + (e.monthly ? ` + ${money(e.monthly)}/mo` : '');
    showSum();
  }

  // On phones, a bar keeps the total in sight while the proposal is off screen
  let propVisible = false;
  const showSum = () => { sum.hidden = propVisible || !estimate(clean(draft)).total || !done.hidden; };
  new IntersectionObserver(([e]) => { propVisible = e.isIntersecting; showSum(); }).observe(prop);

  const paint = () => { paintForm(); paintProposal(); save(); };

  // ---- Answering
  form.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const pick = t.closest<HTMLButtonElement>('[data-service]');
    if (pick) { toggleService(pick.dataset.service as ServiceId | 'unsure'); paint(); return; }
    const opt = t.closest<HTMLButtonElement>('.hire-seg [data-v]');
    if (opt) { set(opt.closest<HTMLElement>('[data-k]')!.dataset.k!, opt.dataset.v); paint(); }
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.type === 'range' && t.dataset.k) { set(t.dataset.k, Number(t.value)); paint(); }
    else if (t.type === 'checkbox' && t.dataset.k) { set(t.dataset.k, t.checked); paint(); }
    else if (t.type === 'checkbox' && t.dataset.also) { toggleService(t.dataset.also as ServiceId, t.checked); paint(); }
    else if (t.name === 'org' || t.name === 'name') paintProposal();
    if (t.classList.contains('is-bad')) t.classList.remove('is-bad');
  });

  // The rows under "What I do" pick that service here
  document.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    toggleService(b.dataset.pick as ServiceId, true); paint();
    $('#estimate').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // ---- Sending
  const note = $('.hire-send__note', form), btn = $<HTMLButtonElement>('.hire-send__btn', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements.namedItem('name') as HTMLInputElement, email = form.elements.namedItem('email') as HTMLInputElement;
    const bad = [!name.value.trim() && name, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) && email].filter(Boolean) as HTMLInputElement[];
    bad.forEach((i) => i.classList.add('is-bad'));
    if (bad.length) { note.textContent = bad.includes(name) ? 'I’d love your name, and an email to reply to.' : 'That email doesn’t look quite right.'; note.classList.add('is-bad'); bad[0].focus(); return; }
    btn.disabled = true; note.classList.remove('is-bad'); note.textContent = 'Sending…';
    try {
      const r = await fetch('/api/hire', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: clean(draft), unsure: draft.unsure, name: name.value, email: email.value, org: field('org'), link: field('link'),
          message: field('message'), budget: field('budget'), website: field('website'), ms: Date.now() - openedAt, page: location.pathname,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      try { localStorage.removeItem('hdj:hire'); } catch {}
      form.querySelectorAll<HTMLElement>('[data-step="you"] .hire-fields, [data-step="you"] .hire-send').forEach((el) => (el.hidden = true));
      done.hidden = false; showSum();
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      btn.disabled = false; note.classList.add('is-bad');
      note.innerHTML = 'That didn’t send. Email me at <a href="mailto:derekj@hey.com">derekj@hey.com</a> and I’ll take it from there.';
    }
  });
  done.querySelector('[data-print]')!.addEventListener('click', () => window.print());

  // Copy my email
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    if (await copyText(b.dataset.copy!)) toast('Email copied');
  }));

  // A service named in the address (/hire/#site) starts picked
  const fromHash = location.hash.slice(1) as ServiceId;
  if (SERVICES.some((s) => s.id === fromHash) && !draft.services.includes(fromHash)) toggleService(fromHash, true);
  paint();
}
