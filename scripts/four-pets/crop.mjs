// Crops Derek's pet photos to square portraits for the 404 game (client/four.ts, four-card.ts).
// Usage: node scripts/four-pets/crop.mjs <folder of originals>
// Writes public/images/four/pet-<name>.webp (480px, for the card) and pet-<name>-sm.webp (96px, the chat avatar).
import sharp from 'sharp';
import { join } from 'node:path';

const src = process.argv[2] ?? 'public/images/pets';
// Each face's centre (0–1 of the upright photo) and how much of the short side the square takes
const PETS = {
  leroy: { file: 'leroy.jpeg', x: 0.45, y: 0.42, k: 0.6 },
  irma: { file: 'irma.jpeg', x: 0.5, y: 0.42, k: 0.78 },
  lilo: { file: 'lilo.jpg', x: 0.53, y: 0.42, k: 0.62 },
  kiya: { file: 'kiya.jpeg', x: 0.52, y: 0.4, k: 0.7 },
};
for (const [name, p] of Object.entries(PETS)) {
  const upright = await sharp(join(src, p.file)).rotate().toBuffer();
  const { width: w, height: h } = await sharp(upright).metadata();
  const side = Math.round(Math.min(w, h) * p.k);
  const left = Math.max(0, Math.min(w - side, Math.round(p.x * w - side / 2)));
  const top = Math.max(0, Math.min(h - side, Math.round(p.y * h - side / 2)));
  const square = sharp(upright).extract({ left, top, width: side, height: side });
  await square.clone().resize(480, 480).webp({ quality: 82 }).toFile(`public/images/four/pet-${name}.webp`);
  await square.clone().resize(96, 96).webp({ quality: 80 }).toFile(`public/images/four/pet-${name}-sm.webp`);
  console.log(name, side);
}
