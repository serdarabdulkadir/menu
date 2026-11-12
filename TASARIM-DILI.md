# Permesso QR Menü — Tasarım Dili (ortak temel + 3 yön: v2, v3, v4)

Durum: v1 reddedildi (krem zemin + Bodoni + yazı listesi + pill sekmeler = sıradan). Üç yön, menü deneyiminde YAPISAL olarak ayrışır; açılış kompozisyonu ve marka çekirdeği ortaktır.

# A. ORTAK TEMEL

## A1. Marka çekirdeği
- "Permesso?" = "girebilir miyim?"; yanıt "Avanti!" (Billy Wilder). Menü, bir eşik/kapı deneyimi: önce izin iste, sonra içeri gir.
- Kemer, mekânın tek ve en güçlü formudur (cephe, kapı, iç niş). Her yönde kemer farklı rolde kullanılır (aşağıda).
- Ton: sıcak Akdeniz, retro sinema, zarif; bağıran değil davet eden. Metinler kısa, TR/EN, cümle düzeni (BÜYÜK HARF etiket yok).

## A2. Açılış ekranı (3 yönde de AYNI kompozisyon, kullanıcı onayladı)
1. Kemer çerçeveli mekân fotoğrafı (insan/çanta KIRPILMIŞ ya da hiç görünmeyen kare; cephe gecesi veya terrazzo+sütun+kürelerin içi tercih).
2. Fotoğrafın üstünde pembe neon "permesso?" (el yazısı, glow). 3. Altında aralıklı büyük PERMESSO (tracking +0.32em). 4. En altta "caffè · pasticceria · colazione" + TR/EN anahtarı + "Avanti!" girişi.
- Yön farkı yalnız zemin rengi, neon dozu ve giriş animasyonudur; yerleşim sabit.

## A3. Tipografi seçim mantığı
- Neon imzası: Yellowtail (ince neon tüp hissi en iyi bunda; Mr Dafoe fazla kalın, Pacifico fazla "tatil"). Yalnız "permesso?" ve en çok 1-2 mikro an (boş durum, teşekkür).
- Ürün adı ve fiyat için "karakterli serif" + metin/arayüz için "sessiz grotesk". Display serif tek bir yerde sahne alır, UI Instrument Sans/DM Sans/Manrope kalır. Rakamlar: tabular-nums, fiyatta "₺" küçük.
- Her yön farklı serif seçer (Fraunces / Instrument Serif / Cormorant) ki üçü de gerçekten farklı hissettirsin. Bodoni Moda yalnız v1'di; kullanılmaz.
- Okunabilirlik: gövde 15-16px min, ürün açıklaması 13.5-14px, dokunma hedefi >=44px.

## A4. Ortak işlev gereksinimleri (menü verisinden türetilir)
- ARAMA (şart): alt dock'ta/üstte sabit buton; tam ekran açılır; ilk görünüm: "Son aramalar" (localStorage, silinebilir) + "Sık bakılanlar" (kategori adları + 6 öneri çip); yazdıkça anlık sonuç (TR karakter duyarsız: "cay"="çay", "kasar"="kaşar", ürün adı + açıklama + malzeme eşleşir, eşleşen harf vurgulanır); sonuç yoksa: "Bulamadık. Kategoriye göz at" + 3 öneri.
- FİLTRELER (alt sheet, çoklu seçim, sonuç sayısı canlı "12 ürünü göster"): Sıcak/Soğuk; Kafeinsiz; Tatlı/Tuzlu; Süt yok (vegan seçeneği varsa); Fiyat aralığı (slider 2 uç, veri min-max); Fotoğraflı (88 ürün için); Yeni/Önerilen (işaret verisi varsa). Veri yoksa filtre GİZLENİR, uydurulmaz. Aktif filtre = çip şeridi + tek dokunuşla kaldır + "Temizle".
- ÜRÜN DETAYI: alttan açılan sayfa (tam foto 2:3, ad, açıklama, boy/süt seçenekleri, alerjen/not, fiyat, "Seçtiklerime ekle").
- SEÇTİKLERİM / GARSONA GÖSTER: kayıt değil sipariş DEĞİL; yerel liste. Adet +/-, toplam tutar, "Garsona göster" = büyük yazı, masa notu alanı, ekran uyanık kalır, yüksek kontrast, parlaklık önerisi. Sepet/ödeme dili kullanılmaz.
- Wi‑Fi, saatler, iletişim, adres, Instagram: "Bilgi" sayfası (dock'taki son ikon ya da üst sağ "i"); Wi‑Fi tek dokunuşla şifre kopyalama. Açık saat çelişkisi (08:30–01:00 vs 09:30–00:00) teyit edilene dek "bugün açık / kapanış" tek satır, veri tek kaynaktan.
- Dil: TR/EN, açılışta ve Bilgi'de anahtar; seçim saklanır; ürün adları çevrilebilir alanlı.
- Fotoğraf kuralı: ürün fotoğrafları dikey 2:3, kemer/oval kesim yalnız ürün kartında; mekân fotoğraflarında insan/çanta olmayacak (kırp/kare seç).
- Performans: ilk 6 ürün hızlı, kalan lazy, düşük kalite önizleme (blur-up), yerel ağda 3G'de kullanılabilir.

## A5. Ortak hareket ilkeleri
- Hareket eylemi yanıtlar; kendiliğinden hareket yalnız imza anında. Süreler: mikro 140ms, geçiş 280ms, sahne 600-900ms. Easing: cubic-bezier(.2,.8,.2,1) (çıkış), cubic-bezier(.65,0,.35,1) (kemer açılımı). prefers-reduced-motion: tüm imza anlar anında ve fade'e iner.

## A6. YASAKLAR (AI slop)
- Krem zemin + yüksek kontrast serif + toprak/terrakota vurgu üçlemesi (v2'de bilinçli kırıldı); siyah zemin + tek asit yeşil/vermilyon; gazete kolonları + hairline + sıfır radius.
- Aynı yarıçaplı, aynı gri gölgeli, özdeş kart ızgarası; her şeye gradient wash; cam (glassmorphism) paneller.
- Büyük harfli, aralıklı "eyebrow" etiket her başlıkta; "01/02/03" numaralandırma (içerik sıra değil); başlıkta tek kelimeyi italik/renkli yapma; "Kategori — açıklama" tireli etiketler; "→" oklu her buton; monospace mikro etiket.
- Pill sekme şeridi (v1), yazı-yazı fiyat listesi + noktalı çizgi, emoji ikonlar, stok ikon seti kalabalığı.
- Hover'lı her karta kaydır-belir animasyonu; sürekli dönen/sallanan dekor; konfeti; "Hoş geldiniz!" jenerik metinler.
- Neon pembeyi gövde metni, buton dolgusu ya da büyük alan rengi yapmak. Neon = yalnız "permesso?" ve aktif imza anı (+ v3'te seçim vurgusu).
- Terrazzo dokusunu fotoğraf/metin altına koymak (okunurluk); kemeri dekor olarak çoğaltmak (boş kemer duvar kâğıdı).
- Mekân görsellerinde insan, çanta, laptop, tabela dışı marka; stok fotoğraf.

---

# B. v2 — "VİTRİN" (dokunsal, kemer-galeri, açık tema)

Fikir: Menü, pastacı vitrini ve kemerli nişlerden oluşur. Her ürün kemer nişinde duran bir objedir; kategori gezinmesi bir oda/kapı seçimi gibi hissedilir. Mekânın en fiziksel yanı: sıva, meşe, terrazzo.
İmza etkileşim: "Avanti!" geçişi. Kategori kemerine dokununca o kemer ekranı dolduracak şekilde genişler (kemer maskesi büyür, 700ms), arkasından ürün vitrini açılır; geri = kemer küçülür.

## Palet (açık)
| rol | hex | kontrast |
|---|---|---|
| bg (sıva) | #F6F0E6 | zemin |
| surface (kemer niş zemini) | #EDE3D3 | metin 12.75:1 |
| text (espresso) | #2A1E17 | bg üzerinde 14.29:1 |
| muted | #6B5B4E | bg 5.73:1, surface 5.11:1 |
| accent (konyak) | #8A4B2A | bg 5.94:1 |
| neon | #E8375A (neon yalnız glow/dekor) | metin için #C2243F: bg 5.12:1, beyaz üstünde 5.8:1 |
| line | #D8CBB8 (yalnız dekor; bilgi taşımaz) | |
| sıcak vurgu (turuncu minder) | #F08A24, yalnız büyük/dolgu, metin DEĞİL | |
- Gece teması: bg #17110D, surface #241A14, text #F3EADC (15.69:1), muted #A99886 (6.7:1), neon #FF8FA3 metin (8.65:1). Sistem tercihi + 20:00 sonrası öneri.

## Font eşleşmesi
- Fraunces (opsiyonel SOFT 100, WONK 1, weight 500) ürün adı/başlık; Instrument Sans metin/UI; Yellowtail neon.
- Ölçek: ürün adı 22/26 -0.01em; kategori adı 34/36; açıklama 14/21; fiyat 17/20 Instrument Sans 600 tabular; UI etiket 13/16 +0.01em (büyük harf değil).

## Menü yerleşimi
- Kategori gezinme: ekranın üstünde yatay "kemer şeridi": her kategori küçük kemer-kesimli fotoğraf (64x84) + altında ad; aktif kemerin kenarı konyak 2px. Kaydırınca sıradaki bölüme otomatik geçer (scroll-spy).
- Ürün sunumu: 2 sütun, kenarlıksız "niş" ürün, fotoğraf 2:3 kemer kesim (üst yarım daire, alt düz), altında ad + fiyat; ızgara değişken ritimde (her 5. ürün tam genişlik, "vitrin vurgusu"). Açıklama detayda, listede tek satır.
- Arama/filtre: alt dock "yüzen kapsül" yok; dock sıva zemininde tam genişlik, ikonlar: Ara, Filtre (sayaç rozet), Seçtiklerim (tutar), Bilgi. Arama: tam ekran, kemer biçimli arama alanı.
- Seçtiklerim: dock'tan açılan alt sayfa; satır başına küçük kemer thumb; "Garsona göster" tam ekran büyük tipografi.

## Şekil/doku
- Kemer: tüm ürün fotoğrafları (üst r=999), kategori kemerleri. Diğer köşeler r=4 ya da sıfır (UI sakin). Gölge: yok; yerine 1px #D8CBB8 çizgi + yüzey tonu farkı. Terrazzo: yalnız açılış arka planında ve boş durumlarda, %6 opaklık. ASLA: terrazzo metin altı, çift kemer içi kemer.

---

# C. v3 — "AVANTI SİNEMASI" (sinematik, koyu, afiş/gösterim)

Fikir: Menü bir film programı: ürünler "gösterimdeki" afişler, kategoriler "seanslar". Kafe gece 00:00'a kadar açık; koyu tema birincil, neon pembe gerçek ışık kaynağı olur (hover'da değil, seçili öğede parlar). Billy Wilder afişinin retro baskı dokusu ve sinema perdesi oranı (2.39:1 yatay kare görünümler) kullanılır.
İmza etkileşim: "Kapı çalma". Açılışta neon "permesso?" iki kez yanıp söner (floresan tutuşması), kullanıcı "Avanti!" der gibi ekrana dokununca neon söner, perde gibi iki yana açılır ve menü ışıkla belirir (900ms). Ürüne dokunmak = "projeksiyon": ürün fotoğrafı tam ekran açılır, kenarlarda vinyet.

## Palet (koyu birincil)
| rol | hex | kontrast |
|---|---|---|
| bg (salon) | #17110D | zemin |
| surface (koltuk deri) | #241A14 | text 14.29:1 |
| text (perde beyazı) | #F3EADC | bg 15.69:1 |
| muted | #A99886 | bg 6.7:1; #8F7F6E (yalnız yardımcı) 4.84:1 |
| accent (projeksiyon amber) | #F0A04B | bg 8.76:1, surface 7.98:1 |
| neon | #FF5C7A | bg 6.29:1, surface 5.73:1 (metinde kullanılabilir) |
| line | #3A2C23 (dekor) | |
| afiş kırmızı (espresso makinesi) | #C2243F | beyaz üstünde 5.8:1 (rozet) |
- Açık "gündüz" alternatifi: v2 paleti; sistem tercihine göre.

## Font eşleşmesi
- Instrument Serif (yalnız büyük başlık/kategori, italik "film adı" gibi) + Manrope (UI, ürün adı 600, fiyat) + Yellowtail neon.
- Ölçek: kategori başlığı 44/44 Instrument Serif -0.01em; ürün adı 18/22 Manrope 600; açıklama 13.5/20 muted; fiyat amber 16/20 tabular.

## Menü yerleşimi
- Kategori gezinme: dikey "program" yerine yatay kaydırmalı SEANS KARTLARI üstte: her kategori küçük 16:9 şerit (ürün fotoğrafının kırpımı, karartılmış) üstünde Instrument Serif ad; aktif olan neon çerçeve (1.5px glow). Altında tek bir kategori içeriği (sayfa bazlı, kaydırınca yan geçiş sağa-sola, scroll-spy yok).
- Ürün sunumu: tek sütun, tam genişlik "afiş": fotoğraf 2:3'ün 4:5 kırpımı, alta binen gradyan değil düz koyu bant: ad + fiyat + kısa açıklama; yatay kaydırma yok. Yatay "ana şerit" yalnız "Bu gece önerilen" için.
- Arama/filtre: üst sağda arama (büyüteç), arama tam ekran "bilet gişesi" gibi: büyük Instrument Serif input, altında son aramalar bilet-kesik çizgili satırlar. Filtre: alt sheet; çipler koyu yüzeyde, seçili = neon kenar + dolgu #FF5C7A %12.
- Seçtiklerim: "Biletlerim" adı YOK (jenerik kaçın): "Seçtiklerim". Garsona göster ekranı: siyah zemin, büyük amber tutar, yüksek kontrast.

## Şekil/doku
- Kemer yalnız açılış ve neon çerçevede; ürün görselleri keskin dikdörtgen r=2, perforasyon (bilet kesiği) yalnız arama sonuç satırlarında. Gölge yerine glow (yalnız neon). Film greni %4 yalnız arka planda ve statik (animasyonlu değil). ASLA: tüm UI'ı pembeye boğmak, film şeridi kenar süsü, soluk sepya filtresi ürün fotoğraflarında (renk doğruluğu).

---

# D. v4 — "GİARDİNO DERGİ" (editoryal, tropik bitki, açık-yeşil)

Fikir: Menü bir İtalyan seyahat/yemek dergisi gibi akar: büyük tipografik açılışlar, tam sayfa fotoğraflar, yan notlar. Rengi mekânın bitkilerinden ve terrazzo grisi-yeşilinden alır (krem değil: soğuk kireç + derin yeşil, turuncu minder ve neon aksan). Kategori = "bölüm", ürün = "sayfa".
İmza etkileşim: "Sayfa çevirme". Kategoriler arası geçişte büyük bölüm başlığı sol kenara dikey dönerek (rotate -90, 500ms) yerleşir ve fotoğraf kemerli bir "pencere"den belirir; ürün listesi kaydırılırken bölüm adı sol kenarda yapışık kalır.

## Palet (açık)
| rol | hex | kontrast |
|---|---|---|
| bg (kireç) | #E9E6DA | zemin |
| surface (kâğıt) | #F4F1E6 | text >12:1 |
| text (orman espresso) | #1F2A22 | bg 11.89:1 |
| muted | #566058 | bg 5.23:1, surface 5.79:1 |
| accent (strelitzia yeşili) | #2F5D45 | bg 6.06:1; üzerinde #F4F1E6 yazı 6.7:1 |
| sıcak vurgu (turuncu minder) | #A33B0A (metin) ~5.3:1 bg; dolgu için #E8731A | |
| neon | #C2243F metin 4.64:1 bg; glow #FF5C7A yalnız açılışta | |
| line | #CFCBBB (dekor) | |
- Gece teması: bg #101A14, surface #18251D, text #EEF0E4, accent #7FC8A0, neon #FF8FA3 (hepsi >=7:1 hedef; Figma'da doğrulanmalı).

## Font eşleşmesi
- Cormorant Garamond (display, 500/italic büyük bölüm adları; metin boyutunda DEĞİL, <20px kullanılmaz) + Figtree (ürün adı 600, açıklama, UI) + Yellowtail neon.
- Ölçek: bölüm adı 64/58 -0.02em (dikey yapışık 28/28); ürün adı 19/24 Figtree 600; açıklama 14/21; fiyat 16/20 tabular; yan not 12.5/18 italic Cormorant ->min 13px.

## Menü yerleşimi
- Kategori gezinme: sol kenarda yapışık dikey "içindekiler" rayı (ince, 28px) ve üstte tam ekran "İçindekiler" sayfası (kategori adı büyük, yanında ürün sayısı, sağda küçük kemer foto); raya dokununca içindekiler açılır. Pill/sekme YOK.
- Ürün sunumu: asimetrik editoryal akış: bir ürün tam genişlik kemer-pencere fotoğraf (2:3), sonraki ikisi yan yana küçük; ardından yalnız metin "kısa liste" (içecek varyantları: ad, boy, fiyat sağda) — fotoğrafsız ürünler editoryal "kenar notu" olarak durur. Böylece fotoğraflı/fotoğrafsız karışıklık kusur değil ritim olur.
- Arama/filtre: sabit üst bar sağında arama ikonu; arama içindekiler gibi tam sayfa, öneriler "Bugün ne canın çekiyor?" ile 4 öneri çip (tatlı, sıcak, kafeinsiz, kahvaltı). Filtreler sola kaydırmalı çekmece (yan panel), sayfa kenarına yapışık; aktif filtreler bölüm başlığı altında düz metin cümlesi ("Sıcak, kafeinsiz, 150 ₺ altı · 9 ürün") + tek dokunuşla temizle.
- Seçtikleri: sağ alt köşede küçük yuvarlak değil, kâğıt "ayraç" (bookmark) şeklinde sabit sekme: sayı + tutar; açılınca sağdan sayfa. Garsona göster: büyük Cormorant liste.

## Şekil/doku
- Kemer yalnız fotoğraf penceresinde; metin blokları r=0; çizgi: yalnız bölüm ayırıcı 1px #CFCBBB. Terrazzo: bg üstünde %5 benek (açık gri-yeşil), yalnız boş alanlarda. Gölge yok. ASLA: bitki illüstrasyon clipart'ı, yaprak deseni arka planı, çok sütunlu gazete kolonları (A6).

---

# D2. v5 — "BASKI" (işletmenin kendi kimliği: DRINKS / DESSERTS menü afişlerinden)

Gözlem (DRINKS-v1.jpg, DESSERTS.jpg): kiremit/pas kırmızısı kâğıt zemin (hafif elyaf/leke dokusu), tek renk soluk şeftali-pembe yazı; ince tek çizgili geniş harfli PERMESSO logosu; "/DRINKS" "/DESSERTS" eğik çizgili sayfa etiketi; bölüm başlıkları hafif grotesk BÜYÜK HARF; ürünler monospace büyük harf + noktalı kılavuz çizgi + sağa hizalı fiyat; varyantlar küçük karma harfli monospace, "•" madde; alt çizgi + küçük logo + WhatsApp/Instagram. Tek renk, çok sakin, "daktilo baskı" havası.
Fikir: Menü, işletmenin kendi baskı menüsünün dijital karşılığıdır: aynı kiremit kâğıt, aynı monospace fiyat ritmi; üstüne yalnız dijitte gereken katmanlar (arama, filtre, foto önizleme) eklenir. Tanıdıklık = güven; müşteri duvardaki/Instagram'daki menüyü tanır. Marka-içi caps kullanımı bu yönde BİLİNÇLİ istisnadır (A6'daki büyük harf yasağı yalnız etiket/eyebrow içindir); UI etiketleri yine karma harf.
İmza etkileşim: "Mühür/Baskı". Menü açılırken kâğıt zemin boş gelir, satırlar daktilo gibi yukarıdan aşağı 18ms/satır belirir (yalnız ilk açılış, toplam <700ms); fiyat kılavuz noktaları sağa doğru "çizilir". Bir ürüne dokununca satırın noktaları kısalır ve küçük foto satırın altına açılır (accordion, 280ms), böylece liste bozulmadan foto görülür.

## Palet (kâğıt = birincil)
| rol | hex | kontrast |
|---|---|---|
| bg (kiremit kâğıt) | #7A3828 (baskıdaki ton ~#8B4332'nin AA için biraz koyusu) | zemin |
| surface (koyu kâğıt, sheet/dock) | #6A2F22 | text 8.0:1 (yaklaşık) |
| text (şeftali krem) | #F3E3D3 | bg 6.91:1 |
| muted (baskıdaki varyant rengi) | #E8CDB8 | bg 5.72:1, surface 6.78:1 |
| accent (kehribar, yalnız seçili/fiyat vurgusu) | #F2A65A | surface 5.08:1 (bg üstünde 4.28 = sadece >=18px ya da ikon) |
| neon | #FFC2CE metin (bg 5.72:1); glow #FF8FA3 (surface 4.75:1) | |
| line | #E8CDB8 %55 (dekor, baskıdaki çizgi) | |
- Gece: bg #3A1A12, text #E8CDB8 (10.37:1), muted #D9B9A4 (8.55:1), neon #FF8FA3 (7.27:1). Doku: kâğıt elyafı (referans JPG'den kırpılmış 256px döşenebilir doku) %100 opak yalnız bg'de.

## Font eşleşmesi
- Wordmark PERMESSO: işletmenin logo SVG'si (ince geniş geometrik; fontta eşi yok). Yedek: Manrope ExtraLight 200, tracking +0.18em, M ve R özelleştirilmeden.
- Ürün adı/fiyat/varyant: monospace. Figma listesinde yok; öneri Geist Mono (Geist ailesi ile aynı kaynak) ya da DM Mono; yedek Geist. Ad: 15/20 BÜYÜK, tracking +0.06em; fiyat 15/20 tabular sağa hizalı; varyant 13.5/19 karma harf; açıklama 13.5/20.
- Bölüm başlığı: Instrument Sans 400, 26/28 BÜYÜK HARF, tracking +0.02em (baskıdaki hafif grotesk). "/KATEGORİ" sayfa etiketi: monospace 14/16.
- Yellowtail yalnız neon permesso? (açılış/boş durum).

## Menü yerleşimi
- Kategori gezinme: baskıdaki gibi iki "sayfa": üstte "/DRINKS  /DESSERTS" (monospace, eğik çizgili, aktif olan altı çizili tam genişlik çizgiyle birleşir; iki-üç sekme için pill DEĞİL, çizgi üstünde metin). Sayfa içinde bölüm başlıkları (ESPRESSO, BREWED, TEAS, EXTRAS) sticky; sağ kenarda ince "atla" listesi (bölüm adları, dokun-git).
- Ürün sunumu: baskı satırı birebir: "• AD ........ 200" tek sütun, kılavuz noktaları CSS dotted leader; varyantlar (Vanilla, Hazelnut...) satır altında küçük, çoklu seçim işaretlenebilir (• → ●). Fotoğraflı ürünlerde adın solunda 40x56 kemer-kesim mini foto + dokununca accordion açılımı; fotoğrafsız ürünler düz satır kalır. Büyük foto yalnız detay sayfasında (2:3).
- Arama/filtre: iki ikon baskıdaki üst çizginin hizasında sağda ("ara", "süz"), arama tam ekran, koyu surface üstünde monospace giriş "_" yanıp sönen imleç; sonuçlar menü satırı formatında, kılavuz noktalı, kategori yolu "/ESPRESSO" olarak sağ altta. Filtre alt sheet: onay kutusu satırları "[ ] Kafeinsiz" (daktilo kutusu), fiyat için iki uçlu çizgi üstünde ● tutamaç; aktif filtreler üst çizgi altında "• sıcak • kafeinsiz • <=200" satırı.
- Seçtiklerim: alt dock kâğıt koyu surface, "3 ürün ........ 630" (aynı kılavuz); Garsona göster: tam ekran fişe benzer liste, monospace büyük, kâğıt zemin, tutar sonda; "fiş" jargonu kullanılmaz.
- Bilgi: baskıdaki alt şerit: WhatsApp +90 531 577 97 00 (tek dokunuş), Instagram /permessotr, Wi‑Fi, saatler; alt çizgi + küçük logo.

## Şekil/doku
- Köşe r=0; çizgi: tek renk 1px ve noktalı kılavuz (içerik taşır: ad→fiyat bağı). Kemer YALNIZ mini foto ve açılış; gölge yok; terrazzo yok (kâğıt dokusu onun yerine). ASLA: kâğıt zeminde gradyan, ikinci renk dolgulu buton, kart/kutu, serif (marka kimliğinde yok), kılavuz noktasız fiyat sütunu.

---

# E. Figma ekran listesi (her yön için 6 ekran, aynı sıra)
1. Açılış (A2 kompozisyon; yön rengi/neon dozu).
2. Menü ana (kategori gezinme + ürün sunumu + dock/rayı).
3. Arama (boş hâl: son aramalar+öneriler; yazılmış hâl: eşleşen harf vurgulu sonuç; sonuç yok).
4. Filtre (sheet/çekmece, çoklu seçim, canlı sonuç sayısı) + aktif filtre görünümü.
5. Ürün detayı (foto, boy/süt seçenekleri, alerjen, "Seçtiklerime ekle").
6. Seçtiklerim + Garsona göster (adet, toplam, tam ekran büyük liste). Opsiyonel 7: Bilgi (Wi‑Fi kopyala, saat, iletişim, dil).

# F. Seçim ipucu
- v2 en güvenli ve marka/mekâna en yakın; v3 en akılda kalan ve gece açık kafeye en uygun; v4 en editoryal ve fotoğraf (88 görsel) gücünü en çok kullanan. Karışım önerisi: v2 yapısı + v3 gece teması. v5 = işletmenin kendi baskı menüsüne en sadık, en hızlı taranan ve fiyat okuması en net yön; fotoğraf gücünü en az kullanır (v2/v4 ile hibrit: v5 satırı + v2 kemer detay).
