// Brings the CrowdHealth rebrand's Figma exports into the site (src/content/work/crowdhealth.mdx).
// Usage: node scripts/import-crowdhealth.mjs "/path/to/From Figma"
// Export from Figma at 2x (3x for the small card and social images) so they stay sharp on Retina screens.
// Writes public/images/work/crowdhealth/*.webp; long pages keep their first screen (16:10).
import sharp from 'sharp';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) { console.error('Pass the folder of Figma exports'); process.exit(1); }
const out = 'public/images/work/crowdhealth';
const MAX = 2400; // wide enough for 2x at the widest the site shows them
const whole = [
  ['before-after.png', 'logo'],
  ['app-desktop_current.png', 'app-desktop-before'], ['app-desktop_new.png', 'app-desktop-after'],
  ['app-mobile-home_current.png', 'app-mobile-home-before'], ['app-mobile-home_new.png', 'app-mobile-home-after'],
  ['app-mobile-details_current.png', 'app-mobile-details-before'], ['app-mobile-details_new.png', 'app-mobile-details-after'],
  ['card_current.png', 'card-before'], ['card_current-1.png', 'card-after'],
  ['social-header_current.png', 'social-header-before'], ['social-header_new.png', 'social-header-after'],
  ['social-post_current.png', 'social-post-before'], ['social-post_new.png', 'social-post-after'],
  // The new logo on its own, the brand in the world (mockups), and the home page's video
  ['Slide 16_9 - 8.png', 'logo-new'], ['Frame 104.png', 'cards'], ['Frame 101.png', 'billboard'],
  ['Frame 103.png', 'site-laptop'], ['Frame 102.png', 'app-pocket'], ['Home.png', 'home-video'],
  // The cover: the mark, big, behind the logo
  ['Frame 100.png', 'cover'],
];
const firstScreen = [['home_current.png', 'home-before'], ['home_new.png', 'home-after'], ['exit-diabetes_current.png', 'landing-before'], ['exit-diabetes_new.png', 'landing-after']];
const webp = (img) => img.resize({ width: MAX, withoutEnlargement: true }).webp({ quality: 90, smartSubsample: true });
for (const [f, name] of whole) await webp(sharp(join(src, f))).toFile(`${out}/${name}.webp`);
for (const [f, name] of firstScreen) {
  const { width } = await sharp(join(src, f)).metadata();
  await webp(sharp(join(src, f)).extract({ left: 0, top: 0, width, height: Math.round((width * 10) / 16) })).toFile(`${out}/${name}.webp`);
}
console.log('done');
