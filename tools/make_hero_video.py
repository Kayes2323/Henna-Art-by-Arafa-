#!/usr/bin/env python3
"""Builds the cinematic hero videos + posters from the supplied photographs.

Originals are never modified. Requires ffmpeg with libx264.
Outputs (assets/video/): hero-portrait.mp4, hero-landscape.mp4, hero-*-poster.jpg

Each shot is one or more "panels" (file, crop w:h:x:y, zoom direction). Portrait uses
one panel per shot; landscape uses two portrait photos side by side (or one wide photo).
The first shot is repeated at the end so the video loops without a visible jump.
"""
import subprocess, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / "assets"
OUT = A / "video"
OUT.mkdir(parents=True, exist_ok=True)
FPS, CLIP, FADE = 25, 3.0, 0.8
FRAMES = int(CLIP * FPS)

def panel(idx, spec, w, h):
    f, crop, direction = spec
    cw, ch, cx, cy = crop
    if direction == "in":
        z = f"min(1.0+on*0.10/{FRAMES},1.10)"
    else:
        z = f"max(1.10-on*0.10/{FRAMES},1.0)"
    return (f"[{idx}:v]crop={cw}:{ch}:{cx}:{cy},scale={w*2}:-2,"
            f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={FRAMES}:s={w}x{h}:fps={FPS},"
            f"setsar=1,format=yuv420p")

def build(name, W, H, shots, crf):
    inputs, filters, labels = [], [], []
    n_in = 0
    for si, panels in enumerate(shots):
        pw = W // len(panels)
        plabels = []
        for spec in panels:
            inputs += ["-i", str(A / spec[0])]
            lab = f"p{n_in}"
            filters.append(panel(n_in, spec[0:1] + spec[1:], pw, H) + f"[{lab}]")
            plabels.append(f"[{lab}]")
            n_in += 1
        if len(panels) > 1:
            filters.append("".join(plabels) + f"hstack=inputs={len(panels)}[s{si}]")
        else:
            filters.append(f"{plabels[0]}null[s{si}]")
        labels.append(f"[s{si}]")
    chain = labels[0]
    for k in range(1, len(labels)):
        off = round(k * (CLIP - FADE), 3)
        out = "[vout]" if k == len(labels) - 1 else f"[x{k}]"
        filters.append(f"{chain}{labels[k]}xfade=transition=fade:duration={FADE}:offset={off}{out}")
        chain = f"[x{k}]"
    mp4 = OUT / f"hero-{name}.mp4"
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs,
           "-filter_complex", ";".join(filters), "-map", "[vout]",
           "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", "-an", str(mp4)]
    subprocess.run(cmd, check=True)
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(mp4),
                    "-frames:v", "1", "-q:v", "3", str(OUT / f"hero-{name}-poster.jpg")], check=True)
    # WebM (VP9) twin for browsers/builds without H.264 support
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(mp4),
                    "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-an",
                    str(OUT / f"hero-{name}.webm")], check=True)
    print("built", mp4)

def P(f, crop, d): return (f, tuple(int(v) for v in crop.split(":")), d)

# ---- Portrait 720x1280 ----
portrait = [
    [P("originals/d01.jpg", "1134:2016:60:32", "in")],
    [P("originals/d10.jpg", "814:1448:200:0", "out")],
    [P("originals/d07.jpg", "1125:2000:200:0", "in")],
    [P("originals/d15.jpg", "1125:2000:300:0", "out")],
    [P("derived/d11-clean.jpg", "1006:1790:300:0", "in")],
    [P("originals/d01.jpg", "1134:2016:60:32", "out")],  # ends at zoom 1.0 = first frame => seamless loop
]
# ---- Landscape 1600x900 ----
landscape = [
    [P("originals/d01.jpg", "1264:1422:0:400", "in"), P("originals/d10.jpg", "1086:1222:0:226", "out")],
    [P("originals/d09.jpg", "2048:1152:0:200", "in")],
    [P("originals/d07.jpg", "1500:1688:0:250", "out"), P("originals/d15.jpg", "1536:1728:0:200", "in")],
    [P("derived/d11-clean.jpg", "1591:1790:17:0", "in"), P("originals/d16.jpg", "1024:1152:0:0", "out")],
    [P("originals/d01.jpg", "1264:1422:0:400", "out"), P("originals/d10.jpg", "1086:1222:0:226", "in")],  # loop closer
]

if __name__ == "__main__":
    which = sys.argv[1:] or ["portrait", "landscape"]
    if "portrait" in which: build("portrait", 720, 1280, portrait, 27)
    if "landscape" in which: build("landscape", 1600, 900, landscape, 28)
