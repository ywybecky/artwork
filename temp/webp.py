from PIL import Image
import os

folder = "."
quality = 75  # 品質 (1-100)

count = 0
error_files = []

for filename in os.listdir(folder):
    if filename.lower().endswith((".jpg", ".jpeg")):
        old_path = os.path.join(folder, filename)
        new_filename = os.path.splitext(filename)[0] + ".webp"
        new_path = os.path.join(folder, new_filename)

        try:
            with Image.open(old_path) as img:
                original_size = os.path.getsize(old_path) / 1024
                img.convert("RGB").save(new_path, "WEBP", quality=quality)
                new_size = os.path.getsize(new_path) / 1024
                count += 1
                print(f"✅ ({count}) {filename} → {new_filename} | {original_size:.0f}KB → {new_size:.0f}KB")
        except Exception as e:
            print(f"❌ 跳過 {filename}：{e}")
            error_files.append(filename)

print(f"\n🎉 完成！共轉換 {count} 張")
if error_files:
    print(f"⚠️ 有問題的檔案：")
    for f in error_files:
        print(f"   - {f}")