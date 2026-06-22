"""
ひつまぶし写真から背景除去して透過PNGを生成する。
使用: python scripts/remove_bg.py
"""
import urllib.request
import sys
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
    import io
except ImportError as e:
    print(f"ERROR: {e}")
    sys.exit(1)

# ── 元画像URL（Wikimedia Commons） ──────────────────────────────
URL = (
    "https://commons.wikimedia.org/wiki/Special:FilePath/"
    "Hitsumabushi1.jpg?width=900"
)
OUT = Path("public/subjects/hitsumabushi.png")

print("1. 元画像をダウンロード中...")
req = urllib.request.Request(URL, headers={"User-Agent": "NAGOTOSHABot/1.0"})
with urllib.request.urlopen(req) as res:
    img_bytes = res.read()
print(f"   ダウンロード完了 ({len(img_bytes)//1024} KB)")

print("2. 背景除去中（初回はモデルDLで数分かかる場合あり）...")
output_bytes = remove(img_bytes)
print("   背景除去完了")

print("3. 後処理（サイズ最適化）...")
img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

# 元の比率を保ちながら最大 640px に縮小
MAX_W = 640
if img.width > MAX_W:
    ratio = MAX_W / img.width
    img = img.resize(
        (MAX_W, int(img.height * ratio)),
        Image.LANCZOS,
    )

# わずかにアルファを滑らかに（エッジのジャギー軽減）
from PIL import ImageFilter
alpha = img.split()[3]
alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.8))
img.putalpha(alpha)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, "PNG", optimize=True)
print(f"4. 保存完了 → {OUT}  ({OUT.stat().st_size//1024} KB)")
print("\n✅ Done! data/cards.ts の subjectImageUrl を '/subjects/hitsumabushi.png' に設定してください。")
