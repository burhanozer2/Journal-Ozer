# GitHub Pages Manuel Ayarlama

## 1. GitHub'da Pages Ayarını Yap

1. https://github.com/burhanozer2/Journal-Ozer adresine git
2. **Settings** sekmesine tıkla (en üstte)
3. Sol menüden **Pages**'e tıkla
4. **Source** bölümünde:
   - **Deploy from a branch** seç
   - Branch: **main** seç
   - Folder: **/(root)** seç
   - **Save** butonuna tıkla

## 2. Veya Daha Kolay Yöntem - GitHub Actions

1. Repo ana sayfasında (Code sekmesi)
2. **.github/workflows** klasörü oluştur
3. İçine **deploy.yml** dosyası ekle:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 3. Şu An İçin Hızlı Çözüm

Kodu zaten yükledin. Şimdi GitHub'da şunu yap:

1. https://github.com/burhanozer2/Journal-Ozer/settings/pages git
2. **Build and deployment** bölümünde:
   - Source: **GitHub Actions** seç
3. Ana sayfaya dön → **Actions** sekmesi
4. **New workflow** → **set up a workflow yourself**
5. Yukarıdaki YAML kodunu yapıştır → Commit

## 4. Sonuç

Site şu adreste olacak:
```
https://burhanozer2.github.io/Journal-Ozer/
```

## Tablet/ Telefondan Erişim

Tarayıcıya yaz:
```
https://burhanozer2.github.io/Journal-Ozer/
```

---

**Not:** Token'ı (ghp_...) güvenlik için GitHub'dan silmenizi öneririm:
Settings → Developer settings → Personal access tokens → Token'ı sil
