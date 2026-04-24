import type { AppState, Trade, TradeNote } from '../types';

const STORAGE_KEY = 'trading_journal_v1';

const defaultState: AppState = {
  budget: 0,
  trades: [],
  notes: [],
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveBudget(budget: number): void {
  const state = loadState();
  state.budget = budget;
  saveState(state);
}

export function addTrade(trade: Trade): void {
  const state = loadState();
  state.trades.push(trade);
  saveState(state);
}

export function updateTrade(trade: Trade): void {
  const state = loadState();
  const idx = state.trades.findIndex(t => t.id === trade.id);
  if (idx >= 0) state.trades[idx] = trade;
  saveState(state);
}

export function deleteTrade(id: string): void {
  const state = loadState();
  state.trades = state.trades.filter(t => t.id !== id);
  saveState(state);
}

export function addNote(note: TradeNote): void {
  const state = loadState();
  state.notes.push(note);
  saveState(state);
}

export function updateNote(note: TradeNote): void {
  const state = loadState();
  const idx = state.notes.findIndex(n => n.id === note.id);
  if (idx >= 0) state.notes[idx] = note;
  saveState(state);
}

export function deleteNote(id: string): void {
  const state = loadState();
  state.notes = state.notes.filter(n => n.id !== id);
  saveState(state);
}

export function calcPnL(trade: Trade): number | null {
  if (trade.exitPrice === null) return null;
  const diff = trade.direction === 'LONG'
    ? (trade.exitPrice - trade.entryPrice)
    : (trade.entryPrice - trade.exitPrice);
  return diff * trade.quantity - trade.commission;
}

export function calcPnLPercent(trade: Trade): number | null {
  if (trade.exitPrice === null) return null;
  const diff = trade.direction === 'LONG'
    ? (trade.exitPrice - trade.entryPrice) / trade.entryPrice
    : (trade.entryPrice - trade.exitPrice) / trade.entryPrice;
  return diff;
}
