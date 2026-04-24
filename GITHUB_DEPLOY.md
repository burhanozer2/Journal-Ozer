# Trading Journal - GitHub Pages Deploy Rehberi

## Adım 1: GitHub Hesabı Oluştur

1. https://github.com/signup adresine git
2. E-posta, şifre, kullanıcı adı belirle
3. E-posta doğrulamasını tamamla
4. **Kullanıcı adını not et** (örn: `ahmettrader`)

## Adım 2: GitHub'da Repo Oluştur

1. GitHub'a giriş yap → Sağ üst + işareti → **New repository**
2. Repository name: `trading-journal`
3. Public seçeneğini işaretle
4. **Create repository** butonuna tıkla

## Adım 3: Bilgisayarda Git Kurulumu

### Windows:
1. https://git-scm.com/download/win adresinden indir
2. Kurulum sihirbazını çalıştır (varsayılan ayarlarla ilerle)

### Git Ayarları:
```bash
git config --global user.name "Senin Adın"
git config --global user.email "github@emailin.com"
```

## Adım 4: Projeyi GitHub'a Yükle

### Terminal/PowerShell'i aç ve şu komutları sırayla çalıştır:

```bash
# Proje klasörüne git
cd C:\Users\burha\.verdent\verdent-projects\bir-dashboard-tasarlayacaz-mob\trading-app

# Git başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit"

# Branch adını main yap
git branch -M main

# GitHub bağlantısı (KULLANICI_ADI yerine senin GitHub kullanıcı adın)
git remote add origin https://github.com/KULLANICI_ADI/trading-journal.git

# GitHub'a gönder
git push -u origin main
```

**Not:** İlk push'ta kullanıcı adı ve şifre/token isteyecek.

## Adım 5: GitHub Pages Aktifleştir

1. GitHub'da repo'ya git (`github.com/KULLANICI_ADI/trading-journal`)
2. Üst menüden **Settings** → Sol menüden **Pages**
3. **Source** bölümünden **Deploy from a branch** seç
4. Branch: **gh-pages** / folder: **/(root)**
5. **Save** butonuna tıkla

## Adım 6: Deploy Et (Her güncellemede)

```bash
cd trading-app
npm run build
npm run deploy
```

## Sonuç

Uygulaman şu adreste olacak:
```
https://KULLANICI_ADI.github.io/trading-journal/
```

## Tablet ve Telefondan Erişim

Bu linki tabletinin/telefonunun tarayıcısına yaz:
```
https://KULLANICI_ADI.github.io/trading-journal/
```

**Veriler:** Her cihazda ayrı saklanır (localStorage). Cihazlar arası senkronizasyon için aynı cihazı kullan veya verileri manuel aktar.

## Sorun Olursa

### Git push hatası alırsan:
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADI/trading-journal.git
git push -u origin main
```

### Token gerekiyorsa:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Expiration: No expiration
4. Scopes: repo işaretle
5. Generate → Token'ı kopyala
6. Push yaparken şifre yerine bu token'ı kullan
