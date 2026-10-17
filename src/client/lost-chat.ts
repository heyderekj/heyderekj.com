/**
 * The 404 page as a chat with me (pages/404.astro). I say what I couldn't find, offer the pages
 * that best match the broken address, then answer quick replies or anything typed: a few commands do
 * things (/help lists them), and anything else goes to an AI version of me (/api/chat), falling back to
 * searching the site (/search.json, the bar's index) when that's not available. "Leave a
 * note" sends the next message to me through /api/note, like the signature's note card.
 */
type Item = { k: string; t: string; h: string; y: string; x?: 1; s: string };

const box = document.querySelector<HTMLElement>('.lost');
const thread = document.getElementById('lostThread');
const slash = document.getElementById('lostSlash');
const prompts = document.getElementById('lostPrompts');
const form = document.getElementById('lostForm') as HTMLFormElement | null;
const input = document.getElementById('lostText') as HTMLInputElement | null;
if (box && thread && slash && prompts && form && input) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const photo = box.dataset.photo ?? '';
  let index: Promise<Item[]> | null = null;
  const load = () => (index ??= fetch('/search.json').then((r) => r.json()).catch(() => []));
  const wait = (ms: number) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
  // While you type, your own "typing" bubble sits at the end of the thread
  const yours = document.createElement('p'); yours.className = 'lost__msg lost__typing is-yours'; yours.setAttribute('aria-hidden', 'true');
  yours.innerHTML = '<span class="lost__bubble"><i></i><i></i><i></i></span>';
  const scroll = () => { if (yours.isConnected) thread.append(yours); thread.scrollTop = thread.scrollHeight; relabel(); };
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  let noting = 0; // when note mode started, or 0
  let lastStatus: HTMLElement | null = null;

  // ---- Letter shortcuts: the choices on offer right now (since your last message) get A, B, C…
  // Press the letter (when you're not typing) to pick it; it wins over the site's own letter keys here.
  let keyed = new Map<string, HTMLElement>();
  const textOf = (el: Element) => [...el.childNodes].filter((n) => !(n instanceof Element && n.classList.contains('lost__key'))).map((n) => n.textContent).join('').trim();
  function relabel() {
    document.querySelectorAll('.lost__key').forEach((k) => k.remove());
    keyed = new Map();
    const mine = [...thread!.querySelectorAll('.lost__msg.is-you')].pop();
    const fresh = (el: Element) => !mine || Boolean(mine.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const choices = [
      ...[...thread!.querySelectorAll<HTMLElement>('.lost__link, .lost__egg :is(button, a), .lost__follow button')].filter(fresh),
      ...(prompts && !prompts.hidden ? [...prompts.querySelectorAll<HTMLElement>('.lost__prompt')] : []),
    ].slice(0, 26);
    choices.forEach((el, n) => {
      const letter = String.fromCharCode(65 + n), k = document.createElement('kbd');
      k.className = 'lost__key'; k.textContent = letter; k.setAttribute('aria-hidden', 'true');
      el.prepend(k); el.setAttribute('aria-keyshortcuts', letter);
      keyed.set(letter, el);
    });
  }
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || document.documentElement.classList.contains('four-on')) return;
    const t = e.target; if (t instanceof Element && t.closest('input, textarea, select, [contenteditable]')) return;
    const el = keyed.get(e.key.toUpperCase()); if (!el || !el.isConnected) return;
    e.preventDefault(); e.stopImmediatePropagation(); el.click();
  }, true);

  // ---- Bubbles
  function me(html: string) {
    const p = document.createElement('p'); p.className = 'lost__msg is-me';
    p.innerHTML = `<img class="lost__face sq" src="${photo}" alt="" /><span class="lost__bubble">${html}</span>`;
    thread!.append(p); scroll();
  }
  function you(text: string) {
    yours.remove();
    thread!.querySelector('.lost__follow')?.remove();
    prompts!.hidden = true;
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
    const t = document.createElement('p'); t.className = 'lost__msg is-me lost__typing is-mine';
    t.innerHTML = `<img class="lost__face sq" src="${photo}" alt="" /><span class="lost__bubble" aria-label="Derek is typing"><i></i><i></i><i></i></span>`;
    thread!.append(t); scroll(); box!.classList.add('is-thinking');
    await wait(Math.min(1300, 450 + html.replace(/<[^>]+>/g, '').length * 12));
    t.remove(); box!.classList.remove('is-thinking'); me(html); extra?.();
    await wait(120);
  }
  // Follow-ups under my answer, like an assistant's: three things to ask next, never the one just asked
  const ASKS: [string, string][] = [
    ['Latest writing', 'What have you written?'], ['Work', 'What have you built?'], ['Projects', 'Show me your apps'],
    ['About', 'Who are you?'], ['Play a game', 'Shall we play a game?'], ['Secrets', 'Any secrets?'], ['Leave a note', 'Leave you a note'], ['Home', 'Take me home'],
  ];
  const ASK_OF = Object.fromEntries(ASKS.map(([a, q]) => [q.toLowerCase(), a]));
  const FOLLOW = '<svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3v5.5a2 2 0 0 0 2 2h6.5"/><path d="M10 8l2.5 2.5L10 13"/></svg>';
  let lastAsk = '';
  function offer(list?: string[]) {
    thread!.querySelector('.lost__follow')?.remove();
    const items = list ? list.map((a) => [a, a] as [string, string]) : ASKS.filter(([a]) => a !== lastAsk).slice(0, 3);
    const d = document.createElement('div'); d.className = 'lost__follow'; d.setAttribute('aria-label', 'Ask next');
    d.innerHTML = `<span>${list ? '' : 'Ask next'}</span>` + items.map(([, q]) => `<button type="button">${FOLLOW}${esc(q)}</button>`).join('');
    thread!.append(d); scroll();
  }

  // ---- The cheat sheet: every easter egg, with the keys, and a Try for the ones that can go off here
  const EGGS: { keys: string; name: string; what: string; tryit?: 'blueprint' | 'konami' | 'play'; href?: string }[] = [
    { keys: '<kbd>Play</kbd>', name: 'Shall we play a game?', what: 'Connect Four against Leroy, Lilo, Kiya or Irma, right up top. Then make a card of it to share. From any other page, type joshua.', tryit: 'play' },
    { keys: '<kbd>B</kbd>', name: 'Blueprint mode', what: 'The whole site as a cyanotype on graph paper. B again to go back.', tryit: 'blueprint' },
    { keys: '<kbd>↑</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><kbd>←</kbd><kbd>→</kbd>', name: 'Orange mode', what: 'My favorite color, with a fanfare.', tryit: 'konami' },
    { keys: '<kbd>Click ×3</kbd>', name: 'Leave me a note', what: 'Triple-click my signature at the top of any page. One click goes home.' },
    { keys: '<kbd>Tap ×4</kbd>', name: 'Count me in', what: 'Tap the gear in the bar four times, in time, for a drum fill.' },
    { keys: '<kbd>⌥⌘I</kbd>', name: 'A note in the console', what: 'For whoever opens devtools.' },
  ];
  function sheet() {
    const d = document.createElement('div'); d.className = 'lost__sheet';
    d.innerHTML = EGGS.map((e) => `<div class="lost__egg"><span class="lost__keys">${e.keys}</span><span class="lost__eggtext"><b>${e.name}</b><small>${e.what}</small></span>${e.tryit ? `<button type="button" data-try="${e.tryit}">Try</button>` : e.href ? `<a href="${e.href}">Go</a>` : ''}</div>`).join('');
    thread!.append(d); scroll();
  }
  thread.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-try]'); if (!b) return;
    if (b.dataset.try === 'play') startGame();
    if (b.dataset.try === 'blueprint') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' })); // client/blueprint.ts
    // Play the Konami code for you (client/easter-egg.ts listens for it)
    if (b.dataset.try === 'konami') ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'].forEach((key) => document.dispatchEvent(new KeyboardEvent('keydown', { key })));
  });

  function startGame() { document.dispatchEvent(new CustomEvent('four:start')); } // client/four.ts

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
    await say('Hey! I looked everywhere for that page, but it’s not here.');
    const found = rank(await load(), words(path));
    if (found.length) await say('Were you looking for one of these?', () => links(found.map(card)));
    else await say('It might have moved when I redesigned the site, or the link has a typo.');
    await say('Tell me what you’re after and I’ll look around, or start with one of these.');
    prompts!.hidden = false; requestAnimationFrame(scroll);
  }

  async function answer(raw: string) {
    const text = raw.trim(); if (!text) return;
    you(text);
    if (noting) return sendNote(text);
    const asked = ASK_OF[text.toLowerCase()] ?? text;
    lastAsk = ASKS.find(([a]) => a === asked)?.[0] ?? '';
    const cmd = asked.toLowerCase().replace(/^\//, '').replace(/[.!?]+$/, '');
    if (/^(help|commands|\?)$/.test(cmd)) {
      return say('Ask me anything, about my work, my writing, or me. Or type <code>/</code> for shortcuts: home, writing, work, projects, about, play, secrets, note and clear.');
    }
    if (/^(home|go home|take me home)$/.test(cmd)) { await say('Heading home…'); return void setTimeout(() => { location.href = '/'; }, calm ? 0 : 500); }
    if (/^(clear|reset)$/.test(cmd)) { thread!.innerHTML = ''; lastStatus = null; lastAsk = ''; return intro(); }
    if (/^(latest writing|writing|latest|essays|blog|posts)$/.test(cmd)) {
      const all = await load();
      return say('Here’s what I wrote most recently:', () => links(all.filter((i) => i.k === 'Post').slice(0, 3).map(card).concat({ t: 'Everything I’ve written', h: '/', sub: 'Home' })));
    }
    if (/^(work|sites|websites|portfolio)$/.test(cmd)) {
      return say('The sites I’ve designed and built, on my own and with studios:', () => links([{ t: 'Sites', h: '/work/', sub: 'Work' }]));
    }
    if (/^(hire|hire me|work with me|freelance|freelancing|pricing|prices|rates|services|estimate|quote)$/.test(cmd)) {
      return say('I take on projects of my own as Derek J Design: sites, logos, rebrands, feedback and AI workflows. You can see what it’d cost right away:', () => links([{ t: 'Work with me', h: '/hire/', sub: 'Services and a live estimate' }]));
    }
    if (/^(projects|apps|side projects)$/.test(cmd)) {
      const apps = (await load()).filter((i) => i.k === 'App');
      return say('My apps live at Testament Made, and every side project since 2008 is in the archive:', () => links([{ t: 'Projects', h: '/projects/', sub: 'Testament Made and the archive' }, ...apps.slice(0, 2).map(card)]));
    }
    if (/^(about|who are you|who is derek)$/.test(cmd)) {
      return say('Self-taught designer in Des Moines. Husband, and a Christian before all of it. The longer story:', () => links([{ t: 'About', h: '/about/', sub: 'My story, in six chapters' }]));
    }
    if (/^(secrets?|easter eggs?|eggs|cheats?|cheat sheet|cheat codes?)$/.test(cmd)) {
      await say('Shh. Here’s every easter egg on the site:', sheet);
      return say('The first three work right here.');
    }
    if (/^(play|game|play a game|shall we play a game|connect four|connect 4)$/.test(cmd)) {
      await say('Shall we? One of the animals is waiting up top. You’re orange.');
      return startGame();
    }
    if (/^(note|leave a note|message|contact)$/.test(cmd)) {
      noting = Date.now(); box!.classList.add('is-noting'); input!.placeholder = 'Your note to Derek…';
      await say('Sure! Type your note and hit send. Add your name if you’d like a reply; otherwise it’s anonymous.');
      return offer(['Cancel']);
    }
    // Anything else: I answer, as myself (functions/api/chat.ts, Claude with my voice); without it, search
    const reply = await ask(text);
    if (reply) return;
    const found = rank(await load(), words(text));
    if (found.length) return say(found.length === 1 ? 'Found this:' : `Found ${found.length}:`, () => links(found.map(card)));
    return say(`I couldn’t find anything for “${esc(text)}”. Try another word, or pick one below.`);
  }

  // ---- Talking: free-typed messages go to the AI version of me, with the conversation so far
  const log: { role: 'user' | 'assistant'; content: string }[] = [];
  // Its Markdown links become real links (only to this site, or https); everything else stays text
  // and a bare site path that ends in a slash (/hire/, /posts/…/) does too; commands like /note stay text
  const md = (s: string) => esc(s)
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, (_, t, h) => `<a href="${h}"${h.startsWith('/') ? '' : ' target="_blank" rel="noopener"'}>${t}</a>`)
    .replace(/(^|[\s(])(\/(?:[a-z0-9][a-z0-9-]*\/)+)(?=[\s.,!?)]|$)/g, (_, pre, h) => `${pre}<a href="${h}">${h}</a>`)
    .replace(/\n+/g, '<br>');
  async function ask(text: string) {
    log.push({ role: 'user', content: text });
    if (lastStatus) lastStatus.textContent = 'Read';
    const t = document.createElement('p'); t.className = 'lost__msg is-me lost__typing is-mine';
    t.innerHTML = `<img class="lost__face sq" src="${photo}" alt="" /><span class="lost__bubble" aria-label="Derek is typing"><i></i><i></i><i></i></span>`;
    thread!.append(t); scroll(); box!.classList.add('is-thinking');
    let reply = '';
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: log }) });
      if (r.ok || r.status === 429) reply = ((await r.json()) as { reply?: string }).reply ?? '';
    } catch { /* fall back to search */ }
    t.remove(); box!.classList.remove('is-thinking');
    if (!reply) { log.pop(); return ''; }
    log.push({ role: 'assistant', content: reply });
    me(md(reply)); await wait(120);
    return reply;
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
  function endNote() { noting = 0; box!.classList.remove('is-noting'); input!.placeholder = 'Message, or / for shortcuts'; }

  async function reply(v: string) { await answer(v); if (!noting && prompts!.hidden && !thread!.querySelector('.lost__follow')) offer(); }
  thread.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('.lost__follow button'); if (b) reply(textOf(b)); });
  prompts.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-ask]'); if (b) reply(b.querySelector('b')?.textContent?.trim() || b.dataset.ask!); });

  // ---- Slash shortcuts: type / for a little menu above the field (arrows and Enter, or click)
  const SHORTCUTS = [
    ['home', 'Go to the home page'], ['writing', 'What I wrote most recently'], ['work', 'Sites I’ve designed and built'], ['hire', 'Work with me, and what it costs'],
    ['projects', 'Apps and side projects'], ['about', 'My story'], ['play', 'Connect Four with the animals'], ['secrets', 'Every easter egg on the site'], ['note', 'Leave me a note'], ['clear', 'Start over'], ['help', 'What I can do here'],
  ];
  let picks: string[][] = [], at = 0;
  function menu() {
    const v = input!.value;
    picks = v.startsWith('/') && !noting ? SHORTCUTS.filter(([c]) => c.startsWith(v.slice(1).toLowerCase())) : [];
    at = Math.min(at, Math.max(0, picks.length - 1));
    slash!.hidden = !picks.length; input!.setAttribute('aria-expanded', String(!slash!.hidden));
    slash!.innerHTML = picks.map(([c, d], i) => `<li role="option" id="slash-${c}" aria-selected="${i === at}" data-cmd="${c}"><code>/${c}</code><span>${d}</span></li>`).join('');
    if (picks[at]) input!.setAttribute('aria-activedescendant', `slash-${picks[at][0]}`); else input!.removeAttribute('aria-activedescendant');
  }
  input.addEventListener('input', () => {
    at = 0; menu();
    const typing = input.value.trim().length > 0 && !input.value.startsWith('/');
    if (typing && !yours.isConnected) { thread.append(yours); scroll(); } else if (!typing) yours.remove();
  });
  input.addEventListener('blur', () => { if (!input.value.trim()) yours.remove(); });
  input.addEventListener('keydown', (e) => {
    if (slash.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); at = (at + (e.key === 'ArrowDown' ? 1 : -1) + picks.length) % picks.length; menu(); }
    if (e.key === 'Tab') { e.preventDefault(); input.value = `/${picks[at][0]}`; menu(); }
    if (e.key === 'Escape') { input.value = ''; menu(); }
  });
  slash.addEventListener('pointerdown', (e) => { const li = (e.target as HTMLElement).closest<HTMLElement>('[data-cmd]'); if (!li) return; e.preventDefault(); input.value = ''; menu(); reply(`/${li.dataset.cmd}`); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = !slash.hidden && picks[at] ? `/${picks[at][0]}` : input.value;
    input.value = ''; menu(); reply(v);
  });
  // The 404's dots, thinking like WOPR in WarGames: orange lights blink on and off at random across the
  // unlit dots, one at a time, while the page is on screen
  const lights = [...document.querySelectorAll<HTMLElement>('.lost-404 i:not(.on)')];
  if (lights.length && !calm) {
    const blink = () => {
      if (!document.hidden) for (let n = 0; n < 1; n++) {
        const dot = lights[Math.floor(Math.random() * lights.length)];
        if (dot.classList.contains('wopr')) continue;
        dot.classList.add('wopr');
        setTimeout(() => dot.classList.remove('wopr'), 500 + Math.random() * 700);
      }
      setTimeout(blink, 450 + Math.random() * 700);
    };
    setTimeout(blink, 1200); // after the 404 lights up
  }
  const pathEl = document.getElementById('lostPath'); if (pathEl) pathEl.textContent = decodeURIComponent(location.pathname);
  intro();
}
