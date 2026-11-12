"""스틸 PNG를 장면별(sheet_<scene>.jpg)로 묶는다. usage: sheets.py <dir> <cols> <width>"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

src = Path(sys.argv[1])
cols = int(sys.argv[2])
w = int(sys.argv[3])
groups: dict[str, list[Path]] = {}
for f in sorted(src.glob("*.png")):
    groups.setdefault(f.stem.split("_")[1], []).append(f)
for name, fs in groups.items():
    ims = [Image.open(f).convert("RGB") for f in fs]
    h = round(ims[0].height * w / ims[0].width)
    pad = 6
    rows = -(-len(ims) // cols)
    sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + pad) + pad), (221, 221, 221))
    for i, im in enumerate(ims):
        x = pad + (i % cols) * (w + pad)
        y = pad + (i // cols) * (h + pad)
        sheet.paste(im.resize((w, h), Image.Resampling.LANCZOS), (x, y))
    sheet.save(src / f"sheet_{name}.jpg", quality=88)
    print(name, len(ims))
