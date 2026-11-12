# Permesso – Görsel Kürasyon

Not: `mekan/` klasörü aslında terasta çekilmiş içecek/tatlı fotoğrafları (mekân iç/dış çekimi yok; 0 numara hariç). Numaralar alfabetik sıradadır.

## 1) Hero / arka plan (mekan/)
| # | Dosya | Neden | 9:16 kırpma |
|---|---|---|---|
| 1 | `8D6A9930-copy-scaled.jpg` (1707x2560, zaten dikey 2:3) | Sarı kokteyl, ortada; arkada PERMESSO tabelası + kemerli pencereler, sıcak ışık, insan yok | Üst/alttan hafif kes (2:3 -> 9:16, ~%7 yükseklik); tabela üstte kalsın, başlık için sol-üst boş |
| 2 | `8D6A9961-copy-scaled.jpg` (#12, turuncu kokteyl) | Aynı sahne, daha dengeli, bitki+kaktüs çerçeve | Aynı; `object-position: center 30%` |
| 3 | `8D6A9997-copy-scaled.jpg` (#21, cappuccino) | Alt yarı masa boş, üstte tabela: metin yerleştirmeye uygun | Alt %25 masa ağırlıklı kırp; kahve odağı |
Ek: #23/#24 (`FKAM2200/2207`, kruvasan, yatay) yalnız yatay/masaüstü bölüm için. #0 (`4932...scaled.jpg`, kahve makinesi/ışık) mekân hissi için ikincil, düşük çözünürlük riski.

## 2) Ambient video
Video özeti (süre / çözünürlük):
| Dosya | Süre | Çöz. | İçerik | Karar |
|---|---|---|---|---|
| `PERMESSO-PROMO-1.mp4` | 36.0s | 1080x1920 | İç mekân 3D/render turu, logo kartı, vitrin, kahve makinesi; insan yok | **EN İYİ** |
| `Projeedited.webm` | 24.9s | 1080x1920 | Aynı iç mekân, siyah geçiş kareleri | 2. seçenek (siyahlar var) |
| `Promoedited.webm` | 24.9s | 1920x1080 | Aynı, yatay + siyah bantlar | yedek (masaüstü) |
| `Permesso-Promo-1.webm` | 36.0s | 1080x1080 | Promo kare versiyon | yedek |
| `Permesso-Bahce(-1).webm` | 11.6s | 1080x1080 | Gece bahçe render, insan yok, koyu | gece teması için |
| `04*.mp4/webm` (3 dosya) | 22.4s | 1080x1080 / 1080x1920 | Etkinlik afişi, **erkek yüz** | **KULLANMA** |

Önerilen aralık (`PERMESSO-PROMO-1.mp4`): 0–5s ve 12–36s (insansız iç mekân; ~9–11s logo kartı). Döngü için 0–20s kes. Başı/sonu fade ile birleştir.
Sıkıştırma (sessiz, 720x1280, <3MB):
```
ffmpeg -i PERMESSO-PROMO-1.mp4 -ss 0 -t 15 -an -vf "scale=720:1280,fps=24" -c:v libx264 -crf 29 -preset slow -profile:v main -pix_fmt yuv420p -movflags +faststart -maxrate 1.2M -bufsize 2.4M ambient.mp4
ffmpeg -i PERMESSO-PROMO-1.mp4 -ss 0 -t 15 -an -vf "scale=720:1280,fps=24" -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 ambient.webm
```
Boyut >3MB çıkarsa `-t 10` veya crf +2. Poster: `ffmpeg -i ambient.mp4 -frames:v 1 poster.jpg`. Kaynak çözünürlük 1080 olduğundan 720p dikey kayıpsız küçülür.

## 3) Ürün fotoğrafları (urun/, 88 adet)
- 83 adedi (`ALAMETI-FARIKA` ... `ZEYTINLI-CROISSANT`) ortak stil: **bulanık sarı/altın kemerli arka plan + koyu gri-kahve ahşap masa**, ürün alt yarıda ortalanmış, sıcak yumuşak ışık, dikey kare (~2:3).
- Aykırı 5 dosya (`p1-1`, `p2`..`p5`): açık gri arka plan, plastik bardaklı soğuk içecek, silik logo/filigran -> tutarsız; kart görselinde kullanma ya da ayrı "soğuk içecek" grubu yap.
- Redbull (67–72) kutular: aynı arka plan, tutarlı.
Sunum: kesik (transparan) değil, **arka planlı tam kare** kullan; kartta `aspect-ratio: 4/5`, `object-fit: cover; object-position: center 70%` (ürün alta yakın). Arka planın altın tonu menü temasını (krem/altın) belirlesin; koyu ahşap alt bant gölge/kart zemini olarak çalışır. Listede küçük 1:1 thumb: aynı pozisyonla kırp.

## 4) Baskın renkler
| Grup | Hex |
|---|---|
| Mekân | `#312f29` koyu, `#cda47c` kum/ahşap, `#d9c6af` krem, `#ab9f90` taş gri, `#674a37` kahve, `#826f5a` |
| Ürün (83 adet) | `#e7ce8c` açık altın, `#c2aa79` altın, `#dcb269`, `#b19060`, `#988569` zeytin-bej, `#7b6049` ahşap |
| Ürün (p1–p5) | `#dad2c8`, `#e2dacf`, `#bab4a6`, `#8c715b` |
Önerilen palet: krem `#E7DCC8`, altın `#C2AA79`, ahşap `#7B6049`, koyu `#312F29`.

## 5) Logo
| Dosya | Boyut | Şeffaflık | Renk | Kullanım |
|---|---|---|---|---|
| `nobackround.png` | 452x552 | **evet** (palet/alfa) | açık gri/beyaz çizgi | **Koyu zemin** (hero overlay, koyu footer). Açık zeminde görünmez |
| `permesso-beyaz-siyah-1-scaled.png` | 2094x2560 | **hayır** (beyaz opak) | siyah çizgi, beyaz zemin | **Açık/krem zemin**; krem üzerinde `mix-blend-mode: multiply` ile beyazı gider; yüksek çözünürlük (header için küçült) |
| `permessovideoiciss.png` | 502x577 | hayır | **mekân fotoğrafı, insanlar var** | **KULLANMA** (logo değil) |
İpucu: siyah logodan şeffaf PNG/SVG türet (beyazı alfaya çevir) -> tek dosya iki zeminde.

## KULLANMA listesi
- `video/04-2.mp4`, `video/04-JLUY-FRI.mp4`, `video/04.mp4` (erkek yüzlü etkinlik afişi)
- `logo/permessovideoiciss.png` (insanlar, müşteriler)
- Video karelerinde insan yok kontrolü yalnız örneklemeyle yapıldı; yayından önce `Permesso-Bahce` ve `PERMESSO-PROMO-1` son kez izlensin. Mekan/ ve urun/ örneklem kontrolünde yüz/çanta/müşteri yok.
