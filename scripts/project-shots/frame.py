"""
Frame raw captures into project-page assets.

    python3 scripts/project-shots/frame.py <raw.png> <out.webp> [options]

Options:
  --crop x,y,w,h        crop the raw capture first (raw pixels)
  --radius N            round the corners (raw pixels, after crop; default 0)
  --canvas WxH          place on a transparent canvas of this size (default: no canvas)
  --margin F            fraction of the canvas left as margin (default 0.04)
  --shadow              soft drop shadow under the shot (matches the CleanShot look)
  --fill                cover the canvas (crop to fit) instead of fitting inside it
  --width N             without --canvas, resize to this width
  --quality N           WebP quality (default 86)

Slots used by the site (see docs/CONTENT_WORKFLOW.md → Project media):
  card / hero  1:1   1600x1600   --canvas 1600x1600 --shadow
  stepper      4:3   1600x1200   --canvas 1600x1200 --shadow
  pair         5:6   1000x1200   --canvas 1000x1200 --shadow

Needs Pillow (dev machine only; not part of the site build).
"""
import argparse
from PIL import Image, ImageDraw, ImageFilter


def rounded(im: Image.Image, r: int) -> Image.Image:
    if r <= 0:
        return im
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius=r, fill=255)
    out = im.convert('RGBA')
    alpha = out.getchannel('A')
    out.putalpha(Image.composite(alpha, mask, mask))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dest')
    ap.add_argument('--crop')
    ap.add_argument('--radius', type=int, default=0)
    ap.add_argument('--canvas')
    ap.add_argument('--margin', type=float, default=0.04)
    ap.add_argument('--shadow', action='store_true')
    ap.add_argument('--fill', action='store_true')
    ap.add_argument('--width', type=int)
    ap.add_argument('--quality', type=int, default=86)
    a = ap.parse_args()

    im = Image.open(a.src).convert('RGBA')
    if a.crop:
        x, y, w, h = (int(v) for v in a.crop.split(','))
        im = im.crop((x, y, x + w, y + h))
    im = rounded(im, a.radius)

    if a.canvas:
        cw, ch = (int(v) for v in a.canvas.lower().split('x'))
        canvas = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        m = int(min(cw, ch) * a.margin)
        bw, bh = cw - 2 * m, ch - 2 * m
        scale = (max if a.fill else min)(bw / im.width, bh / im.height)
        shot = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        if a.fill:
            left, top = (shot.width - bw) // 2, (shot.height - bh) // 2
            shot = rounded(shot.crop((left, top, left + bw, top + bh)), int(a.radius * scale))
        x, y = (cw - shot.width) // 2, (ch - shot.height) // 2
        if a.shadow:
            blur = max(8, m // 2)
            sh = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
            silhouette = Image.new('RGBA', shot.size, (0, 0, 0, 70))
            silhouette.putalpha(shot.getchannel('A').point(lambda v: v * 70 // 255))
            sh.alpha_composite(silhouette, (x, y + blur // 3))
            canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
        canvas.alpha_composite(shot, (x, y))
        im = canvas
    elif a.width:
        im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)

    im.save(a.dest, 'WEBP', quality=a.quality, method=6)
    print(f'{a.dest} {im.width}x{im.height}')


if __name__ == '__main__':
    main()
