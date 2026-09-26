/**
 * Generates the blueprint-style library illustrations in public/images/library/:
 * interests (400×300), books (240×360), and podcasts (300×300). Books and
 * podcasts are drawn sketches that represent each title, not traced covers.
 * Each is a line drawing on a faint grid with construction lines, a dimension
 * callout, and a mono figure label — the same language as the /library grid.
 *
 *   node scripts/library-art/drawings.mjs
 *
 * Colors work on light and dark (transparent background, mid-gray grid, accent strokes).
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public/images/library');
const ACCENT = '#ea580c';
const GRID = 'rgba(128,128,128,0.16)';
const GUIDE = 'rgba(128,128,128,0.55)';

const frame = (label, body, dim = '', [W, H] = [400, 300]) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
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
  <text x="${W < 300 ? 12 : 16}" y="${H - 14}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" letter-spacing="1" fill="${GUIDE}">${label}</text>
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

const BOOK = [240, 360];
const POD = [300, 300];
const T = (x, y, text, size = 13, weight = 600) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="ui-sans-serif, -apple-system, Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="1.5" fill="${ACCENT}" stroke="none">${text}</text>`;
const fish = (x, y, s = 1, dir = -1) =>
  `<path d="M${x} ${y} q${14 * s * -dir} ${-9 * s} ${28 * s * -dir} 0 q${-14 * s * -dir} ${9 * s} ${-28 * s * -dir} 0 Z M${x + 28 * s * -dir} ${y} l${7 * s * -dir} ${-6 * s} v${12 * s} Z"/><circle cx="${x + 7 * s * -dir}" cy="${y - 1.5 * s}" r="${1.2 * s}"/>`;
const person = (x, y, r = 5) =>
  `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x} ${y + r} v${r * 2.2} M${x - r * 1.3} ${y + r * 1.8} h${r * 2.6} M${x} ${y + r * 3.2} l${-r} ${r * 1.8} M${x} ${y + r * 3.2} l${r} ${r * 1.8}"/>`;

const library = {
  // Crumpled paper ball, mid-toss.
  'book-rework': frame(
    'FIG. BK — REWORK',
    `    <path d="M78 176 L96 140 L132 128 L164 146 L172 182 L156 216 L118 228 L86 212 Z"/>
    <path d="M96 140 L112 172 L132 128 M112 172 L164 146 M112 172 L118 228 M112 172 L86 212 M112 172 L140 196 L172 182 M140 196 L156 216 M140 196 L118 228"/>
    <path d="M60 120 Q90 70 150 84" stroke-dasharray="2 7"/>
    <path d="M150 84 l-10 -6 M150 84 l-8 8"/>`,
    `<path d="M40 260 H200"/>`,
    BOOK,
  ),

  // A simple portrait: round glasses, beard, hand at the chin, turtleneck.
  'book-steve-jobs': frame(
    'FIG. BK — BIOGRAPHY',
    `    <path d="M78 150 Q72 88 120 80 Q168 88 162 150 Q160 196 120 214 Q80 196 78 150 Z"/>
    <circle cx="100" cy="146" r="13"/><circle cx="140" cy="146" r="13"/><path d="M113 146 Q120 141 127 146 M87 144 L78 140 M153 144 L162 140"/>
    <path d="M120 150 L116 172 L124 174 M108 188 Q120 194 132 188"/>
    <path d="M84 168 Q90 204 120 214 Q150 204 156 168" stroke-dasharray="1 5"/>
    <path d="M106 214 Q98 206 104 196 L118 200 Q124 212 116 222"/>
    <path d="M62 290 Q66 240 100 228 L120 236 L140 228 Q174 240 178 290"/>
    <path d="M100 228 Q120 244 140 228"/>`,
    `<path d="M120 60 V80"/>`,
    BOOK,
  ),

  // A castle drawn in panes of glass, under a few stars.
  'book-the-glass-castle': frame(
    'FIG. BK — MEMOIR',
    `    <path d="M60 250 V150 H78 V136 H90 V150 H104 V110 L120 88 L136 110 V150 H150 V136 H162 V150 H180 V250 Z"/>
    <path d="M104 150 H136 M60 180 H180 M60 215 H180 M90 150 V250 M120 110 V250 M150 150 V250" stroke-opacity="0.5"/>
    <path d="M110 250 V224 Q120 212 130 224 V250"/>
    <path d="M70 120 l6 -6 M96 72 l4 4 M168 96 l-5 5"/>
    <path d="M160 64 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"/>`,
    `<path d="M40 250 H200"/>`,
    BOOK,
  ),

  // An upward arrow made of people (and a heart).
  'book-the-thank-you-economy': frame(
    'FIG. BK — THANK YOU',
    `    ${[[120, 64], [98, 90], [142, 90], [76, 116], [164, 116], [120, 116], [120, 166], [120, 216]]
      .map(([x, y]) => person(x, y, 6))
      .join('\n    ')}
    <path d="M60 116 L120 52 L180 116" stroke-dasharray="2 6" stroke-opacity="0.6"/>
    <path d="M120 296 Q92 278 92 262 Q92 250 104 250 Q114 250 120 260 Q126 250 136 250 Q148 250 148 262 Q148 278 120 296 Z"/>`,
    `<path d="M120 50 V290"/>`,
    BOOK,
  ),

  // Wordmark energy: a burst with a phone camera — build your brand.
  'book-crush-it': frame(
    'FIG. BK — CRUSH IT',
    `    <path d="M120 70 L134 104 L170 92 L154 124 L188 142 L152 152 L164 188 L130 170 L120 204 L110 170 L76 188 L88 152 L52 142 L86 124 L70 92 L106 104 Z"/>
    ${T(120, 146, 'CRUSH IT!', 15, 800)}
    <rect x="90" y="226" width="60" height="100" rx="10" transform="translate(0 -12)"/>
    <circle cx="120" cy="244" r="3"/><path d="M104 290 H136"/>`,
    ``,
    BOOK,
  ),

  // An open Bible with comic panels and a speech bubble.
  'book-the-action-bible': frame(
    'FIG. BK — ACTION BIBLE',
    `    <path d="M28 130 Q74 118 120 134 Q166 118 212 130 V268 Q166 256 120 272 Q74 256 28 268 Z"/>
    <path d="M120 134 V272"/>
    <rect x="40" y="140" width="34" height="46"/><rect x="80" y="140" width="30" height="46"/><rect x="40" y="194" width="70" height="56"/>
    <rect x="130" y="140" width="70" height="40"/><rect x="130" y="188" width="30" height="62"/><rect x="166" y="188" width="34" height="62"/>
    <path d="M60 206 l10 20 l-6 0 l8 18" />
    <path d="M150 76 Q150 58 176 58 Q202 58 202 76 Q202 94 176 94 L166 104 L168 93 Q150 90 150 76 Z"/>
    <path d="M164 72 H188 M164 80 H182"/>`,
    ``,
    BOOK,
  ),

  // Lynch's five elements: paths, edges, districts, nodes, landmarks.
  'book-the-image-of-the-city': frame(
    'FIG. BK — PATHS · NODES',
    `    <path d="M20 250 Q80 222 120 238 Q170 258 220 226" stroke-width="5" stroke-opacity="0.35"/>
    <path d="M30 90 L110 150 L210 110 M110 150 L90 290 M110 150 L180 200 L200 300 M40 190 L110 150"/>
    <circle cx="110" cy="150" r="9"/><circle cx="180" cy="200" r="6"/>
    <path d="M40 60 H100 V120 H40 Z M140 170 H210 V240" stroke-dasharray="4 5"/>
    <path d="M168 64 V104 M160 104 H176 M168 64 L162 76 H174 Z"/>`,
    ``,
    BOOK,
  ),

  // A small plant pushing up out of a block — resistance and the work.
  'book-the-war-of-art': frame(
    'FIG. BK — RESISTANCE',
    `    <path d="M84 206 L120 190 L156 206 L120 222 Z M84 206 V256 L120 272 V222 M156 206 V256 L120 272"/>
    <path d="M120 196 Q118 160 126 128"/>
    <path d="M122 160 Q100 148 96 128 Q116 132 122 156 M124 142 Q140 118 158 118 Q150 138 126 142"/>
`,
    `<path d="M60 80 V180 M60 180 l-5 -8 M60 180 l5 -8 M180 80 V180 M180 180 l-5 -8 M180 180 l5 -8"/>`,
    BOOK,
  ),

  // A school of fish, one swimming the other way.
  'book-company-of-one': frame(
    'FIG. BK — STAY SMALL',
    `    ${[[40, 80], [96, 70], [150, 88], [60, 124], [118, 116], [172, 132], [36, 166], [96, 170], [150, 178], [58, 216], [120, 222], [172, 232]]
      .map(([x, y]) => fish(x, y, 0.9, -1))
      .join('\n    ')}
    <g stroke-width="2.8">${fish(78, 286, 1.3, 1)}</g>`,
    `<path d="M20 286 H70"/>`,
    BOOK,
  ),

  // The golden circle: why, how, what.
  'book-start-with-why': frame(
    'FIG. BK — GOLDEN CIRCLE',
    `    <circle cx="120" cy="170" r="92"/><circle cx="120" cy="170" r="60"/><circle cx="120" cy="170" r="28"/>
    ${T(120, 175, 'WHY', 12, 700)}${T(120, 128, 'HOW', 11, 600)}${T(120, 96, 'WHAT', 11, 600)}`,
    `<path d="M120 50 V78 M28 170 H212"/>`,
    BOOK,
  ),

  // A circle and a point — the act of making, reduced.
  'book-the-creative-act-a-way-of-being': frame(
    'FIG. BK — A WAY OF BEING',
    `    <circle cx="120" cy="170" r="74" stroke-width="5"/>
    <circle cx="120" cy="170" r="7" fill="${ACCENT}"/>`,
    `<circle cx="120" cy="170" r="100"/><path d="M120 60 V280 M10 170 H230"/>`,
    BOOK,
  ),

  // Two chairs facing each other: the philosopher and the youth.
  'book-the-courage-to-be-disliked': frame(
    'FIG. BK — DIALOGUE',
    `    <path d="M42 140 L54 204 M42 140 L52 138 L62 196 M54 204 H104 V212 H56 Z M60 212 L54 256 M100 212 L106 256 M50 170 L58 168"/>
    <path d="M198 140 L186 204 M198 140 L188 138 L178 196 M186 204 H136 V212 H184 Z M180 212 L186 256 M140 212 L134 256 M190 170 L182 168"/>
    <path d="M46 88 Q46 66 76 66 Q106 66 106 88 Q106 110 76 110 L64 122 L66 109 Q46 104 46 88 Z"/>
    <path d="M134 108 Q134 86 164 86 Q194 86 194 108 Q194 130 164 130 L176 142 L172 129 Q134 124 134 108 Z"/>
    <path d="M64 86 H90 M152 106 H176"/>`,
    `<path d="M20 250 H220"/>`,
    BOOK,
  ),

  // A rocket clearing the pad.
  'book-elon-musk': frame(
    'FIG. BK — LAUNCH',
    `    <path d="M120 60 Q140 84 140 130 V210 H100 V130 Q100 84 120 60 Z"/>
    <circle cx="120" cy="120" r="9"/>
    <path d="M100 180 L82 214 H100 M140 180 L158 214 H140"/>
    <path d="M106 214 Q110 236 120 250 Q130 236 134 214"/>
    <path d="M70 290 Q80 262 106 270 Q116 250 134 262 Q160 254 172 290"/>
    <path d="M186 80 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z"/>`,
    `<path d="M40 300 H200"/>`,
    BOOK,
  ),

  // Crowded red water behind, open water ahead.
  'book-blue-ocean-strategy': frame(
    'FIG. BK — OPEN WATER',
    `    <path d="M136 210 V96 L184 196 Z M130 210 V104 L96 196 Z"/>
    <path d="M92 214 H196 L180 236 H108 Z"/>
    <path d="M20 256 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 M20 280 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"/>
    <path d="M28 160 l8 -16 l6 16 M46 176 l8 -16 l6 16 M26 196 l8 -16 l6 16" stroke-opacity="0.6"/>`,
    `<path d="M20 214 H80"/>`,
    BOOK,
  ),

  // Comic burst with a mic and a code bracket.
  'podcast-mostly-technical': frame(
    'FIG. PC — MOSTLY TECHNICAL',
    `    <path d="M150 40 L170 90 L222 64 L204 116 L262 128 L212 158 L244 204 L190 190 L182 246 L150 206 L118 246 L110 190 L56 204 L88 158 L38 128 L96 116 L78 64 L130 90 Z"/>
    <rect x="136" y="104" width="28" height="52" rx="14"/>
    <path d="M124 136 Q124 172 150 172 Q176 172 176 136 M150 172 V190 M136 190 H164"/>
    <path d="M112 118 l-10 8 l10 8 M188 118 l10 8 l-10 8"/>`,
    ``,
    POD,
  ),

  // Campfire with two marshmallow sticks.
  'podcast-lenny-s-podcast': frame(
    'FIG. PC — CAMPFIRE',
    `    <path d="M150 88 Q182 128 170 168 Q190 150 188 126 Q214 170 190 206 H110 Q86 170 112 126 Q110 150 130 168 Q118 128 150 88 Z"/>
    <path d="M150 150 Q164 168 158 190 H142 Q136 168 150 150 Z"/>
    <path d="M96 212 L204 236 M204 212 L96 236"/>
    <path d="M50 70 L118 150 M250 70 L182 150"/>
    <rect x="40" y="52" width="20" height="26" rx="6" transform="rotate(-40 50 65)"/>
    <rect x="240" y="52" width="20" height="26" rx="6" transform="rotate(40 250 65)"/>`,
    `<path d="M40 250 H260"/>`,
    POD,
  ),

  // Studio mic beside a crumpled page.
  'podcast-rework': frame(
    'FIG. PC — REWORK',
    `    <rect x="112" y="60" width="44" height="86" rx="22"/>
    <path d="M112 90 H156 M112 110 H156"/>
    <path d="M98 118 Q98 170 134 170 Q170 170 170 118 M134 170 V222 M104 222 H164"/>
    <path d="M200 206 L212 186 L232 180 L248 192 L250 212 L238 228 L216 230 L202 220 Z M212 186 L222 206 L232 180 M222 206 L250 212 M222 206 L216 230"/>`,
    `<path d="M40 232 H270"/>`,
    POD,
  ),

  // Snorkel mask, bubbles rising.
  'podcast-dive-club': frame(
    'FIG. PC — DIVE',
    `    <path d="M70 150 Q70 112 110 112 H190 Q230 112 230 150 Q230 188 196 188 Q176 188 166 170 Q150 158 134 170 Q124 188 104 188 Q70 188 70 150 Z"/>
    <path d="M150 112 V170"/>
    <path d="M230 150 H244 Q256 150 256 138 V60 Q256 50 266 50"/>
    <path d="M70 150 Q40 150 40 120"/>
    <circle cx="200" cy="78" r="8"/><circle cx="178" cy="54" r="5"/><circle cx="206" cy="38" r="4"/>
    <path d="M30 236 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>`,
    ``,
    POD,
  ),
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, svg] of Object.entries({ ...art, ...library })) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  console.log(`wrote public/images/library/${name}.svg`);
}
