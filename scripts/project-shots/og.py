"""
Generate 1200x630 Open Graph cards for projects.

    python3 scripts/project-shots/og.py            # all non-retired projects
    python3 scripts/project-shots/og.py koati      # one

Reads name / tagline / icon / image from src/content/projects/<slug>.md and
writes public/assets/images/projects/<slug>-og.png. Uses Plus Jakarta Sans
(OFL, bundled in ./fonts). Needs Pillow (dev machine only).
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PROJECTS = ROOT / 'src/content/projects'
IMAGES = ROOT / 'public/assets/images/projects'
FONTS = Path(__file__).parent / 'fonts'
W, H = 1200, 630
BG, FG, SOFT, MUTED, ACCENT = (250, 250, 250), (34, 34, 34), (84, 84, 84), (154, 154, 154), (234, 88, 12)


def frontmatter(path: Path) -> dict:
    text = path.read_text()
    block = text.split('---', 2)[1]
    out = {}
    for line in block.splitlines():
        m = re.match(r'^([A-Za-z]+):\s*(.*)$', line)
        if m:
            out[m.group(1)] = m.group(2).strip().strip('"')
    return out


def font(weight: int, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / f'pjs-{weight}.ttf'), size)


def wrap(draw, text, fnt, width):
    lines, cur = [], ''
    for word in text.split():
        trial = f'{cur} {word}'.strip()
        if draw.textlength(trial, font=fnt) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    return lines + [cur]


def tick(draw, x, y, s=9):
    draw.line([(x - s, y), (x + s, y)], fill=ACCENT, width=2)
    draw.line([(x, y - s), (x, y + s)], fill=ACCENT, width=2)


def local(path: str) -> Image.Image:
    return Image.open(ROOT / 'public' / path.lstrip('/')).convert('RGBA')


def card(slug: str):
    fm = frontmatter(PROJECTS / f'{slug}.md')
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)

    # right: card art on a soft mat
    mat = (700, 390, 1140, 570 + 60)
    mx, my, size = 668, 55, 520
    d.rounded_rectangle([mx, my, mx + size, my + size], radius=28, fill=(244, 244, 244), outline=(232, 232, 232))
    art = local(fm['image'] if 'image' in fm else fm['icon'])
    art.thumbnail((size - 56, size - 56), Image.LANCZOS)
    img.paste(art, (mx + (size - art.width) // 2, my + (size - art.height) // 2), art)

    # left: icon, name, tagline
    x = 80
    y = 120
    if 'icon' in fm:
        ic = local(fm['icon']).resize((104, 104), Image.LANCZOS)
        img.paste(ic, (x, y), ic)
        y += 104 + 36
    d = ImageDraw.Draw(img)
    d.text((x, y), fm['name'], font=font(600, 76), fill=FG)
    y += 76 + 26
    for line in wrap(d, fm['tagline'], font(500, 32), 500)[:4]:
        d.text((x, y), line, font=font(500, 32), fill=SOFT)
        y += 46
    d.text((x, H - 76), 'heyderekj.com / projects', font=font(500, 22), fill=MUTED)

    # blueprint ticks, like the site frame
    for tx, ty in [(40, 40), (W - 40, 40), (40, H - 40), (W - 40, H - 40)]:
        tick(d, tx, ty)

    out = IMAGES / f'{slug}-og.png'
    img.save(out, optimize=True)
    print(out.relative_to(ROOT), out.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    wanted = sys.argv[1:]
    for p in sorted(PROJECTS.glob('*.md')):
        fm = frontmatter(p)
        if fm.get('status') == 'retired' or not ('image' in fm or 'icon' in fm):
            continue
        if not wanted or p.stem in wanted:
            card(p.stem)
