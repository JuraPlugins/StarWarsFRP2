# 🌌 İmparatorluk Özel Görev Gücü: VORN TİMİ — SW5e Taktik Operasyon Konsolu

Star Wars 5th Edition (SW5e) kurallarına dayalı, 3. seviyeden başlayan 4 kişilik İmparatorluk elit özel görev timi için hazırlanmış interaktif, **Vercel uyumlu** FRP karakter yönetim ve taktik operasyon web uygulaması.

---

## ⚡ Canlı Özellikler

1. **4 Özel Karakter Dosyası (Operatif Yönetimi):**
   - **Dosya 01: Lt. Darius Venn (Teğmen):** Savaşçı (Tactician Specialist) — Taktiksel Üstünlük Zarları (4d8), Manevralar (*Commander's Strike, Rally, Maneuvering Attack*), Toparlanma (*Second Wind*), Eylem Patlaması (*Action Surge*), Blaster Style.
   - **Dosya 02: Joren Kreel (Uzman / Asker):** Savaşçı (Assault Specialist) — Ağır Muharebe Zırhı (Flat 16 AC), DLT-19 Ağır Blaster Tüfeği, Gedik Açıcı (*Breacher: 2x bina/siper kritik hasarı*), Baskı Ateşi (*Suppression Fire DEX Save DC 13*), Parça Bombaları ve Gedik Yükleri.
   - **Dosya 03: Silas Dorn (Keşif Uzmanı):** Kaşif (Scout - Hunter/Stalker Technique) — 35 ft hız, Keskin Nişancı Tüfeği (150/600 ft), Hedef İşaretleme (*Hunter's Quarry +1d6 hasar*), Doğal Kaşif, Nişancı Avantajı (*Sniper's Eye*), 4 TP Scout Techcasting (*Infiltrate, Targeting Shot, Scan Area*), Keşif Droidi.
   - **Dosya 04: Elias Renn (Saha Mühendisi):** Mühendis (Gadgeteer Engineering) — Full Caster (11 TP), Slicing Çift Yetkinliği (+7), Sınırsız Programlar (*Short Circuit, Mending Drone, Haywire*), Seviye 1-2 Programlar (*Shield, Kolto Pack, Overload Defenses*), **V-4 Otonom Destek Droidi** (AC 14, HP 15, Help avantajı, şok püskürtme).

2. **SW5e Cephanelik & Market (Armory):**
   - SW5e kurallarından derlenmiş silahlar, vibro bıçaklar, zırhlar, patlayıcılar, medikal stimpackler, taktik aletler ve deri altı sibernetikler.
   - Karakter kredisi ile marketten eşya satın alma, tek tıkla kuşanma/çıkarma, envanter ağırlığı takibi.
   - GM ve oyuncular için **Özel İtem Üretme Konsolu** (kendi özel silahınızı/zırhınızı oluşturup karaktere ekleyin).

3. **Seviye Atlama (Level Up Wizard):**
   - 3. seviyeden 4, 5, 6. seviyelere terfi edebilme.
   - **Can Puanı Artışı:** Sabit ortalama veya 1d10 / 1d8 can zarı atma (Dayanıklılık CON modifikasyonu dahil).
   - **Yetenek Puanı Artışı (ASI) veya SW5e Feat (Yetenek) Seçimi:** *Uzman Keskin Nişancı (Sharpshooter), Ağır Zırh Ustası, Tetikte (Alert), Çelik Bünye (Tough), Teknoloji Çırağı, Kıdemli Slicer vb.*
   - **Yeni Tech Programları / Manevralar:** Seviye atlayınca kütüphaneden yeni güçler ve manevralar öğrenme.
   - Otomatik Yeterlilik Bonusu (PB) artışı (Seviye 5'te +3), atak isabetleri ve DC'lerin otomatik yeniden hesaplanması.
   - Kutlama animasyonu (*Konfeti patlaması*) ve askeri terfi ses efekti.

4. **Holografik Zar Masası (Dice Roller):**
   - d4, d6, d8, d10, d12, d20 ve d100 sanal zarlar.
   - Avantaj (Advantage) / Normal / Dezavantaj (Disadvantage) modları.
   - Kritik Başarı (Nat 20) ve Kritik Başarısızlık (Nat 1) algılama ve görsel vurgulama.
   - Özel formül atabilme (örn: `2d8 + 3`, `1d12 + 1d6 + 3`).
   - Karakter sayfalarındaki herhangi bir saldırı, hasar, kurtarma atışı (Save) veya beceriye tıklayarak doğrudan sesli zar atma!

5. **Tim Konsolu & Savaş İnisiyatif Sırası:**
   - 4 operatifin canlı durumları, sağlık çubukları ve hızlı hasar/iyileştirme butonları.
   - **Tim Sinerjisi & Taktik Doktrini:** Öncü Hattı, Gözcü & Sızma, Arka Hat Desteği taktiksel rehberi.
   - Otomatik tur sayacı ve savaş inisiyatif takip sistemi (düşman ekleme/çıkarma).

6. **Dinlenme (Kısa & Uzun Mola):**
   - **Kısa Mola (1 Saat):** Hit Dice harcayarak can tazeleme, Second Wind, Action Surge, Üstünlük Zarları ve Tech Noktası şarjı.
   - **Uzun Mola (8 Saat):** Tüm can puanları, zarlar, yetenekler ve droid onarımı %100 tazelenir.

7. **Ses Efektleri & Kalıcı Kayıt (Web Audio API & LocalStorage):**
   - İnternet gerektirmeyen dahili blaster ateşi, bilgisayar bipi, kolto iyileştirme, zar sesi ve seviye atlama fanfarı (Sesi Aç/Kapat anahtarı).
   - Tüm değişiklikler otomatik olarak tarayıcı belleğine (LocalStorage) kaydedilir.
   - **Dışa Aktar (JSON İndir):** Karakterlerinizi istediğiniz zaman dosya olarak yedekleyin.
   - **İçe Aktar (JSON Yükle):** Farklı bir cihazda veya GM konsolunda karakter dosyalarını anında geri yükleyin.

---

## 🚀 Kurulum & Yerel Çalıştırma

Projeyi bilgisayarınızda çalıştırmak için:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirici sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın: `http://localhost:5173`

---

## ☁️ Vercel Üzerinde Yayınlama (Deploy)

Bu proje Vercel için sıfır konfigürasyon (`vercel.json` dahil) ile tam uyumludur.

### Yöntem 1: Vercel CLI İle (En Hızlı)
```bash
npx vercel
```
Komut istemini takip edin; birkaç saniye içinde canlı URL adresiniz üretilecektir.

### Yöntem 2: GitHub ile Vercel Dashboard
1. Projeyi bir GitHub deposuna yükleyin (`git push`).
2. [vercel.com](https://vercel.com) adresine gidin.
3. **"Add New Project"** butonuna tıklayıp deponuzu seçin.
4. Framework Preset olarak **Vite** otomatik algılanacaktır.
5. **Deploy** butonuna basın!

---

## 🛠️ Kullanılan Teknolojiler

- **React 19 + TypeScript**
- **Vite Bundler**
- **Vanilla CSS (Imperial Datapad Design System)**: Scanlines, HUD cam efekti, neon vurgular, duyarlı mobil/tablet/masaüstü uyumu.
- **Lucide Icons**: Star Wars taktiksel arayüz ikonları.
- **Web Audio API**: Çevrimdışı sentetik bilimkurgu ses efektleri.
- **Canvas Confetti**: Seviye atlama kutlama parçacıkları.
