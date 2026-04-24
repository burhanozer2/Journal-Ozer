# Trading Journal

Kripto ve forex trading günlüğü web uygulaması. Canlı fiyatlar, işlem takibi ve performans analizi.

## Özellikler

- **Dashboard**: 8 KPI kartı, 30 günlük K/Z grafiği, canlı fiyatlar, son işlemler
- **İşlem Günlüğü**: LONG/SHORT işlem kaydı, otomatik K/Z hesaplama
- **İşlem Notları**: Strateji analizi, ders çıkarılan
- **Analiz**: Strateji, enstrüman ve duygu durumu bazlı performans

## Canlı Fiyatlar (Otomatik Güncelleme)

| Enstrüman | Kaynak |
|-----------|--------|
| BTC, ETH | Binance |
| Altın, Gümüş, S&P 500, EUR/USD, USD/TRY | Yahoo Finance |

**Güncelleme sıklığı**: Her 1 saat (manuel de mümkün)

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda: http://localhost:5173

## Build

```bash
npm run build
```

`dist/` klasörüne çıktı alır. Statik hosting ile yayınlanabilir.

## Veri Saklama

Tüm veriler tarayıcının **localStorage**'ında saklanır. Verileriniz cihazınızda kalır, sunucuya gitmez.

## Kullanım

1. **Dashboard** → Başlangıç bütçenizi girin
2. **İşlem Günlüğü** → İşlemlerinizi kaydedin
3. **Notlar** → Strateji notlarınızı yazın
4. **Analiz** → Performansınızı inceleyin

## Kısayollar

| Tuş | İşlem |
|-----|-------|
| Header'daki 🔄 | Fiyatları manuel yenile |
| İşlem Günlüğü → + | Yeni işlem ekle |
| Notlar → + | Yeni not ekle |
