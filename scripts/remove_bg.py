"""
ひつまぶし写真の背景除去スクリプト
- alpha matting で自然なエッジ
- 元画像と同じサイズで出力（subjectLayerが objectFit:cover で完全一致する）
"""
import urllib.request, io, sys
from pathlib import Path

try:
    from rembg import remove, new_session
    from PIL import Image, ImageFilter
except ImportError as e:
    print(f"ERROR: {e}")
    sys.exit(1)

URL = (
    "https://commons.wikimedia.org/wiki/Special:FilePath/"
    "Hitsumabushi1.jpg?width=900"
)
OUT = Path("public/subjects/hitsumabushi.png")

print("1. Downloading source image...")
req = urllib.request.Request(URL, headers={"User-Agent": "NAGOTOSHABot/1.0"})
with urllib.request.urlopen(req) as res:
    img_bytes = res.read()
print(f"   Downloaded ({len(img_bytes)//1024} KB)")

print("2. Removing background (u2net + alpha matting)...")
session = new_session("u2net")
output_bytes = remove(
    img_bytes,
    session=session,
    alpha_matting=True,
    alpha_matting_foreground_threshold=235,
    alpha_matting_background_threshold=12,
    alpha_matting_erode_size=8,
)
print("   Background removal complete")

print("3. Post-processing: gentle feather + keep original size...")
img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

# ── アルファを少しぼかしてエッジを柔らかく ──
r, g, b, alpha = img.split()
alpha_soft = alpha.filter(ImageFilter.GaussianBlur(radius=1.0))
img.putalpha(alpha_soft)

# ── サイズは変更しない（base写真と同じ寸法で出力） ──
print(f"   Output size: {img.size[0]}x{img.size[1]}px")

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, "PNG", optimize=True, compress_level=6)
sz = OUT.stat().st_size // 1024
print(f"4. Saved -> {OUT}  ({sz} KB)")
print("Done.")
