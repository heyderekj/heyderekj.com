/**
 * Generates the blueprint-style interest illustrations in public/images/library/.
 * Each is a line drawing on a faint grid with construction lines, a dimension
 * callout, and a mono figure label — the same language as the /library grid.
 *
 *   node scripts/library-art.mjs
 *
 * Colors work on light and dark (transparent background, mid-gray grid, accent strokes).
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public/images/library');
const W = 400;
const H = 300;
const ACCENT = '#ea580c';
const GRID = 'rgba(128,128,128,0.16)';
const GUIDE = 'rgba(128,128,128,0.55)';

const frame = (label, body, dim = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
  <defs>
    <pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M10 0H0V10" fill="none" stroke="${GRID}" stroke-width="0.6"/>
    </pattern>
    <pattern id="G" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M50 0H0V50" fill="none" stroke="${GRID}" stroke-width="1.1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#G)"/>
  <g fill="none" stroke="${ACCENT}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
${body}
  </g>
  <g fill="none" stroke="${GUIDE}" stroke-width="1" stroke-dasharray="3 4">${dim}</g>
  <text x="16" y="${H - 14}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" letter-spacing="1" fill="${GUIDE}">${label}</text>
</svg>
`;

/** Horizontal dimension line with end ticks and a centered label. */
const dimH = (x1, x2, y, text) => `
    <path d="M${x1} ${y}H${x2}M${x1} ${y - 5}V${y + 5}M${x2} ${y - 5}V${y + 5}" stroke-dasharray="none"/>
    <text x="${(x1 + x2) / 2}" y="${y - 6}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="10" fill="${GUIDE}" stroke="none">${text}</text>`;

const art = {
  // Side profile of a modern F1 car: nose, halo, engine cover, wings, big wheels.
  'interest-formula-1': frame(
    'FIG. F1 — SIDE ELEVATION',
    `    <path d="M40 176 L150 170 L186 150 L214 146 L232 132 L262 132 L276 146 L312 150 L326 128 L356 128 L352 176 Z"/>
    <path d="M40 176 L40 184 L88 184"/>
    <path d="M214 146 Q228 124 250 128"/>
    <path d="M326 128 L330 110 L362 110 L360 128"/>
    <circle cx="116" cy="182" r="26"/><circle cx="116" cy="182" r="9"/>
    <circle cx="300" cy="182" r="28"/><circle cx="300" cy="182" r="10"/>
    <path d="M142 184 L272 184"/>`,
    `<path d="M116 150V240M300 150V240"/>${dimH(116, 300, 238, '3600')}`,
  ),

  // Isometric 2×4 brick with studs.
  'interest-legos': frame(
    'FIG. BRICK — 2×4 ISO',
    `    <path d="M110 140 L230 80 L310 120 L190 180 Z"/>
    <path d="M110 140 L110 200 L190 240 L190 180"/>
    <path d="M190 240 L310 180 L310 120"/>
    ${[
      [150, 128], [180, 113], [210, 98], [240, 83],
      [180, 143], [210, 128], [240, 113], [270, 98],
    ]
      .map(([x, y]) => {
        const cx = x + 10;
        const cy = y + 12;
        return `<path d="M${cx - 13} ${cy} V${cy - 8} M${cx + 13} ${cy} V${cy - 8}"/><ellipse cx="${cx}" cy="${cy - 8}" rx="13" ry="6.5"/><path d="M${cx - 13} ${cy} A13 6.5 0 0 0 ${cx + 13} ${cy}"/>`;
      })
      .join('\n    ')}`,
    `<path d="M110 140 L60 115 M190 240 L140 265"/>`,
  ),

  // Sleek electric sedan in profile — no badge, just the line.
  'interest-tesla': frame(
    'FIG. EV — PROFILE',
    `    <path d="M42 196 Q40 176 64 170 L116 160 Q160 120 214 116 Q266 114 300 142 L344 154 Q362 160 360 190 L358 196"/>
    <path d="M42 196 H70 M146 196 H274 M350 196 H358"/>
    <path d="M128 158 Q168 128 212 126 Q252 126 282 148 Z"/>
    <path d="M206 127 V152"/>
    <circle cx="108" cy="196" r="30"/><circle cx="108" cy="196" r="14"/>
    <circle cx="312" cy="196" r="30"/><circle cx="312" cy="196" r="14"/>
    <path d="M226 168 H244"/>`,
    `<path d="M40 110 Q200 70 362 110"/>`,
  ),

  // Kit from the drummer's seat: kick, snare, tom, hi-hat, crash, sticks.
  'interest-drums': frame(
    'FIG. KIT — FRONT',
    `    <circle cx="200" cy="190" r="62"/><circle cx="200" cy="190" r="48"/>
    <ellipse cx="116" cy="170" rx="40" ry="12"/><path d="M76 170 V196 M156 170 V196"/><path d="M76 196 A40 12 0 0 0 156 196"/>
    <ellipse cx="236" cy="112" rx="30" ry="9"/><path d="M206 112 V138 M266 112 V138"/><path d="M206 138 A30 9 0 0 0 266 138"/>
    <path d="M58 118 H130 M94 118 V250"/><path d="M62 124 H126"/>
    <path d="M280 84 L352 72 M316 78 V250"/>
    <path d="M150 80 L186 120 M170 70 L196 112"/>`,
    `<path d="M200 120 V260 M130 190 H270"/>`,
  ),

  // Controller + a live stream frame.
  'interest-game-devlogs-streaming': frame(
    'FIG. STREAM — LIVE',
    `    <rect x="196" y="56" width="164" height="104" rx="8"/>
    <path d="M266 92 L266 124 L292 108 Z"/>
    <circle cx="214" cy="72" r="4"/><path d="M224 72 H244"/>
    <path d="M64 196 Q60 160 92 156 H188 Q220 160 216 196 L208 236 Q200 256 182 240 L166 222 H114 L98 240 Q80 256 72 236 Z"/>
    <path d="M100 184 V204 M90 194 H110"/>
    <circle cx="172" cy="186" r="5"/><circle cx="186" cy="200" r="5"/>
    <path d="M216 170 L240 160"/>`,
    `<path d="M196 170 V190 M360 170 V190"/>`,
  ),

  // A paper ream and a mug on a desk.
  'interest-the-office': frame(
    'FIG. DESK — PAPER CO.',
    `    <path d="M40 232 H360"/>
    <path d="M70 232 V176 L112 160 L230 160 L188 176 V232"/>
    <path d="M70 176 H188 M188 176 L230 160 V216 L188 232"/>
    <path d="M70 194 H188 M188 194 L230 178"/>
    <path d="M262 150 H322 V222 Q322 232 312 232 H272 Q262 232 262 222 Z"/>
    <path d="M322 166 Q348 168 346 188 Q344 206 322 204"/>
    <path d="M280 136 Q272 124 282 112 M298 136 Q290 124 300 110"/>`,
    `${dimH(70, 188, 252, 'A4 · 500')}`,
  ),

  // Park bench under a tree.
  'interest-parks-and-recreation': frame(
    'FIG. PARK — BENCH',
    `    <path d="M40 236 H360"/>
    <path d="M268 236 V150"/>
    <circle cx="268" cy="104" r="54"/><path d="M268 150 L246 124 M268 164 L292 132"/>
    <path d="M80 190 H212 M80 202 H212"/>
    <path d="M86 170 H206 M86 180 H206 M86 170 V190 M206 170 V190"/>
    <path d="M94 202 V236 M200 202 V236"/>`,
    `${dimH(80, 212, 258, 'BENCH 1')}`,
  ),

  // Stand-up mic in front of a brick wall.
  'interest-seinfeld': frame(
    'FIG. STAGE — OPEN MIC',
    `    ${[0, 1, 2, 3, 4]
      .map((r) => {
        const y = 40 + r * 28;
        const off = r % 2 ? 30 : 0;
        const verts = [0, 1, 2, 3, 4, 5]
          .map((c) => 60 + off + c * 60)
          .filter((x) => x < 340)
          .map((x) => `M${x} ${y} V${y + 28}`)
          .join(' ');
        return `<path d="M60 ${y} H340 ${verts}" stroke-opacity="0.45"/>`;
      })
      .join('\n    ')}
    <path d="M60 180 H340" stroke-opacity="0.45"/>
    <path d="M200 120 V246 M172 246 H228"/>
    <path d="M200 120 L186 104"/>
    <rect x="172" y="84" width="18" height="26" rx="9" transform="rotate(-40 181 97)"/>`,
    `<path d="M200 60 V120"/>`,
  ),

  // House with a family out front.
  'interest-modern-family': frame(
    'FIG. HOUSE — ELEVATION',
    `    <path d="M40 236 H360"/>
    <path d="M120 236 V132 L200 76 L280 132 V236"/>
    <path d="M104 144 L200 76 L296 144"/>
    <rect x="182" y="184" width="36" height="52"/>
    <rect x="140" y="148" width="28" height="24"/><rect x="232" y="148" width="28" height="24"/>
    ${[
      [84, 196, 11], [104, 206, 8], [300, 192, 11], [322, 200, 10], [340, 212, 7],
    ]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 0.6}"/><path d="M${x} ${y + r * 0.6} V${236 - r} M${x - r} ${y + r * 1.4} H${x + r} M${x} ${236 - r} L${x - r * 0.7} 236 M${x} ${236 - r} L${x + r * 0.7} 236"/>`)
      .join('\n    ')}`,
    `<path d="M200 76 V40"/>`,
  ),
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, svg] of Object.entries(art)) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  console.log(`wrote public/images/library/${name}.svg`);
}
