# Figma ajanları için ortak talimat
- Figma fileKey: yDV6ZHyj4y5TugiZTeXg8I  · sessionId: e11e2cd2-0d8c-42f3-a465-62ba356dc342 (her use_figma çağrısına ver)
- ÖNCE Skill aracıyla şu becerileri yükle: "figma:figma-use" ve "figma:figma-generate-design". use_figma'da skillNames="figma-use,figma-generate-design". Araç şemaları için ToolSearch "select:mcp__plugin_figma_figma__use_figma".
- Tasarım dili: /Users/abdulkadirserdar/kafe-qr-menu/TASARIM-DILI.md (A = ortak temel + yasaklar; kendi yön bölümün). Kesin uy.
- Gerçek menü: /Users/abdulkadirserdar/kafe-qr-menu/kod/data/menu.json — ürün adı/fiyat BİREBİR buradan; uydurma ürün/fiyat yok. Açıklama boşsa açıklama koyma.
- Görseller Figma'da yüklü (sayfa "Görseller"). imageHash listesi: /Users/abdulkadirserdar/kafe-qr-menu/tasarim/gorsel-hashler.txt . Kullanım: node.fills=[{type:'IMAGE',imageHash:'...',scaleMode:'FILL'}]. MEKAN-KEMER = açılış kemer fotoğrafı (insansız iç mekân). Ürün fotoları dikey 2:3, ürün alt yarıda → kırpımda alt kısmı koru.
- 25 kategori çok: kullanıcıya 4 ana bölüm halinde sun — Kahve & Sıcak (espresso, brewed, turkish-coffee, teas, hot-drinks, matcha, extras), Soğuk & Ferah (milkshake, milk-based, refresh, frozen, garden-of-eden, redbull-mockail, drinks), Tatlı (desserts, cup-of-dessert, cookies, cheesecake, fruit-desserts, croissant), Kahvaltı & Tuzlu (salted-croissant, sandwiches, bowl, plate, toasts). Alt kategoriler bölüm içinde.
- Açılış kompozisyonu (kullanıcının onayladığı): kemer çerçeveli MEKAN-KEMER foto (üst köşeler yarıçap=genişlik/2), üstünde Yellowtail "permesso?" pembe neon (#FF5C72, iki DROP_SHADOW glow: radius 14 a .9 ve radius 34 a .5, renk #F2435A), altında geniş aralıklı PERMESSO wordmark, "caffè · pasticceria · colazione", TR/EN anahtarı, giriş butonu. Yerleşimi koru, yön renkleri/fontlarıyla uygula.
- Bilgiler: Adres 2 Nolu Beşirli Mah. Devlet Sahil Yolu Cad. No:471B Ortahisar/Trabzon · Tel 0531 577 97 00 · Instagram @permessotr · Saat: "Her gün 09:30 – 00:00" (teyit bekliyor). Wi‑Fi şifresi bilinmiyor → "••••••" göster.
- 6 ekran, 390x844, kendi sayfanda yan yana (x aralığı 470), y=120; sayfa üstüne yön adı + 1 satır fikir başlığı:
  1 Açılış · 2 Menü (bölüm gezinme + ürün sunumu + arama/filtre erişimi) · 3 Arama (yazılmış hâl "lot" → Lotus ürünleri eşleşen harf vurgulu + son aramalar) · 4 Filtre (sheet/çekmece, çoklu seçim, canlı "N ürünü göster") · 5 Ürün detayı (gerçek ürün) · 6 Seçtiklerim + Garsona göster (2-3 gerçek ürün, adet, toplam).
- Tekrarlanan öğeleri (ürün kartı/satırı, çip) yerel component yap, instance kullan.
- İkonlar: createNodeFromSvg ile basit 1.6 stroke çizgi ikonlar (ara, filtre, liste, bilgi, kapat, artı/eksi). Emoji YOK.
- Fontları listAvailableFontsAsync ile doğrula; stil adları tam (ör. "SemiBold" vs "Semi Bold").
- Kredi: en fazla ~6 use_figma çağrısı; sonda TEK kompozisyon ekran görüntüsü (sayfadaki 6 ekranı tek seferde, düşük ölçek), gerekirse tek düzeltme + tek ekran görüntüsü. Başka sayfalara DOKUNMA, silme.
- Bitince 6 satırlık rapor: ekran node id'leri, kullanılan fontlar, bilinen eksikler.
