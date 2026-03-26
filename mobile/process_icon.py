import os
from PIL import Image, ImageChops
from rembg import remove


def create_adaptive_icons():
    icon_path = "assets/icon.png"
    fg_path = "assets/android-icon-foreground.png"
    bg_path = "assets/android-icon-background.png"
    mono_path = "assets/android-icon-monochrome.png"

    print("Yükleniyor:", icon_path)
    img = Image.open(icon_path).convert("RGBA")

    # 1. Arka plan rengini en sol üst pikselden alalım
    bg_color = img.getpixel((0, 0))
    # Eğer şeffafsa düz siyah-beyaz vs yapalım, gerçi RGB olduğunu biliyoruz.

    print(f"Orijinal arka plan rengi tespit edildi: {bg_color}")

    # 2. rembg ile arka planı silelim
    print("Arka plan yapay zeka ile siliniyor (bu işlem birkaç saniye sürebilir)...")
    foreground_only = remove(img)

    # 3. Android kırpılmamalari engellemek için %60-%70 bandında merkezi konumlandırma yapmalıyız
    # Expo iconları standart olarak 1024x1024 sever, ve safe zone (güvenli alan) iç kısımda dır.
    FINAL_SIZE = 1024

    # Foreground kısmını 1024x1024 canvasın ortasına oturtalım
    # Mevcut görsel 512x512.
    # İçine yerleştireceğimiz alan boyutunu 600x600 yapalım (veya direk kullanıp canvası 1024 yapalım)
    # Eğer 512'yi 1024 içine koyarsak, merkezde %50 yer kaplar, kırpmalara karşı harika bir koruma!

    fg_canvas = Image.new("RGBA", (FINAL_SIZE, FINAL_SIZE), (0, 0, 0, 0))
    offset = ((FINAL_SIZE - img.width) // 2, (FINAL_SIZE - img.height) // 2)
    fg_canvas.paste(foreground_only, offset, foreground_only)

    print("Ön plan kaydediliyor:", fg_path)
    fg_canvas.save(fg_path)

    # 4. Background olusturalim (duz renk 1024x1024)
    bg_canvas = Image.new("RGB", (FINAL_SIZE, FINAL_SIZE), bg_color[:3])
    print("Arka plan kaydediliyor:", bg_path)
    bg_canvas.save(bg_path)

    # 5. Monochrome olusturalim (tamamen beyaz ic logo, seffaf dis)
    mono_canvas = Image.new("RGBA", (FINAL_SIZE, FINAL_SIZE), (0, 0, 0, 0))
    # foreground_only alpha kanalini alalim
    alpha = foreground_only.split()[3]
    # bembeyaz bir katman
    white_layer = Image.new("RGBA", foreground_only.size, (255, 255, 255, 255))
    # Sadece logonun oldugu yerleri beyaza boya
    white_logo = Image.composite(
        white_layer, Image.new("RGBA", foreground_only.size, (0, 0, 0, 0)), alpha
    )
    mono_canvas.paste(white_logo, offset, white_logo)

    print("Tek renkli (Monochrome) ikon kaydediliyor:", mono_path)
    mono_canvas.save(mono_path)

    print("Tüm Android uyarlanabilir (Adaptive) ikonlar başarıyla oluşturuldu!")


if __name__ == "__main__":
    create_adaptive_icons()
