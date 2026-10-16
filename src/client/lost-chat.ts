/**
 * The 404 page as a chat with me (pages/404.astro). I say what I couldn't find, offer the pages
 * that best match the broken address, then answer quick replies or anything typed: words search the
 * site (/search.json, the bar's index), and a few commands do things (/help lists them). "Leave a
 * note" sends the next message to me through /api/note, like the signature's note card.
 */
type Item = { k: string; t: string; h: string; y: string; x?: 1; s: string };

const box = document.querySelector<HTMLElement>('.lost');
const thread = document.getElementById('lostThread');
const chips = document.getElementById('lostChips');
const form = document.getElementById('lostForm') as HTMLFormElement | null;
const input = document.getElementById('lostText') as HTMLInputElement | null;
if (box && thread && chips && form && input) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const photo = box.dataset.photo ?? '';
  let index: Promise<Item[]> | null = null;
  const load = () => (index ??= fetch('/search.json').then((r) => r.json()).catch(() => []));
  const wait = (ms: number) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
  const scroll = () => { thread.scrollTop = thread.scrollHeight; };
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  let noting = 0; // when note mode started, or 0
  let lastStatus: HTMLElement | null = null;

  // ---- Bubbles
  function me(html: string) {
    const p = document.createElement('p'); p.className = 'lost__msg is-me';
    p.innerHTML = `<img class="lost__face sq" src="${photo}" alt="" /><span class="lost__bubble">${html}</span>`;
    thread!.append(p); scroll();
  }
  function you(text: string) {
    lastStatus?.remove();
    const p = document.createElement('p'); p.className = 'lost__msg is-you';
    const b = document.createElement('span'); b.className = 'lost__bubble'; b.textContent = text; p.append(b);
    thread!.append(p);
    lastStatus = document.createElement('span'); lastStatus.className = 'lost__status'; lastStatus.textContent = 'Delivered';
    thread!.append(lastStatus); scroll();
  }
  const ARROW = '<svg class="icon" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 4H12V10.5"/><path d="M11.5 4.5L4 12"/></svg>';
  function links(items: { t: string; h: string; sub: string; ext?: boolean }[]) {
    const d = document.createElement('div'); d.className = 'lost__links';
    d.innerHTML = items.map((i) => `<a class="lost__link sq" href="${esc(i.h)}"${i.ext ? ' target="_blank" rel="noopener"' : ''}><b>${esc(i.t)}</b><small>${esc(i.sub)}</small>${ARROW}</a>`).join('');
    thread!.append(d); scroll();
  }
  // I "type" for a moment before each reply, longer for longer messages
  async function say(html: string, extra?: () => void) {
    if (lastStatus) lastStatus.textContent = 'Read';
    const t = document.createElement('p'); t.className = 'lost__msg is-me lost__typing';
    t.innerHTML = `<img class="lost__face sq" src="${photo}" alt="" /><span class="lost__bubble" aria-label="Derek is typing"><i></i><i></i><i></i></span>`;
    thread!.append(t); scroll();
    await wait(Math.min(1300, 450 + html.replace(/<[^>]+>/g, '').length * 12));
    t.remove(); me(html); extra?.();
    await wait(120);
  }
  function offer(list: string[]) {
    chips!.innerHTML = list.map((c) => `<button type="button">${esc(c)}</button>`).join('');
  }
  const MENU = ['Home', 'Latest writing', 'Work', 'Projects', 'About', 'Leave a note'];

  // ---- Finding things
  const STOP = new Set(['the', 'and', 'for', 'with', 'www', 'html', 'php', 'index', 'page', 'posts', 'post', 'work', 'p', 'a', 'of', 'to', 'in', 'my', 'is']);
  const words = (s: string) => s.toLowerCase().replace(/\.[a-z]{2,4}$/, '').split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w));
  function rank(all: Item[], q: string[]) {
    return all.map((it) => {
      const t = it.t.toLowerCase();
      const score = q.reduce((n, w) => n + (t.includes(w) ? 3 : 0) + (it.s.includes(w) ? 1 : 0) + (w.length > 4 && !it.s.includes(w) && it.s.includes(w.slice(0, -1)) ? 0.5 : 0), 0);
      return { it, score };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((r) => r.it);
  }
  const card = (it: Item) => ({ t: it.t, h: it.h, sub: [it.k, it.y].filter(Boolean).join(' · '), ext: Boolean(it.x) });

  // ---- The conversation
  async function intro() {
    const day = document.createElement('span'); day.className = 'lost__day';
    day.textContent = `Today ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    thread!.append(day);
    const path = decodeURIComponent(location.pathname);
    await say(`Hey! I looked everywhere, but there’s nothing at <code>${esc(path)}</code>.`);
    const found = rank(await load(), words(path));
    if (found.length) await say('Were you looking for one of these?', () => links(found.map(card)));
    else await say('It might have moved when I redesigned the site, or the link has a typo.');
    await say('Tell me what you’re after and I’ll look around, or pick one below.');
    offer(MENU);
  }

  async function answer(raw: string) {
    const text = raw.trim(); if (!text) return;
    you(text);
    if (noting) return sendNote(text);
    const cmd = text.toLowerCase().replace(/^\//, '').replace(/[.!?]+$/, '');
    if (/^(help|commands|\?)$/.test(cmd)) {
      return say('Type anything to search the site. A few shortcuts: <code>home</code> <code>writing</code> <code>work</code> <code>projects</code> <code>about</code> <code>note</code> <code>clear</code>');
    }
    if (/^(home|go home|take me home)$/.test(cmd)) { await say('Heading home…'); return void setTimeout(() => { location.href = '/'; }, calm ? 0 : 500); }
    if (/^(clear|reset)$/.test(cmd)) { thread!.innerHTML = ''; lastStatus = null; return intro(); }
    if (/^(latest writing|writing|latest|essays|blog|posts)$/.test(cmd)) {
      const all = await load();
      return say('Here’s what I wrote most recently:', () => links(all.filter((i) => i.k === 'Essay').slice(0, 3).map(card).concat({ t: 'Everything I’ve written', h: '/', sub: 'Home' })));
    }
    if (/^(work|sites|websites|portfolio)$/.test(cmd)) {
      return say('The sites I’ve designed and built, on my own and with studios:', () => links([{ t: 'Sites', h: '/work/', sub: 'Work' }]));
    }
    if (/^(projects|apps|side projects)$/.test(cmd)) {
      const apps = (await load()).filter((i) => i.k === 'App');
      return say('My apps live at Testament Made, and every side project since 2008 is in the archive:', () => links([{ t: 'Projects', h: '/projects/', sub: 'Testament Made and the archive' }, ...apps.slice(0, 2).map(card)]));
    }
    if (/^(about|who are you|who is derek)$/.test(cmd)) {
      return say('Self-taught designer in Des Moines. Husband, and a Christian before all of it. The longer story:', () => links([{ t: 'About', h: '/about/', sub: 'My story, in six chapters' }]));
    }
    if (/^(note|leave a note|message|contact)$/.test(cmd)) {
      noting = Date.now(); box!.classList.add('is-noting'); input!.placeholder = 'Your note to Derek…'; offer(['Cancel']);
      return say('Sure! Type your note and hit send. Add your name if you’d like a reply; otherwise it’s anonymous.');
    }
    // Anything else: search
    const found = rank(await load(), words(text));
    if (found.length) return say(found.length === 1 ? 'Found this:' : `Found ${found.length}:`, () => links(found.map(card)));
    return say(`I couldn’t find anything for “${esc(text)}”. Try another word, or pick one below.`);
  }

  async function sendNote(text: string) {
    if (/^\/?cancel$/i.test(text)) { endNote(); return say('No worries. Anything else?'); }
    const ms = Date.now() - noting; endNote();
    try {
      const r = await fetch('/api/note', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: text, name: '', website: '', page: location.pathname, ms }) });
      if (!r.ok) throw new Error(String(r.status));
      await say('Got it, thank you! It’s on its way to me.');
    } catch {
      await say('That didn’t send, sorry. You can always email me at <a href="mailto:derekj@hey.com">derekj@hey.com</a>.');
    }
  }
  function endNote() { noting = 0; box!.classList.remove('is-noting'); input!.placeholder = 'Type to search, or /help'; offer(MENU); }

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; answer(v); });
  chips.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('button'); if (b) answer(b.textContent ?? ''); });
  intro();
}
