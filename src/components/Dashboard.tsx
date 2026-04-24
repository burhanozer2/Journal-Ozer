import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, DollarSign, Target, Trophy,
  AlertTriangle, BarChart2, Wallet
} from 'lucide-react';
import type { AppState, PriceData } from '../types';
import { calcPnL } from '../services/storage';

interface Props {
  state: AppState;
  prices: PriceData[];
  totalPnL: number;
  winRate: number;
  winCount: number;
  lossCount: number;
  closedCount: number;
  bestTrade: number;
  worstTrade: number;
  onBudgetChange: (b: number) => void;
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function Dashboard({
  state, prices, totalPnL, winRate, closedCount,
  bestTrade, worstTrade, onBudgetChange
}: Props) {
  const [budgetInput, setBudgetInput] = useState(state.budget > 0 ? state.budget.toString() : '');

  const currentBalance = state.budget + totalPnL;
  const returnPct = state.budget > 0 ? (totalPnL / state.budget) * 100 : 0;

  // 30-day PnL chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const days: { date: string; pnl: number; cumulative: number }[] = [];
    let cumulative = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      const dayPnL = state.trades
        .filter(t => t.date === dateStr && t.exitPrice !== null)
        .reduce((sum, t) => sum + (calcPnL(t) ?? 0), 0);

      cumulative += dayPnL;
      days.push({ date: label, pnl: dayPnL, cumulative });
    }
    return days;
  }, [state.trades]);

  // Recent trades (last 8)
  const recentTrades = useMemo(() => {
    return [...state.trades]
      .filter(t => t.exitPrice !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
  }, [state.trades]);

  const kpiCards = [
    {
      label: 'Başlangıç Bütçesi',
      value: null,
      isInput: true,
      color: 'var(--cyan)',
      icon: <Wallet size={20} />,
      glow: 'glow-cyan',
    },
    {
      label: 'Toplam K/Z',
      value: `$${fmt(totalPnL)}`,
      color: totalPnL >= 0 ? 'var(--green)' : 'var(--red)',
      icon: <DollarSign size={20} />,
      glow: totalPnL >= 0 ? 'glow-green' : 'glow-red',
    },
    {
      label: 'Güncel Bakiye',
      value: `$${fmt(currentBalance)}`,
      color: 'var(--orange)',
      icon: <Target size={20} />,
      glow: 'glow-orange',
    },
    {
      label: 'Toplam Getiri',
      value: `${returnPct >= 0 ? '+' : ''}${fmt(returnPct)}%`,
      color: returnPct >= 0 ? 'var(--teal)' : 'var(--red)',
      icon: <TrendingUp size={20} />,
      glow: 'glow-teal',
    },
    {
      label: 'Win Rate',
      value: `${fmt(winRate * 100, 1)}%`,
      color: 'var(--purple)',
      icon: <Trophy size={20} />,
      glow: 'glow-purple',
    },
    {
      label: 'Toplam İşlem',
      value: closedCount.toString(),
      color: 'var(--blue)',
      icon: <BarChart2 size={20} />,
      glow: 'glow-blue',
    },
    {
      label: 'En İyi İşlem',
      value: `$${fmt(bestTrade)}`,
      color: 'var(--green)',
      icon: <TrendingUp size={20} />,
      glow: 'glow-green',
    },
    {
      label: 'En Kötü İşlem',
      value: `$${fmt(worstTrade)}`,
      color: 'var(--red)',
      icon: <AlertTriangle size={20} />,
      glow: 'glow-red',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div
            key={card.label}
            className={`card ${card.glow} p-4 animate-in stagger-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--gray)' }}>
                {card.label}
              </span>
              <span style={{ color: card.color, opacity: 0.6 }}>{card.icon}</span>
            </div>
            {card.isInput ? (
              <input
                type="number"
                placeholder="0.00"
                value={budgetInput}
                onChange={(e) => {
                  setBudgetInput(e.target.value);
                  const val = parseFloat(e.target.value) || 0;
                  onBudgetChange(val);
                }}
                className="w-full text-2xl font-bold mono bg-transparent border-none p-0 focus:ring-0 focus:shadow-none"
                style={{ color: card.color, outline: 'none', boxShadow: 'none' }}
              />
            ) : (
              <div className="text-2xl font-bold mono" style={{ color: card.color }}>
                {card.value}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main content: Chart + Recent Trades */}
      <div className="grid grid-cols-[1fr_360px] gap-4">
        {/* Chart */}
        <div className="card p-5 animate-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--white)' }}>
              30 Günlük İlerleme
            </h3>
            <span className="text-xs mono" style={{
              color: totalPnL >= 0 ? 'var(--green)' : 'var(--red)'
            }}>
              {totalPnL >= 0 ? '+' : ''}{fmt(totalPnL)} USDT
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradientPnL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--white)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                }}
                formatter={(value: any) => [`$${fmt(Number(value))}`, 'Kümülatif K/Z']}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="var(--teal)"
                strokeWidth={2.5}
                fill="url(#gradientPnL)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Trades */}
        <div className="card p-5 animate-in stagger-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--white)' }}>
            Son İşlemler
          </h3>
          <div className="space-y-2">
            {recentTrades.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--gray)' }}>
                Henüz işlem yok
              </p>
            ) : (
              recentTrades.map(trade => {
                const pnl = calcPnL(trade) ?? 0;
                const isProfit = pnl >= 0;
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors"
                    style={{ background: 'var(--bg-card-alt)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: isProfit ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: isProfit ? 'var(--green)' : 'var(--red)',
                        }}
                      >
                        {isProfit ? '↑' : '↓'}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--white)' }}>
                          {trade.instrument}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--gray)' }}>
                          {trade.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold mono" style={{
                        color: isProfit ? 'var(--green)' : 'var(--red)'
                      }}>
                        {isProfit ? '+' : ''}{fmt(pnl)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--gray)' }}>
                        {trade.direction}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="card p-5 animate-in stagger-7">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--white)' }}>
          Canlı Fiyatlar
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Enstrüman', 'Fiyat', 'Değişim', '24s Yüksek', '24s Düşük', 'Hacim', 'Durum'].map(h => (
                  <th key={h} className="text-xs font-medium px-4 py-3 text-left" style={{ color: 'var(--gray)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.map((p, i) => {
                const isUp = p.change24h > 0;
                const isDown = p.change24h < 0;
                return (
                  <tr
                    key={p.symbol}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: i < prices.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon}</span>
                        <span className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 mono font-semibold text-sm" style={{ color: 'var(--white)' }}>
                      {p.price > 0 ? fmt(p.price, p.price < 10 ? 4 : 2) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.price > 0 ? (
                        <span className={`badge ${isUp ? 'badge-green' : isDown ? 'badge-red' : ''}`}>
                          {isUp ? '▲' : isDown ? '▼' : '━'} {fmt(Math.abs(p.change24h))}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 mono text-sm" style={{ color: 'var(--gray-light)' }}>
                      {p.high24h > 0 ? fmt(p.high24h, p.high24h < 10 ? 4 : 2) : '—'}
                    </td>
                    <td className="px-4 py-3 mono text-sm" style={{ color: 'var(--gray-light)' }}>
                      {p.low24h > 0 ? fmt(p.low24h, p.low24h < 10 ? 4 : 2) : '—'}
                    </td>
                    <td className="px-4 py-3 mono text-sm" style={{ color: 'var(--gray-light)' }}>
                      {p.volume > 0 ? fmt(p.volume, 0) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.price > 0 && (
                        <span className="text-sm font-medium" style={{
                          color: isUp ? 'var(--green)' : isDown ? 'var(--red)' : 'var(--gray)'
                        }}>
                          {isUp ? '▲ Yükseliş' : isDown ? '▼ Düşüş' : '━ Sabit'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
