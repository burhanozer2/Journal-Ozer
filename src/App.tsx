import { useState, useEffect, useCallback } from 'react';
import type { PriceData, Trade, TradeNote, AppState } from './types';
import { calcPnL } from './services/storage';
import { fetchPrices } from './services/priceService';
import {
  loadStateFromSupabase, saveTradeToSupabase, deleteTradeFromSupabase,
  saveNoteToSupabase, deleteNoteFromSupabase, saveBudget
} from './services/supabase';
import Dashboard from './components/Dashboard';
import TradeJournal from './components/TradeJournal';
import TradeNotes from './components/TradeNotes';
import Analytics from './components/Analytics';
import {
  LayoutDashboard, BookOpen, StickyNote, BarChart3, RefreshCw, Cloud, CloudOff
} from 'lucide-react';

type Page = 'dashboard' | 'journal' | 'notes' | 'analytics';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [state, setState] = useState<AppState>({ budget: 0, trades: [], notes: [] });
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');

  // İlk yükleme - Supabase'ten
  useEffect(() => {
    loadStateFromSupabase().then(s => {
      setState(s);
      setSyncStatus('synced');
    }).catch(() => {
      setSyncStatus('error');
    });
  }, []);

  const refreshPrices = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchPrices();
      setPrices(p);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshPrices();
    const interval = setInterval(refreshPrices, 3600000);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  // Trade işlemleri
  const handleAddTrade = async (t: Trade) => {
    setSyncStatus('syncing');
    try {
      await saveTradeToSupabase(t);
      setState(prev => ({ ...prev, trades: [...prev.trades, t] }));
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleUpdateTrade = async (t: Trade) => {
    setSyncStatus('syncing');
    try {
      await saveTradeToSupabase(t);
      setState(prev => ({
        ...prev,
        trades: prev.trades.map(tr => tr.id === t.id ? t : tr)
      }));
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    setSyncStatus('syncing');
    try {
      await deleteTradeFromSupabase(id);
      setState(prev => ({
        ...prev,
        trades: prev.trades.filter(tr => tr.id !== id)
      }));
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  // Note işlemleri
  const handleAddNote = async (n: TradeNote) => {
    setSyncStatus('syncing');
    try {
      await saveNoteToSupabase(n);
      setState(prev => ({ ...prev, notes: [...prev.notes, n] }));
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleUpdateNote = async (n: TradeNote) => {
    setSyncStatus('syncing');
    try {
      await saveNoteToSupabase(n);
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(nt => nt.id === n.id ? n : nt)
      }));
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleDeleteNote = async (id: string) => {
    setSyncStatus('syncing');
    try {
      await deleteNoteFromSupabase(id);
      setState(prev => ({
        ...prev,
        notes: prev.notes.filter(nt => nt.id !== id)
      }));
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleBudgetChange = (b: number) => {
    saveBudget(b);
    setState(prev => ({ ...prev, budget: b }));
  };

  const totalPnL = state.trades.reduce((sum, t) => sum + (calcPnL(t) ?? 0), 0);
  const closedTrades = state.trades.filter(t => t.exitPrice !== null);
  const winCount = closedTrades.filter(t => (calcPnL(t) ?? 0) > 0).length;
  const lossCount = closedTrades.filter(t => (calcPnL(t) ?? 0) < 0).length;
  const closedCount = closedTrades.length;
  const winRate = closedCount > 0 ? winCount / closedCount : 0;
  const bestTrade = closedCount > 0 ? Math.max(...closedTrades.map(t => calcPnL(t) ?? 0)) : 0;
  const worstTrade = closedCount > 0 ? Math.min(...closedTrades.map(t => calcPnL(t) ?? 0)) : 0;

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'journal', label: 'İşlem Günlüğü', icon: <BookOpen size={18} /> },
    { key: 'notes', label: 'Notlar', icon: <StickyNote size={18} /> },
    { key: 'analytics', label: 'Analiz', icon: <BarChart3 size={18} /> },
  ];

  const SyncIcon = syncStatus === 'synced' ? Cloud : syncStatus === 'syncing' ? RefreshCw : CloudOff;
  const syncColor = syncStatus === 'synced' ? 'var(--green)' : syncStatus === 'syncing' ? 'var(--cyan)' : 'var(--red)';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ borderColor: 'var(--border)', background: 'rgba(10,14,23,0.85)' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--cyan), var(--blue))' }}>
              T
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--white)' }}>
              Trading Journal
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                style={{
                  color: page === item.key ? 'var(--cyan)' : 'var(--gray-light)',
                  background: page === item.key ? 'rgba(6,182,212,0.08)' : 'transparent',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SyncIcon size={16} style={{ color: syncColor }} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            {lastUpdate && (
              <span className="text-xs" style={{ color: 'var(--gray)' }}>
                {lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refreshPrices}
              className="p-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
              style={{ color: loading ? 'var(--cyan)' : 'var(--gray-light)' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6">
        {page === 'dashboard' && (
          <Dashboard
            state={state}
            prices={prices}
            totalPnL={totalPnL}
            winRate={winRate}
            winCount={winCount}
            lossCount={lossCount}
            closedCount={closedCount}
            bestTrade={bestTrade}
            worstTrade={worstTrade}
            onBudgetChange={handleBudgetChange}
          />
        )}
        {page === 'journal' && (
          <TradeJournal
            trades={state.trades}
            onAdd={handleAddTrade}
            onUpdate={handleUpdateTrade}
            onDelete={handleDeleteTrade}
          />
        )}
        {page === 'notes' && (
          <TradeNotes
            notes={state.notes}
            onAdd={handleAddNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        )}
        {page === 'analytics' && <Analytics state={state} />}
      </main>
    </div>
  );
}
