/**
 * Prebuild (and predev): smaller WebP copies of the site's screenshots and photos, so a thumbnail
 * isn't a 2000px original. For each image under the folders below it writes
 * public/_v/<same path>-<width>.webp at 480, 960 and 1600px wide (never wider than the original),
 * skipping any that are already up to date. src/lib/img.ts picks the right one. public/_v is
 * generated, not committed.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pub = path.join(root, 'public');
const DIRS = ['images/work', 'assets/images/projects', 'assets/about', 'images/posts'];
export const WIDTHS = [480, 960, 1600];

const walk = (dir) => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const files = DIRS.flatMap((d) => walk(path.join(pub, d))).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

let made = 0;
const jobs = files.map((file) => async () => {
  const rel = path.relative(pub, file), base = rel.replace(/\.[^.]+$/, ''), mtime = fs.statSync(file).mtimeMs;
  const todo = WIDTHS.map((w) => ({ w, out: path.join(pub, '_v', `${base}-${w}.webp`) })).filter(({ out }) => !fs.existsSync(out) || fs.statSync(out).mtimeMs < mtime);
  if (!todo.length) return;
  const { width = 0 } = await sharp(file).metadata();
  for (const { w, out } of todo) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(file).resize({ width: Math.min(w, width), withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(out);
    made++;
  }
});
// A few at a time
const pool = async (n) => { const q = [...jobs]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await q.shift()(); })); };
const t = Date.now();
await pool(6);
console.log(`[images] ${made} variants written for ${files.length} images in ${((Date.now() - t) / 1000).toFixed(1)}s`);
