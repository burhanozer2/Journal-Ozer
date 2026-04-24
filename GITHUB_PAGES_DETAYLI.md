# GitHub Pages Ayarlama - Detaylı Anlatım

## Önemli Not
**gh-pages branch** otomatik oluşmaz. Önce `npm run deploy` komutunu çalıştırman gerekir. Bu komut otomatik olarak gh-pages branch'i oluşturur.

## Doğru Sıra

### 1. Önce GitHub'da Repo Oluştur
- https://github.com/new
- Repository name: `trading-journal`
- Public seç
- Create repository

### 2. Projeyi GitHub'a Yükle (PowerShell)
```bash
cd C:\Users\burha\.verdent\verdent-projects\bir-dashboard-tasarlayacaz-mob\trading-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/trading-journal.git
git push -u origin main
```

### 3. Deploy Komutunu Çalıştır (GH-PAGES OLUŞUR)
```bash
npm run build
npm run deploy
```

Bu komut çalıştığında:
- `dist` klasörü otomatik olarak **gh-pages** branch'ine yüklenir
- GitHub'da gh-pages branch'i oluşur

### 4. Şimdi GitHub Pages Ayarla

1. GitHub'da repo'ya git
2. **Settings** sekmesine tıkla (en üstte, Code, Issues'nin yanında)
   
   ![Settings yeri](https://i.imgur.com/settings.png)

3. Sol menüden **Pages**'e tıkla
   - Eğer göremiyorsan, soldaki menüde en alta kaydır
   - "Code and automation" bölümünün altında

4. **Source** bölümünde:
   - Deploy from a branch ✓
   - Branch: **gh-pages** (dropdown'dan seç)
   - Folder: **/(root)**
   - **Save** butonuna tıkla

   ![Pages ayarı](https://i.imgur.com/pages.png)

### 5. Bekle ve Kontrol Et

- Save dedikten sonra 2-3 dakika bekle
- Aynı sayfada üstte şöyle bir mesaj çıkacak:
  ```
  Your site is live at https://KULLANICI_ADIN.github.io/trading-journal/
  ```

### 6. Tabletten Aç

Tabletin/telefonunun tarayıcısına bu adresi yaz:
```
https://KULLANICI_ADIN.github.io/trading-journal/
```

---

## Hala Pages'i Göremiyorsan

GitHub arayüzü değişmiş olabilir. Alternatif yol:

1. Repo ana sayfasında (Code sekmesinde) sağ taraftaki **About** bölümünün altındaki **⚙️** (dişli) ikonuna tıkla
2. Oradan **Pages** seçeneğini bul

Veya doğrudan şu linke git:
```
https://github.com/KULLANICI_ADIN/trading-journal/settings/pages
```

---

## Sık Karşılaşılan Hatalar

### "npm run deploy" hatası
```bash
# Önce build klasörünü temizle
rm -rf dist
# Tekrar dene
npm run build
npm run deploy
```

### Git push şifre istiyor
- GitHub artık şifre kabul etmiyor
- Token oluşturman gerek: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic)
- Scopes: repo seç → Generate
- Çıkan token'ı şifre olarak kullan

---

Hangi adımdasın? Kullanıcı adını ve karşılaştığın hatayı yazarsan yardımcı olurum.
