#!/usr/bin/env python3
"""Builds the cinematic hero videos + posters from the supplied photographs.

Why not ffmpeg's zoompan?  zoompan snaps every frame to whole pixels, which makes slow
camera moves visibly *tremble* on phones.  Here each frame is sampled from the photo at a
fractional (sub-pixel) position with bicubic filtering and eased motion, then streamed to
ffmpeg for H.264 / VP9 encoding.  Originals are never modified.

Requires: python3 + Pillow + numpy, ffmpeg (libx264, libvpx-vp9).
Outputs (assets/video/): hero-portrait.{mp4,webm}, hero-landscape.{mp4,webm}, *-poster.jpg
"""
import pathlib, subprocess, sys
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / "assets"
OUT = A / "video"
OUT.mkdir(parents=True, exist_ok=True)

FPS, CLIP, FADE = 30, 3.2, 1.0          # seconds per shot, crossfade length
Z0, Z1 = 1.00, 1.09                      # zoom range of the slow push-in / pull-out
SUPERSAMPLE = 1.5                        # pre-scale factor so bicubic never aliases


def ease(p):                              # smoothstep: gentle start and stop
    return p * p * (3 - 2 * p)


class Panel:
    """One photo, cropped to its panel aspect, with a slow zoom and a tiny drift."""
    def __init__(self, path, crop, direction, drift, w, h):
        img = Image.open(A / path).convert("RGB")
        x, y, cw, ch = crop
        base = img.crop((x, y, x + cw, y + ch))
        # sizes: keep the base at SUPERSAMPLE x the output so zoomed samples stay sharp
        self.base = base.resize((int(w * SUPERSAMPLE), int(h * SUPERSAMPLE)), Image.LANCZOS)
        self.w, self.h = w, h
        self.inward = direction == "in"
        self.drift = drift                # (dx, dy) as fraction of the frame, applied over the clip

    def frame(self, p):
        e = ease(p)
        z = Z0 + (Z1 - Z0) * (e if self.inward else 1 - e)
        bw, bh = self.base.size
        vw, vh = bw / z, bh / z
        cx = bw / 2 + self.drift[0] * bw * (e - 0.5)
        cy = bh / 2 + self.drift[1] * bh * (e - 0.5)
        box = (cx - vw / 2, cy - vh / 2, cx + vw / 2, cy + vh / 2)       # float box => sub-pixel
        return self.base.transform((self.w, self.h), Image.EXTENT, box, Image.BICUBIC)


def build(name, W, H, shots, crf):
    # shots: list of lists of panel specs (path, crop(x,y,w,h), dir, drift)
    shot_objs = []
    for spec in shots:
        pw = W // len(spec)
        shot_objs.append([Panel(p, c, d, dr, pw, H) for (p, c, d, dr) in spec])
    n = len(shot_objs)
    step = CLIP - FADE
    total = n * CLIP - (n - 1) * FADE
    frames = int(round(total * FPS))

    def render_shot(i, t):
        p = min(max((t - i * step) / CLIP, 0), 1)
        parts = [pn.frame(p) for pn in shot_objs[i]]
        if len(parts) == 1:
            return np.asarray(parts[0], dtype=np.float32)
        return np.concatenate([np.asarray(x, dtype=np.float32) for x in parts], axis=1)

    mp4 = OUT / f"hero-{name}.mp4"
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
         "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1", "-movflags", "+faststart", "-an", str(mp4)],
        stdin=subprocess.PIPE)
    first = None
    for f in range(frames):
        t = f / FPS
        k = min(int(t // step), n - 1)                  # newest shot that has started
        cur = render_shot(k, t)
        if k > 0 and t < k * step + FADE:               # still crossfading in from the previous shot
            a = ease((t - k * step) / FADE)
            cur = render_shot(k - 1, t) * (1 - a) + cur * a
        out = np.clip(cur + 0.5, 0, 255).astype(np.uint8)
        if first is None:
            first = out
        ff.stdin.write(out.tobytes())
    ff.stdin.close()
    if ff.wait() != 0:
        sys.exit("ffmpeg failed")
    Image.fromarray(first).save(OUT / f"hero-{name}-poster.jpg", quality=88)
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(mp4), "-c:v", "libvpx-vp9",
                    "-crf", "37", "-b:v", "0", "-row-mt", "1", "-an", str(OUT / f"hero-{name}.webm")], check=True)
    print("built", mp4, f"{total:.1f}s")


def P(path, crop, d, drift=(0, 0)):
    return (path, tuple(int(v) for v in crop.split(":")), d, drift)

# crop = x:y:w:h in source pixels. The last shot repeats the first, ending at its starting
# framing, so the loop restarts without a visible jump.
portrait = [
    [P("originals/d01.jpg",  "60:32:1134:2016",  "in",  (0.00, -0.02))],
    [P("originals/d10.jpg",  "200:0:814:1448",   "out", (0.00, 0.02))],
    [P("originals/d07.jpg",  "200:0:1125:2000",  "in",  (0.01, 0.00))],
    [P("originals/d15.jpg",  "300:0:1125:2000",  "out", (0.00, -0.02))],
    [P("derived/d11-clean.jpg", "300:0:1006:1790", "in", (0.00, 0.02))],
    [P("originals/d01.jpg",  "60:32:1134:2016",  "out", (0.00, 0.02))],
]
landscape = [
    [P("originals/d01.jpg", "0:400:1264:1422", "in", (0, 0)), P("originals/d10.jpg", "0:226:1086:1222", "out", (0, 0))],
    [P("originals/d09.jpg", "0:200:2048:1152", "in", (-0.02, 0))],
    [P("originals/d07.jpg", "0:250:1500:1688", "out", (0, 0)), P("originals/d15.jpg", "0:200:1536:1728", "in", (0, 0))],
    [P("derived/d11-clean.jpg", "17:0:1591:1790", "in", (0, 0)), P("originals/d16.jpg", "0:0:1024:1152", "out", (0, 0))],
    [P("originals/d01.jpg", "0:400:1264:1422", "out", (0, 0)), P("originals/d10.jpg", "0:226:1086:1222", "in", (0, 0))],
]

if __name__ == "__main__":
    which = sys.argv[1:] or ["portrait", "landscape"]
    if "portrait" in which:
        build("portrait", 1080, 1920, portrait, 30)
    if "landscape" in which:
        build("landscape", 1600, 900, landscape, 29)
