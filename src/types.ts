export interface Trade {
  id: string;
  date: string;
  instrument: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  leverage: number;
  stopLoss: number | null;
  takeProfit: number | null;
  commission: number;
  strategy: string;
  mood: string;
}

export interface TradeNote {
  id: string;
  date: string;
  instrument: string;
  entryReason: string;
  technicalAnalysis: string;
  marketConditions: string;
  resultEvaluation: string;
  lessonsLearned: string;
  screenshot: string;
}

export interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  icon: string;
}

export interface AppState {
  budget: number;
  trades: Trade[];
  notes: TradeNote[];
}

export const INSTRUMENTS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)', icon: '₿', yf: 'BTC-USD' },
  { symbol: 'ETHUSDT', name: 'Ethereum (ETH)', icon: 'Ξ', yf: 'ETH-USD' },
  { symbol: 'GOLD', name: 'Altın (Gold)', icon: '🥇', yf: 'GC=F' },
  { symbol: 'SILVER', name: 'Gümüş (Silver)', icon: '🥈', yf: 'SI=F' },
  { symbol: 'SP500', name: 'S&P 500', icon: '📊', yf: '^GSPC' },
  { symbol: 'EURUSD', name: 'EUR/USD', icon: '€', yf: 'EURUSD=X' },
  { symbol: 'USDTRY', name: 'USD/TRY', icon: '₺', yf: 'USDTRY=X' },
] as const;

export type InstrumentName = typeof INSTRUMENTS[number]['name'];

export const STRATEGIES = [
  'Trend Takip', 'Breakout', 'Scalping', 'Swing',
  'Range Trading', 'Momentum', 'Haber Bazlı', 'Diğer'
] as const;

export const MOODS = [
  'Güvenli', 'Nötr', 'Tedirgin', 'Sinirli', 'Heyecanlı', 'İlgisiz'
] as const;

export const LEVERAGES = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125] as const;
