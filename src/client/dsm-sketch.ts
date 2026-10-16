// @ts-nocheck: canvas drawing code ported from the prototype; types would add noise, not safety.
/**
 * The Des Moines chip's card (components/site/Hello.astro): an architect's elevation of downtown from
 * across the river, drawn for the real hour, season and weather. Pen lines run a little past their
 * corners and the shadow side is hatched, printed as a cyanotype: white lines on Prussian blue. Each time
 * the card opens, the ink draws itself in and the print comes up behind it.
 * Weather comes from Open-Meteo (no key), fetched the first time the card opens and kept 15 minutes.
 */
const $ = (s) => document.querySelector(s);
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const DSM = () => { if (window.__dsmHour != null) return window.__dsmHour; const [h, m] = new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit', hour12: false }).split(':').map(Number); return h + m / 60; };
function tickTime() { const el = $('#dsmTime'); if (el) el.textContent = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
// Sky colours through the day: [hour, top, middle, horizon, star amount, light colour]
const SKY = [
  [0, '#060b1d', '#0f1a3a', '#22325c', 1, '#cfd8ff'],
  [5.6, '#0f1838', '#33406e', '#8a6f8f', 0.6, '#ffd2b0'],
  [6.8, '#3d5a9a', '#c48aa0', '#ffb98a', 0.1, '#ffd29a'],
  [8.3, '#3f86d6', '#86b9ea', '#d6e8f7', 0, '#fff3d6'],
  [13, '#3b7fd1', '#7fb3e8', '#d3e6f7', 0, '#ffffff'],
  [16.6, '#4a7fc4', '#a0b6d8', '#f1d9b8', 0, '#ffe6bf'],
  [18.1, '#2e3f78', '#b06a7e', '#ff9d6b', 0.15, '#ffbc8a'],
  [19.2, '#121c45', '#3b3870', '#7a5a7c', 0.6, '#e9d6ff'],
  [20.4, '#070d22', '#111c3d', '#253460', 1, '#cfd8ff'],
  [24, '#060b1d', '#0f1a3a', '#22325c', 1, '#cfd8ff'],
];
const hex = (c) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
function skyAt(h) {
  let i = SKY.findIndex((k, n) => h >= k[0] && h < SKY[n + 1]?.[0]); if (i < 0) i = 0;
  const A = SKY[i], B = SKY[i + 1] || A, t = (h - A[0]) / Math.max(0.01, B[0] - A[0]);
  return { top: mix(A[1], B[1], t), mid: mix(A[2], B[2], t), low: mix(A[3], B[3], t), stars: A[4] + (B[4] - A[4]) * t, light: mix(A[5], B[5], t) };
}
// The Des Moines card: an architect's elevation of downtown from across the river, for the real hour, season and weather.
// Pen lines run a little past their corners and the shadow side is hatched, in white on a cyanotype blue.
// When the card opens the ink draws itself in, then the print comes up behind it.
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
let seed = 7; const rnd = rng(seed);
const hexOf = (c) => c[0] === '#' ? c : '#' + c.match(/\d+/g).map(n => (+n).toString(16).padStart(2, '0')).join('');
const mx = (a, b, t) => mix(hexOf(a), hexOf(b), t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function deform(pts, times, v, R) {
  for (let t = 0; t < times; t++) {
    const out = [];
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), g = (R() + R() + R() - 1.5) * v * len, ang = R() * 6.283;
      out.push(a, [(a[0] + b[0]) / 2 + Math.cos(ang) * g, (a[1] + b[1]) / 2 + Math.sin(ang) * g]);
    });
    pts = out;
  }
  return pts;
}
function trace(c, p) {
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], s = m(p[p.length - 1], p[0]);
  c.beginPath(); c.moveTo(s[0], s[1]); p.forEach((a, i) => { const q = m(a, p[(i + 1) % p.length]); c.quadraticCurveTo(a[0], a[1], q[0], q[1]); }); c.closePath();
}
// A watercolour dab: thin layers of a slightly different shape each time
function dab(c, pts, color, { layers = 8, alpha = 0.1, v = 0.3, seed = 1 } = {}) {
  const R = rng(seed * 9973 + 11), shape = deform(pts, 2, v, R);
  c.save(); c.fillStyle = color;
  for (let i = 0; i < layers; i++) { trace(c, deform(shape, 2, v * 0.8, R)); c.globalAlpha = alpha; c.fill(); }
  c.restore();
}
const oval = (cx, cy, rx, ry, n = 12) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.283) * rx, cy + Math.sin(i / n * 6.283) * ry]);
const along = (x0, y0, x1, y1, bend = 0, step = 2) => { const len = Math.hypot(x1 - x0, y1 - y0) || 1, n = Math.max(2, Math.ceil(len / step)), nx = -(y1 - y0) / len, ny = (x1 - x0) / len; return Array.from({ length: n + 1 }, (_, i) => { const f = i / n, b = Math.sin(f * Math.PI) * bend; return [x0 + (x1 - x0) * f + nx * b, y0 + (y1 - y0) * f + ny * b]; }); };
// A brush stroke: a pale body with bristle marks over it that thin out and break up as the brush runs dry
function brush(c, pts, width, color, { alpha = 0.35, bristles = 16, seed = 1, dry = 0.35 } = {}) {
  const R = rng(seed * 7919 + 3), n = pts.length - 1;
  const nrm = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  const taper = (f) => 0.45 + 0.55 * Math.sqrt(Math.sin(f * Math.PI));
  c.save(); c.fillStyle = c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round';
  c.globalAlpha = alpha * 0.32; c.beginPath();
  pts.forEach((p, i) => { const w = width / 2 * taper(i / n) * 0.9; i ? c.lineTo(p[0] + nrm[i][0] * w, p[1] + nrm[i][1] * w) : c.moveTo(p[0] + nrm[i][0] * w, p[1] + nrm[i][1] * w); });
  for (let i = n; i >= 0; i--) { const w = width / 2 * taper(i / n) * 0.9; c.lineTo(pts[i][0] - nrm[i][0] * w, pts[i][1] - nrm[i][1] * w); }
  c.closePath(); c.fill();
  for (let b = 0; b < bristles; b++) {
    const off = (b / (bristles - 1) - 0.5) * width * (0.9 + R() * 0.2), start = R() * 0.1, end = 1 - R() * dry * 0.5;
    c.lineWidth = 0.5 + R() * 1.3; c.globalAlpha = alpha * (0.35 + R() * 0.65);
    c.beginPath(); let down = false;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      if (f < start || f > end || R() < dry * f * 0.18) { down = false; continue; }
      const x = pts[i][0] + nrm[i][0] * off * taper(f), y = pts[i][1] + nrm[i][1] * off * taper(f);
      down ? c.lineTo(x, y) : c.moveTo(x, y); down = true;
    }
    c.stroke();
  }
  c.restore();
}
// Pen lines are kept as data so they can be drawn in, in order, when the card opens
function pen(L, x0, y0, x1, y1, o = {}) {
  const R = o.R || rnd, over = o.over ?? 1.8, len = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  const a = over * (0.3 + R() * 0.9), b = over * (0.3 + R() * 0.9), bow = (R() - 0.5) * (o.wobble ?? 0.6) * Math.min(1, len / 30);
  const sx = x0 - ux * a, sy = y0 - uy * a, ex = x1 + ux * b, ey = y1 + uy * b, n = Math.max(2, Math.ceil(len / 3));
  const pts = Array.from({ length: n + 1 }, (_, i) => { const f = i / n, w = Math.sin(f * Math.PI) * bow; return [sx + (ex - sx) * f - uy * w, sy + (ey - sy) * f + ux * w]; });
  L.push({ pts, w: o.w ?? 0.6, a: o.a ?? 0.85, len: len + a + b });
}
function penPath(L, pts, o = {}) { let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push({ pts, w: o.w ?? 0.6, a: o.a ?? 0.85, len }); }
function drawLines(c, L, ink, upto = Infinity) {
  c.save(); c.strokeStyle = c.fillStyle = ink; c.lineCap = 'round'; c.lineJoin = 'round';
  let acc = 0;
  for (const l of L) {
    if (acc >= upto) break;
    const part = Math.min(1, (upto - acc) / l.len); acc += l.len;
    if (l.text) { c.globalAlpha = l.a * part; c.font = l.font; c.textAlign = l.align || 'left'; if ('letterSpacing' in c) c.letterSpacing = '0.7px'; c.fillText(l.text, l.x, l.y); continue; }
    const n = l.pts.length - 1, m = part * n, k = Math.floor(m);
    c.globalAlpha = l.a; c.lineWidth = l.w; c.beginPath();
    for (let i = 0; i <= k; i++) i ? c.lineTo(l.pts[i][0], l.pts[i][1]) : c.moveTo(l.pts[i][0], l.pts[i][1]);
    if (k < n) { const f = m - k, a = l.pts[k], b = l.pts[k + 1]; c.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); }
    c.stroke();
  }
  c.restore();
}
// A tree the way architects draw them: a loose scribble of loops
function scribble(R, cx, cy, r, loops = 5) {
  const n = loops * 14; let a = R() * 6.28;
  return Array.from({ length: n + 1 }, (_, i) => { a += 0.45 + R() * 0.2; const f = i / n, rr = r * (0.3 + R() * 0.14), x = cx + (f - 0.5) * r * 1.05 + Math.sin(f * 9) * r * 0.12, y = cy + Math.cos(f * 7 + 1) * r * 0.26; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9]; });
}

// Everything is drawn in a 248 × 150 design space and scaled to the canvas
const DW = 248, DH = 150, DATUM = 106, SHORE = 135;
const sheet = (W, H, dpr) => { const s = document.createElement('canvas'); s.width = Math.round(W * dpr); s.height = Math.round(H * dpr); const c = s.getContext('2d'); c.setTransform(dpr * W / DW, 0, 0, dpr * H / DH, 0, 0); return [s, c]; };

// Weather, from Open-Meteo's WMO code (see fetchWeather below). `clouds` is how many drift across.
const WX = [
  { id: 'clear', label: 'Clear', temp: 61, clouds: 1, grey: 0 },
  { id: 'partly', label: 'Partly cloudy', temp: 54, clouds: 3, grey: 0 },
  { id: 'overcast', label: 'Overcast', temp: 49, clouds: 5, grey: 0.5, stratus: 1 },
  { id: 'rain', label: 'Light rain', temp: 47, clouds: 5, grey: 0.58, stratus: 1, rain: 40 },
  { id: 'storm', label: 'Thunderstorms', temp: 66, clouds: 5, grey: 0.72, stratus: 1, rain: 80, storm: 1 },
  { id: 'fog', label: 'Fog', temp: 43, clouds: 0, grey: 0.6, fog: 1 },
  { id: 'snow', label: 'Light snow', temp: 29, clouds: 4, grey: 0.45, stratus: 1, snow: 55 },
];
let wxI = 1; // partly cloudy until the real weather arrives
const SEASON = () => { if (window.__dsmSeason) return window.__dsmSeason; const m = +new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'numeric' }); return m <= 2 || m === 12 ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? 'summer' : 'autumn'; };

// Downtown from the south bank, left to right: low blocks, the Hub Tower, Principal, 801 Grand, the Ruan Center, EMC, then the Capitol on its hill
const TOWERS = [[10, 12, 12], [22, 10, 19], [32, 9, 15], [41, 13, 34, 'hub'], [54, 20, 43, 'principal'], [74, 9, 22], [83, 15, 56, '801'], [99, 15, 46, 'ruan'], [115, 14, 33, 'emc'], [130, 11, 26], [142, 15, 17], [158, 10, 12]];
function towerPts([x, w, h, kind]) {
  const t = DATUM - h, r = x + w, c = x + w / 2, B = DATUM;
  if (kind === '801') return [[x, B], [x, t], [c - 0.5, t - 7.5], [c, t - 15], [c + 0.5, t - 7.5], [r, t], [r, B]];
  if (kind === 'principal') return [[x, B], [x, t + 5], [x + 7, t + 5], [x + 7, t], [r - 3, t], [r - 3, t + 2], [r, t + 2], [r, B]];
  if (kind === 'ruan') return [[x, B], [x, t], [r - 4, t], [r - 4, t + 3], [r, t + 3], [r, B]];
  if (kind === 'emc') return [[x, B], [x, t + 5], [c, t], [r, t + 5], [r, B]];
  if (kind === 'hub') return [[x, B], [x, t], [x + 3, t], [x + 3, t - 3], [r - 3, t - 3], [r - 3, t], [r, t], [r, B]];
  return [[x, B], [x, t], [r, t], [r, B]];
}
const FAR = Array.from({ length: 12 }, (_, i) => [8 + i * 13 + rnd() * 4, 8 + rnd() * 8, 6 + rnd() * 14]);
const STARS = Array.from({ length: 30 }, () => ({ x: 0.04 + rnd() * 0.92, y: 0.06 + rnd() * 0.4, p: rnd() * 6.28, s: 0.4 + rnd() * 1.2 }));
const CLOUDS = Array.from({ length: 5 }, (_, n) => ({ x: rnd(), y: 0.08 + rnd() * 0.26, w: 0.16 + rnd() * 0.12, depth: 0.4 + (n % 3) * 0.3 }));
const DROPS = Array.from({ length: 80 }, () => ({ x: rnd(), y: rnd(), l: 4 + rnd() * 4, s: 110 + rnd() * 60 }));
const FLAKES = Array.from({ length: 55 }, () => ({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 0.7, s: 7 + rnd() * 8, w: 0.5 + rnd(), p: rnd() * 6.28 }));
const RIPPLES = Array.from({ length: 7 }, (_, r) => { const segs = []; let x = 8 + rnd() * 10; while (x < DW - 12) { const w = 4 + rnd() * 16; segs.push([x, Math.min(DW - 8, x + w)]); x += w + 4 + rnd() * 14; } return { y: DATUM + 5 + r * 3.9, segs }; });
const BOLT = (() => { const R = rng(5), p = [[168, 12]]; while (p[p.length - 1][1] < 76) { const [x, y] = p[p.length - 1]; p.push([x + (R() - 0.55) * 9, y + 5 + R() * 7]); } return p; })();
let skyRAF = null;

function paintScene(W, H, dpr, h, k, wx, season) {
  const night = k.stars > 0.55, day = h >= 7.25 && h < 18.5, dusk = !day || h < 8.3 || h > 17.3, veiled = wx.stratus || wx.fog;
  // A cyanotype: white lines on Prussian blue that deepens through the evening and greys under cloud
  const paper = mx(night ? '#0b1a3a' : dusk ? '#173a74' : '#1d4b8c', '#3a4658', wx.grey * 0.5), ink = '#eef3fb';
  const p = day ? (h - 7.25) / 11.25 : ((h < 7.25 ? h + 24 : h) - 18.5) / 12.75;
  const ox = 22 + p * 204, oy = DATUM - 6 - Math.sin(p * Math.PI) * 74, shadowRight = ox < 124;

  // The print: uneven where the light hit it, brightest around the sun or moon, darker toward the near bank
  const [paint, w] = sheet(W, H, dpr);
  const TREES = [[20, 126, 12], [38, 131, 8], [226, 125, 13], [243, 132, 8]];
  // A blueprint: the print is uneven where the light hit it, brightest around the sun or moon
  const Rb = rng(77); for (let i = 0; i < 14; i++) dab(w, oval(Rb() * DW, Rb() * DH, 20 + Rb() * 40, 10 + Rb() * 20), Rb() < 0.5 ? '#ffffff' : '#000a22', { layers: 4, alpha: 0.012, v: 0.4, seed: 700 + i });
  if (!wx.stratus) { const g = w.createRadialGradient(ox, oy, 0, ox, oy, 70); g.addColorStop(0, 'rgba(190,220,255,0.32)'); g.addColorStop(1, 'rgba(190,220,255,0)'); w.fillStyle = g; w.fillRect(0, 0, DW, DH); }
  const gr = w.createLinearGradient(0, DATUM, 0, DH); gr.addColorStop(0, 'rgba(0,10,40,0)'); gr.addColorStop(1, 'rgba(0,10,40,0.22)'); w.fillStyle = gr; w.fillRect(0, DATUM, DW, DH - DATUM);

  // Ink, in the order it gets drawn: the sheet border, the datum, guides, the sun, the city, the Capitol, the water, trees and labels
  const L = [], Rp = rng(500), P = (x0, y0, x1, y1, o = {}) => pen(L, x0, y0, x1, y1, { R: Rp, ...o });
  P(6, 6, DW - 6, 6, { over: 3, w: 0.45, a: 0.45 }); P(DW - 6, 6, DW - 6, DH - 6, { over: 3, w: 0.45, a: 0.45 }); P(DW - 6, DH - 6, 6, DH - 6, { over: 3, w: 0.45, a: 0.45 }); P(6, DH - 6, 6, 6, { over: 3, w: 0.45, a: 0.45 });
  P(10, DATUM, DW - 10, DATUM, { over: 4, w: 0.75, wobble: 0.3 });
  P(70, DATUM - 56, 112, DATUM - 56, { over: 6, w: 0.3, a: 0.2, wobble: 0.1 }); P(83, DATUM - 76, 83, DATUM - 50, { over: 2, w: 0.3, a: 0.18, wobble: 0.1 }); P(98, DATUM - 70, 98, DATUM - 50, { over: 2, w: 0.3, a: 0.18, wobble: 0.1 });
  if (!wx.stratus) {
    if (day) { const a0 = Rp() * 6.28; penPath(L, Array.from({ length: 23 }, (_, i) => [ox + Math.cos(a0 + i / 22 * 6.1) * 5, oy + Math.sin(a0 + i / 22 * 6.1) * 5]), { w: 0.55, a: 0.8 }); if (!veiled) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2; P(ox + Math.cos(a) * 7.5, oy + Math.sin(a) * 7.5, ox + Math.cos(a) * 10, oy + Math.sin(a) * 10, { over: 0.2, w: 0.45, a: 0.65 }); } }
    else { penPath(L, Array.from({ length: 23 }, (_, i) => [ox + Math.cos(i / 22 * 6.283) * 4.6, oy + Math.sin(i / 22 * 6.283) * 4.6]), { w: 0.55, a: 0.85 }); penPath(L, Array.from({ length: 12 }, (_, i) => [ox + 1.6 + Math.cos(-1.9 + i / 11 * 3.8) * 3.8, oy + Math.sin(-1.9 + i / 11 * 3.8) * 3.8]), { w: 0.45, a: 0.6 }); }
  }
  FAR.forEach(([x, wd, hh]) => { P(x, DATUM, x, DATUM - hh, { w: 0.35, a: 0.3, over: 1 }); P(x, DATUM - hh, x + wd, DATUM - hh, { w: 0.35, a: 0.3, over: 1 }); });
  TOWERS.forEach((tw, i) => {
    const [x, wd, hh] = tw, pts = towerPts(tw), Rt = rng(100 + i), t = DATUM - hh;
    for (let j = 0; j < pts.length - 1; j++) pen(L, pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], { R: Rt, w: 0.65, over: 1.6 });
    if (hh > 25) {
      for (let fy = t + 5; fy < DATUM - 2; fy += 4) pen(L, x + 1.4, fy, x + wd - 1.4, fy, { R: Rt, w: 0.32, a: night ? 0.25 : 0.3, over: 0, wobble: 0.15 });
      [1 / 3, 2 / 3].forEach(f => pen(L, x + wd * f, t + 4, x + wd * f, DATUM - 1, { R: Rt, w: 0.3, a: 0.2, over: 0, wobble: 0.15 }));
    }
    if (hh > 12) { const sw = wd * 0.3, sx = shadowRight ? x + wd - sw : x; for (let y = t + 2; y + sw * 0.7 < DATUM - 0.5; y += 2.3) pen(L, sx, y + sw * 0.7, sx + sw, y, { R: Rt, w: 0.35, a: 0.45, over: 0.2, wobble: 0.1 }); }
  });
  // The Capitol: hill, wings, a columned pavilion with its pediment, the drum, the ribbed dome and its lantern, and the four small domes
  const y0 = DATUM - 5;
  penPath(L, along(160, DATUM, 244, DATUM, -5.5, 3), { w: 0.55 });
  [[181, y0, 181, y0 - 8], [181, y0 - 8, 219, y0 - 8], [219, y0 - 8, 219, y0], [193, y0 - 8, 193, y0 - 15], [193, y0 - 15, 209, y0 - 15], [209, y0 - 15, 209, y0 - 8], [192, y0 - 15, 201, y0 - 19], [201, y0 - 19, 210, y0 - 15], [196.5, y0 - 19, 196.5, y0 - 23], [205.5, y0 - 19, 205.5, y0 - 23], [196, y0 - 23, 206, y0 - 23]].forEach(([a, b, c2, d]) => P(a, b, c2, d, { w: 0.55, over: 1.2 }));
  for (let cx = 195; cx <= 207; cx += 2) P(cx, y0 - 14, cx, y0 - 8.5, { w: 0.3, a: 0.55, over: 0, wobble: 0.05 });
  for (let cx = 184; cx <= 216; cx += 3) if (cx < 192 || cx > 210) P(cx, y0 - 7, cx, y0 - 1, { w: 0.3, a: 0.4, over: 0, wobble: 0.05 });
  const domeTop = y0 - 30;
  penPath(L, Array.from({ length: 17 }, (_, i) => [201 - Math.cos(i / 16 * Math.PI) * 5.2, y0 - 23 - Math.sin(i / 16 * Math.PI) * 6.6]), { w: 0.6 });
  [-2.6, 0, 2.6].forEach(dx => penPath(L, Array.from({ length: 9 }, (_, i) => { const f = i / 8; return [201 + dx * Math.cos(f * Math.PI / 2), y0 - 23 - Math.sin(f * Math.PI / 2) * 6.6]; }), { w: 0.32, a: 0.6 }));
  P(200.2, domeTop + 0.6, 200.2, domeTop - 2.6, { w: 0.5, over: 0.2 }); P(201.8, domeTop + 0.6, 201.8, domeTop - 2.6, { w: 0.5, over: 0.2 }); P(201, domeTop - 2.8, 201, domeTop - 5, { w: 0.45, over: 0.3 });
  [[183.5, y0 - 8], [216.5, y0 - 8], [194.5, y0 - 15], [207.5, y0 - 15]].forEach(([cx, cy]) => penPath(L, Array.from({ length: 7 }, (_, i) => [cx - Math.cos(i / 6 * Math.PI) * 1.8, cy - Math.sin(i / 6 * Math.PI) * 2.2]), { w: 0.45 }));
  [[170, DATUM - 3, 2.4], [176, DATUM - 4, 2], [228, DATUM - 3, 2.4], [235, DATUM - 2, 2]].forEach(([x, y, r]) => penPath(L, scribble(Rp, x, y, r, 3), { w: 0.35, a: 0.7 }));
  // Reflections: broken verticals under the towers' edges
  TOWERS.forEach(([x, wd, hh], i) => { if (hh < 20) return; [x, x + wd].forEach(ex => { for (let y = DATUM + 2; y < DATUM + 2 + hh * 0.42; y += 3.4) P(ex + (Rp() - 0.5), y, ex + (Rp() - 0.5), y + 1.6, { w: 0.35, a: 0.28, over: 0, wobble: 0 }); }); });
  // The near bank and its trees
  penPath(L, along(8, SHORE, DW - 8, SHORE + 1, 1.5, 3), { w: 0.55, a: 0.7 });
  for (let i = 0; i < 16; i++) { const gx = 52 + Rp() * 150, gy = SHORE + 3 + Rp() * 6; P(gx, gy, gx + (Rp() - 0.5) * 1.4, gy - 1.6 - Rp() * 1.6, { w: 0.35, a: 0.5, over: 0, wobble: 0 }); }
  TREES.forEach(([x, y, r]) => {
    if (season === 'winter') {
      const branch = (bx, by, ang, len, d) => { const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len; P(bx, by, ex, ey, { w: 0.25 + d * 0.15, a: 0.75, over: 0.2, wobble: 0.3 }); if (d > 0) { branch(ex, ey, ang - 0.45 - Rp() * 0.3, len * 0.68, d - 1); branch(ex, ey, ang + 0.45 + Rp() * 0.3, len * 0.68, d - 1); } };
      branch(x, SHORE + 8, -Math.PI / 2, r * 0.75, 3);
    } else {
      P(x, y + r * 0.35, x - 0.3, SHORE + 8, { w: 0.55, over: 0.3, wobble: 0.3 }); P(x + 1.2, y + r * 0.4, x + 0.9, SHORE + 8, { w: 0.4, a: 0.6, over: 0.3, wobble: 0.3 });
      penPath(L, scribble(Rp, x, y, r, r > 10 ? 6 : 4), { w: 0.4, a: 0.75 });
    }
  });
  // Labels, small and set like notes on a drawing
  const font = '600 5px Figtree, system-ui, sans-serif';
  P(89.5, DATUM - 68, 76, DATUM - 76, { w: 0.35, a: 0.6, over: 0 }); L.push({ text: '801 GRAND', x: 74.5, y: DATUM - 75.2, font, align: 'right', a: 0.75, len: 18 });
  P(199, domeTop - 4, 186, domeTop - 13, { w: 0.35, a: 0.6, over: 0 }); L.push({ text: 'STATE CAPITOL', x: 184.5, y: domeTop - 12.2, font, align: 'right', a: 0.75, len: 18 });
  L.push({ text: 'DES MOINES, IA', x: DW / 2, y: DH - 9.5, font, align: 'center', a: 0.5, len: 14 });
  const total = L.reduce((s, l) => s + l.len, 0);

  // Fog lifts the ink back toward the paper
  let veil = null;
  if (wx.fog) { const [vs, v] = sheet(W, H, dpr); veil = vs; const Fg = rng(510); for (let i = 0; i < 9; i++) { const y = 52 + i * 9 + Fg() * 5; brush(v, along(-10 + Fg() * 50, y, 190 + Fg() * 70, y + (Fg() - 0.5) * 4, (Fg() - 0.5) * 4), 12 + Fg() * 6, paper, { alpha: 0.75, bristles: 18, seed: 520 + i, dry: 0.3 }); } }
  // Clouds: a scalloped pen outline over a pale wash, each on its own sheet so it can drift
  const storm = wx.storm || wx.rain;
  const clouds = CLOUDS.map((cl, n) => {
    const cw = cl.w * DW, ch = cw * 0.5, [cs, c] = sheet(cw * W / DW, ch * H / DH, dpr), Rc = rng(30 + n);
    c.setTransform(dpr * W / DW, 0, 0, dpr * H / DH, 0, 0);
    dab(c, oval(cw * 0.5, ch * 0.62, cw * 0.4, ch * 0.22), '#ffffff', { layers: 6, alpha: storm ? 0.04 : 0.07, v: 0.3, seed: 40 + n });
    c.strokeStyle = ink; c.lineWidth = 0.5; c.globalAlpha = 0.7; c.lineCap = 'round'; c.beginPath();
    let x = cw * 0.12; const base = ch * 0.78; c.moveTo(x, base);
    const bumps = 3 + Math.floor(Rc() * 2), step = (cw * 0.76) / bumps;
    for (let b = 0; b < bumps; b++) { const r = step / 2 * (0.9 + Rc() * 0.3), cx = x + step / 2, lift = b === 0 || b === bumps - 1 ? 0.25 : 0.5 + Rc() * 0.3; c.ellipse(cx, base - r * lift, r, r * (0.7 + Rc() * 0.4), 0, Math.PI, 0); x += step; }
    c.stroke(); c.globalAlpha = 0.45; c.beginPath(); c.moveTo(cw * 0.18, base + 0.4); c.lineTo(cw * 0.7, base + 0.6); c.stroke();
    return [cs, cw, ch];
  });
  // Paper tooth over everything
  const gw = Math.round(W), gh = Math.round(H), [grain, gc] = sheet(gw, gh, 1), id = gc.createImageData(gw, gh), N = rng(99);
  for (let i = 0; i < id.data.length; i += 4) { const v = 228 + N() * 27; id.data[i] = id.data[i + 1] = v; id.data[i + 2] = v - 4; id.data[i + 3] = 255; }
  gc.putImageData(id, 0, 0);
  return { paint, L, total, veil, clouds, grain, paper, ink, night, day };
}
// Draws the scene on a canvas at `time`; each canvas keeps its own cache and draw-in clock
const states = new WeakMap();
function render(cv, time) {
  let st = states.get(cv); if (!st) states.set(cv, st = { cache: null, drawStart: 0, lastFrame: -1e9 });
  const dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth || DW, H = cv.clientHeight || DH;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr * W / DW, 0, 0, dpr * H / DH, 0, 0);
  // Each time the card opens after a pause, the drawing starts over
  if (time - st.lastFrame > 900) st.drawStart = time; st.lastFrame = time;
  const still = calm() || window.__dsmStill, el = time - st.drawStart;
  const inkP = still ? 1 : 1 - (1 - clamp01(el / 1700)) ** 2, paintP = still ? 1 : clamp01((el - 450) / 1100), waterP = still ? 1 : clamp01((el - 1100) / 700);
  const h = DSM(), k = skyAt(h), sec = time / 1000, wx = WX[wxI], season = SEASON();
  const key = `${W}x${H}@${dpr}:${Math.round(h * 60)}:${wx.id}:${season}`;
  if (st.cache?.key !== key) st.cache = { key, ...paintScene(W, H, dpr, h, k, wx, season) };
  const S = st.cache;
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = S.paper; c.fillRect(0, 0, DW, DH);
  c.globalAlpha = paintP; c.drawImage(S.paint, 0, 0, DW, DH);
  // Stars as small pen crosses, only under a clear night sky
  if (S.night && !wx.stratus && !wx.fog) { c.strokeStyle = S.ink; c.lineWidth = 0.4; for (const st of STARS) { const x = st.x * DW, y = st.y * DATUM, r = 0.9 + 0.5 * Math.sin(sec * st.s + st.p); c.globalAlpha = paintP * (0.45 + 0.35 * Math.sin(sec * st.s + st.p) ** 2); c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke(); } }
  CLOUDS.slice(0, wx.clouds).forEach((cl, n) => {
    const [img, cw, ch] = S.clouds[n], speed = (1.6 + cl.depth * 2.4) * (wx.storm ? 2.2 : 1), span = DW + cw;
    c.globalAlpha = paintP; c.drawImage(img, ((cl.x * span + sec * speed) % span) - cw, cl.y * DH, cw, ch);
  });
  c.globalAlpha = 1;
  if (inkP >= 1) { if (!S.lines) { const [ls, lc] = sheet(W, H, dpr); drawLines(lc, S.L, S.ink); S.lines = ls; } c.drawImage(S.lines, 0, 0, DW, DH); }
  else drawLines(c, S.L, S.ink, inkP * S.total);
  // The water: short pen dashes that drift with the current
  c.strokeStyle = S.ink; c.lineWidth = 0.4; c.lineCap = 'round';
  RIPPLES.forEach((row, r) => { const dx = Math.sin(sec * 0.5 + r * 1.3) * 1.6; c.globalAlpha = waterP * (0.55 - r * 0.04); c.beginPath(); row.segs.forEach(([a, b]) => { c.moveTo(a + dx, row.y); c.lineTo(b + dx, row.y); }); c.stroke(); });
  if (wx.rain) { c.strokeStyle = S.ink; c.lineWidth = 0.45; c.beginPath(); for (let i = 0; i < 10; i++) { const f = (sec * 0.8 + i * 0.37) % 1, Rr = rng(900 + i + Math.floor(sec * 0.8 + i * 0.37) * 31), x = 14 + Rr() * (DW - 28), y = DATUM + 4 + Rr() * (SHORE - DATUM - 7); c.moveTo(x - 0.5 - f * 3, y); c.ellipse(x, y, 0.5 + f * 3, 0.2 + f * 0.8, 0, Math.PI, Math.PI * 3); } c.globalAlpha = waterP * 0.4; c.stroke(); }
  if (S.veil) { c.globalAlpha = 1; c.drawImage(S.veil, 0, 0, DW, DH); }
  // Rain as pen ticks, snow as small rings, and now and then a strike of lightning
  if (wx.rain) { c.strokeStyle = S.ink; c.lineWidth = 0.4; c.globalAlpha = 0.42 * paintP; c.beginPath(); for (const d of DROPS.slice(0, wx.rain)) { const y = (d.y * (DH + 12) + sec * d.s) % (DH + 12) - 12, x = ((d.x * DW - y * 0.25) % DW + DW) % DW; c.moveTo(x, y); c.lineTo(x - d.l * 0.25, y + d.l); } c.stroke(); }
  if (wx.snow) { c.strokeStyle = S.ink; c.lineWidth = 0.4; c.globalAlpha = 0.7 * paintP; c.beginPath(); for (const f of FLAKES.slice(0, wx.snow)) { const y = (f.y * (DH + 6) + sec * f.s) % (DH + 6) - 3, x = f.x * DW + Math.sin(sec * f.w + f.p) * 3; c.moveTo(x + f.r, y); c.arc(x, y, f.r, 0, 6.29); } c.stroke(); }
  if (wx.storm) {
    const ph = sec % 6.2, on = ph < 0.07 || (ph > 0.13 && ph < 0.24);
    if (on) { const g = c.createRadialGradient(165, 40, 0, 165, 40, 70); g.addColorStop(0, 'rgba(255,226,140,0.35)'); g.addColorStop(1, 'rgba(255,226,140,0)'); c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, DW, DH); c.strokeStyle = S.ink; c.lineWidth = 0.9; c.beginPath(); BOLT.forEach(([x, y], n) => n ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
  }
  c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.18; c.drawImage(S.grain, 0, 0, DW, DH);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  return inkP;
}
function drawSky(time) {
  const cv = $('#dsmCanvas'); if (!cv) return;
  const inkP = render(cv, time);
  const hovering = $('[data-act=here]')?.matches(':hover, .is-on, :focus-visible');
  if (hovering && (!calm() || inkP < 1)) skyRAF = requestAnimationFrame(drawSky); else skyRAF = null;
}
// ---- Live weather
// WMO weather codes → the drawing's states
function stateFor(code) {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2) return 'partly';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  if (code >= 51) return 'rain';
  return 'partly';
}
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=41.59&longitude=-93.62&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago';
let weatherAsked = false;
async function fetchWeather() {
  if (weatherAsked) return; weatherAsked = true;
  let data = null;
  try { const c = JSON.parse(sessionStorage.getItem('dsm-weather') || 'null'); if (c && Date.now() - c.at < 15 * 60 * 1000) data = c.data; } catch {}
  if (!data) {
    try {
      const r = await fetch(WEATHER_URL);
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      data = { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code };
      try { sessionStorage.setItem('dsm-weather', JSON.stringify({ at: Date.now(), data })); } catch {}
    } catch { return; } // offline or blocked: the drawing keeps to the hour and season
  }
  const i = WX.findIndex((w) => w.id === stateFor(data.code));
  if (i >= 0) wxI = i;
  const w = WX[wxI];
  const temp = $('#dsmTemp'), cond = $('#dsmCond');
  if (temp) temp.textContent = `${data.temp}°`;
  if (cond) cond.textContent = `${w.label} in Des Moines`;
  $('#dsmCanvas')?.setAttribute('aria-label', `A drawing of downtown Des Moines: ${w.label.toLowerCase()}`);
  if (skyRAF == null) drawSky(performance.now());
}

const open = () => { tickTime(); fetchWeather(); if (!skyRAF) skyRAF = requestAnimationFrame(drawSky); };
document.addEventListener('pointerover', (e) => { if (e.target.closest?.('[data-act=here]')) open(); });
document.addEventListener('focusin', (e) => { if (e.target.closest?.('[data-act=here]')) open(); });
document.addEventListener('click', (e) => { if (e.target.closest?.('[data-act=here]')) { open(); requestAnimationFrame(drawSky); } });
setInterval(tickTime, 30000);
tickTime();
// For checking the drawing at other hours and weather from the console
window.__dsm = { draw: (t = performance.now()) => drawSky(t), weather: (id) => { const i = WX.findIndex((w) => w.id === id); if (i >= 0) { wxI = i; drawSky(performance.now()); } } };
