import type { PriceData } from '../types';

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

const BINANCE_SYMBOLS: Record<string, { name: string; icon: string }> = {
  BTCUSDT: { name: 'Bitcoin (BTC)', icon: '₿' },
  ETHUSDT: { name: 'Ethereum (ETH)', icon: 'Ξ' },
  PAXGUSDT: { name: 'Altın (Gold)', icon: '🥇' },
};

export async function fetchPrices(): Promise<PriceData[]> {
  const results: PriceData[] = [];

  // 1. Binance for crypto
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    const data: BinanceTicker[] = await res.json();
    const lookup = new Map(data.map(d => [d.symbol, d]));

    for (const [sym, info] of Object.entries(BINANCE_SYMBOLS)) {
      const t = lookup.get(sym);
      if (t) {
        results.push({
          symbol: sym,
          name: info.name,
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          high24h: parseFloat(t.highPrice),
          low24h: parseFloat(t.lowPrice),
          volume: parseFloat(t.quoteVolume),
          icon: info.icon,
        });
      }
    }
  } catch (e) {
    console.error('Binance fetch error:', e);
  }

  // 2. Yahoo Finance via allorigins proxy for Gold, Silver, SP500, EUR/USD, USD/TRY
  const yahooSymbols = [
    { yf: 'GC=F', name: 'Altın (Gold)', icon: '🥇', symbol: 'GOLD' },
    { yf: 'SI=F', name: 'Gümüş (Silver)', icon: '🥈', symbol: 'SILVER' },
    { yf: '^GSPC', name: 'S&P 500', icon: '📊', symbol: 'SP500' },
    { yf: 'EURUSD=X', name: 'EUR/USD', icon: '€', symbol: 'EURUSD' },
    { yf: 'USDTRY=X', name: 'USD/TRY', icon: '₺', symbol: 'USDTRY' },
  ];

  // Remove duplicate gold from Binance (PAXG) if Yahoo provides it
  const hasPAXG = results.find(r => r.symbol === 'PAXGUSDT');

  for (const item of yahooSymbols) {
    if (item.symbol === 'GOLD' && hasPAXG) {
      // Replace PAXG with label "Altın"
      const idx = results.findIndex(r => r.symbol === 'PAXGUSDT');
      if (idx >= 0) results[idx].name = 'Altın (PAXG)';
    }
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.yf)}?interval=1d&range=2d`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0];
      if (meta && quotes) {
        const closes = quotes.close?.filter((v: any) => v !== null) || [];
        const highs = quotes.high?.filter((v: any) => v !== null) || [];
        const lows = quotes.low?.filter((v: any) => v !== null) || [];
        const vols = quotes.volume?.filter((v: any) => v !== null) || [];
        const price = meta.regularMarketPrice || closes[closes.length - 1] || 0;
        const prevClose = meta.previousClose || (closes.length > 1 ? closes[closes.length - 2] : price);
        const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        // Remove PAXG if we got real gold
        if (item.symbol === 'GOLD') {
          const paxgIdx = results.findIndex(r => r.symbol === 'PAXGUSDT');
          if (paxgIdx >= 0) results.splice(paxgIdx, 1);
        }

        results.push({
          symbol: item.symbol,
          name: item.name,
          price,
          change24h: change,
          high24h: highs.length > 0 ? Math.max(...highs) : price,
          low24h: lows.length > 0 ? Math.min(...lows) : price,
          volume: vols.length > 0 ? vols[vols.length - 1] : 0,
          icon: item.icon,
        });
      }
    } catch (e) {
      console.error(`Yahoo fetch error for ${item.yf}:`, e);
      // Fallback: add empty
      results.push({
        symbol: item.symbol,
        name: item.name,
        price: 0,
        change24h: 0,
        high24h: 0,
        low24h: 0,
        volume: 0,
        icon: item.icon,
      });
    }
  }

  return results;
}
