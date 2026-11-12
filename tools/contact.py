import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1]); cols = int(sys.argv[2]); w = int(sys.argv[3])
files = sorted(src.glob("*.png"))
ims = [Image.open(f).convert("RGB") for f in files]
h = round(ims[0].height * w / ims[0].width)
pad = 6
rows = -(-len(ims) // cols)
sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + pad) + pad), (221, 221, 221))
for i, im in enumerate(ims):
    x = pad + (i % cols) * (w + pad); y = pad + (i // cols) * (h + pad)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y))
sheet.save(src / "contact.jpg", quality=85)
print(len(ims), sheet.size)
