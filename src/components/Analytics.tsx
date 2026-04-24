import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import type { AppState } from '../types';
import { STRATEGIES, MOODS, INSTRUMENTS } from '../types';
import { calcPnL } from '../services/storage';

interface Props {
  state: AppState;
}

function fmt(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const COLORS = ['#06b6d4', '#3b82f6', '#a855f7', '#f97316', '#22c55e', '#ef4444', '#eab308', '#14b8a6'];

export default function Analytics({ state }: Props) {
  const closedTrades = state.trades.filter(t => t.exitPrice !== null);

  const strategyData = useMemo(() => {
    return STRATEGIES.map(s => {
      const trades = closedTrades.filter(t => t.strategy === s);
      const total = trades.reduce((sum, t) => sum + (calcPnL(t) ?? 0), 0);
      const wins = trades.filter(t => (calcPnL(t) ?? 0) > 0).length;
      return {
        name: s,
        count: trades.length,
        pnl: total,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
        avg: trades.length > 0 ? total / trades.length : 0,
      };
    }).filter(s => s.count > 0);
  }, [closedTrades]);

  const instrumentData = useMemo(() => {
    return INSTRUMENTS.map(inst => {
      const trades = closedTrades.filter(t => t.instrument === inst.name);
      const total = trades.reduce((sum, t) => sum + (calcPnL(t) ?? 0), 0);
      const wins = trades.filter(t => (calcPnL(t) ?? 0) > 0).length;
      return {
        name: inst.name.replace(/\s*\(.*\)/, ''),
        count: trades.length,
        pnl: total,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
      };
    }).filter(s => s.count > 0);
  }, [closedTrades]);

  const moodData = useMemo(() => {
    return MOODS.map(m => {
      const trades = closedTrades.filter(t => t.mood === m);
      const total = trades.reduce((sum, t) => sum + (calcPnL(t) ?? 0), 0);
      const wins = trades.filter(t => (calcPnL(t) ?? 0) > 0).length;
      return {
        name: m,
        count: trades.length,
        pnl: total,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
      };
    }).filter(s => s.count > 0);
  }, [closedTrades]);

  const directionData = useMemo(() => {
    const long = closedTrades.filter(t => t.direction === 'LONG');
    const short = closedTrades.filter(t => t.direction === 'SHORT');
    return [
      { name: 'LONG', value: long.length, pnl: long.reduce((s, t) => s + (calcPnL(t) ?? 0), 0) },
      { name: 'SHORT', value: short.length, pnl: short.reduce((s, t) => s + (calcPnL(t) ?? 0), 0) },
    ].filter(d => d.value > 0);
  }, [closedTrades]);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--white)' }}>{title}</h3>
      {children}
    </div>
  );

  const StatTable = ({ data }: { data: { name: string; count: number; pnl: number; winRate: number }[] }) => (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {['', 'İşlem', 'Toplam K/Z', 'Win Rate'].map(h => (
            <th key={h} className="text-left px-3 py-2 text-xs font-medium" style={{ color: 'var(--gray)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.name} className="hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border)' }}>
            <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--white)' }}>{row.name}</td>
            <td className="px-3 py-2.5 mono" style={{ color: 'var(--gray-light)' }}>{row.count}</td>
            <td className="px-3 py-2.5 mono font-bold" style={{
              color: row.pnl >= 0 ? 'var(--green)' : 'var(--red)'
            }}>
              {row.pnl >= 0 ? '+' : ''}{fmt(row.pnl)}
            </td>
            <td className="px-3 py-2.5 mono" style={{
              color: row.winRate >= 50 ? 'var(--green)' : 'var(--red)'
            }}>
              {fmt(row.winRate)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (closedTrades.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p className="text-lg" style={{ color: 'var(--gray)' }}>
          Analiz için en az bir kapatılmış işlem gerekli
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--white)' }}>Performans Analizi</h2>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Strateji Performansı">
          {strategyData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={strategyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white)', fontSize: 12 }}
                    formatter={(value: any) => [`$${fmt(Number(value))}`, 'K/Z']}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {strategyData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <StatTable data={strategyData} />
            </>
          ) : <p style={{ color: 'var(--gray)' }}>Veri yok</p>}
        </Section>

        <Section title="Yön Dağılımı">
          {directionData.length > 0 ? (
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={directionData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    <Cell fill="var(--green)" />
                    <Cell fill="var(--red)" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {directionData.map(d => (
                  <div key={d.name}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.name === 'LONG' ? 'var(--green)' : 'var(--red)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--white)' }}>{d.name}</span>
                      <span className="mono text-xs" style={{ color: 'var(--gray)' }}>({d.value})</span>
                    </div>
                    <div className="mono text-sm ml-5" style={{ color: d.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {d.pnl >= 0 ? '+' : ''}{fmt(d.pnl)} USDT
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <p style={{ color: 'var(--gray)' }}>Veri yok</p>}
        </Section>

        <Section title="Enstrüman Performansı">
          <StatTable data={instrumentData} />
        </Section>

        <Section title="Duygu Durumu Analizi">
          <StatTable data={moodData} />
        </Section>
      </div>
    </div>
  );
}
