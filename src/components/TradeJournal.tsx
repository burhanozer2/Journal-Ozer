import { useState } from 'react';
import type { Trade } from '../types';
import { INSTRUMENTS, STRATEGIES, MOODS, LEVERAGES } from '../types';
import { calcPnL, calcPnLPercent } from '../services/storage';
import { Plus, Trash2, Edit3, X, Check } from 'lucide-react';

interface Props {
  trades: Trade[];
  onAdd: (t: Trade) => void;
  onUpdate: (t: Trade) => void;
  onDelete: (id: string) => void;
}

const empty: Omit<Trade, 'id'> = {
  date: new Date().toISOString().slice(0, 10),
  instrument: INSTRUMENTS[0].name,
  direction: 'LONG',
  entryPrice: 0,
  exitPrice: null,
  quantity: 0,
  leverage: 1,
  stopLoss: null,
  takeProfit: null,
  commission: 0,
  strategy: STRATEGIES[0],
  mood: MOODS[0],
};

function fmt(n: number | null, d = 2): string {
  if (n === null) return '—';
  return n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function TradeJournal({ trades, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const handleSubmit = () => {
    if (editId) {
      onUpdate({ ...form, id: editId } as Trade);
      setEditId(null);
    } else {
      onAdd({ ...form, id: crypto.randomUUID() } as Trade);
    }
    setForm(empty);
    setShowForm(false);
  };

  const startEdit = (t: Trade) => {
    setForm(t);
    setEditId(t.id);
    setShowForm(true);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gray-light)' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: 'var(--white)' }}>İşlem Günlüğü</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          style={{
            background: showForm ? 'var(--red)' : 'var(--cyan)',
            color: '#fff',
          }}
        >
          {showForm ? <><X size={16} /> İptal</> : <><Plus size={16} /> Yeni İşlem</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 animate-in">
          <div className="grid grid-cols-4 gap-4">
            <Field label="Tarih">
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} className="w-full" />
            </Field>
            <Field label="Enstrüman">
              <select value={form.instrument} onChange={e => setForm({ ...form, instrument: e.target.value })} className="w-full">
                {INSTRUMENTS.map(i => <option key={i.symbol} value={i.name}>{i.name}</option>)}
              </select>
            </Field>
            <Field label="Yön">
              <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value as 'LONG' | 'SHORT' })} className="w-full">
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </Field>
            <Field label="Kaldıraç">
              <select value={form.leverage} onChange={e => setForm({ ...form, leverage: Number(e.target.value) })} className="w-full">
                {LEVERAGES.map(l => <option key={l} value={l}>{l}x</option>)}
              </select>
            </Field>
            <Field label="Giriş Fiyatı">
              <input type="number" step="any" value={form.entryPrice || ''} placeholder="0.00"
                onChange={e => setForm({ ...form, entryPrice: parseFloat(e.target.value) || 0 })} className="w-full" />
            </Field>
            <Field label="Çıkış Fiyatı">
              <input type="number" step="any" value={form.exitPrice ?? ''} placeholder="Açık pozisyon"
                onChange={e => setForm({ ...form, exitPrice: e.target.value ? parseFloat(e.target.value) : null })} className="w-full" />
            </Field>
            <Field label="Miktar">
              <input type="number" step="any" value={form.quantity || ''} placeholder="0"
                onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} className="w-full" />
            </Field>
            <Field label="Komisyon">
              <input type="number" step="any" value={form.commission || ''} placeholder="0"
                onChange={e => setForm({ ...form, commission: parseFloat(e.target.value) || 0 })} className="w-full" />
            </Field>
            <Field label="Stop Loss">
              <input type="number" step="any" value={form.stopLoss ?? ''} placeholder="—"
                onChange={e => setForm({ ...form, stopLoss: e.target.value ? parseFloat(e.target.value) : null })} className="w-full" />
            </Field>
            <Field label="Take Profit">
              <input type="number" step="any" value={form.takeProfit ?? ''} placeholder="—"
                onChange={e => setForm({ ...form, takeProfit: e.target.value ? parseFloat(e.target.value) : null })} className="w-full" />
            </Field>
            <Field label="Strateji">
              <select value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} className="w-full">
                {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Duygu Durumu">
              <select value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} className="w-full">
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium cursor-pointer"
              style={{ background: 'var(--green)', color: '#fff' }}>
              <Check size={16} /> {editId ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Tarih', 'Enstrüman', 'Yön', 'Giriş', 'Çıkış', 'Miktar', 'Kaldıraç', 'K/Z', 'K/Z %', 'Strateji', 'Duygu', ''].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium" style={{ color: 'var(--gray)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-12" style={{ color: 'var(--gray)' }}>Henüz işlem eklenmedi</td></tr>
            ) : (
              [...trades].reverse().map(t => {
                const pnl = calcPnL(t);
                const pnlPct = calcPnLPercent(t);
                const isProfit = pnl !== null && pnl >= 0;
                return (
                  <tr key={t.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-3 py-2.5 mono text-xs" style={{ color: 'var(--gray-light)' }}>{t.date}</td>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--white)' }}>{t.instrument}</td>
                    <td className="px-3 py-2.5">
                      <span className={`badge ${t.direction === 'LONG' ? 'badge-green' : 'badge-red'}`}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 mono" style={{ color: 'var(--gray-light)' }}>{fmt(t.entryPrice)}</td>
                    <td className="px-3 py-2.5 mono" style={{ color: 'var(--gray-light)' }}>{t.exitPrice !== null ? fmt(t.exitPrice) : '—'}</td>
                    <td className="px-3 py-2.5 mono" style={{ color: 'var(--gray-light)' }}>{fmt(t.quantity, 4)}</td>
                    <td className="px-3 py-2.5 mono" style={{ color: 'var(--gray-light)' }}>{t.leverage}x</td>
                    <td className="px-3 py-2.5 mono font-bold" style={{
                      color: pnl === null ? 'var(--gray)' : isProfit ? 'var(--green)' : 'var(--red)'
                    }}>
                      {pnl !== null ? `${isProfit ? '+' : ''}${fmt(pnl)}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 mono" style={{
                      color: pnlPct === null ? 'var(--gray)' : pnlPct >= 0 ? 'var(--green)' : 'var(--red)'
                    }}>
                      {pnlPct !== null ? `${pnlPct >= 0 ? '+' : ''}${fmt(pnlPct * 100)}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--gray-light)' }}>{t.strategy}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--gray-light)' }}>{t.mood}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(t)} className="p-1.5 rounded hover:bg-white/5 cursor-pointer" style={{ color: 'var(--blue)' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => onDelete(t.id)} className="p-1.5 rounded hover:bg-white/5 cursor-pointer" style={{ color: 'var(--red)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
