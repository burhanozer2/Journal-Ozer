import { createClient } from '@supabase/supabase-js';
import type { AppState, Trade, TradeNote } from '../types';

const SUPABASE_URL = 'https://etjxdkpanhkuslkbzjbn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fT51Jnjo6GXKw2S73UOZLw_rYPqjsCH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Kullanıcı ID'si - cihaz bazlı anonim kullanıcı
function getUserId(): string {
  let userId = localStorage.getItem('supabase_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('supabase_user_id', userId);
  }
  return userId;
}

export async function loadStateFromSupabase(): Promise<AppState> {
  const userId = getUserId();
  
  // Trades'i çek
  const { data: tradesData, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId);
    
  if (tradesError) {
    console.error('Trades fetch error:', tradesError);
    return loadLocalState();
  }
  
  // Notes'ları çek
  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId);
    
  if (notesError) {
    console.error('Notes fetch error:', notesError);
    return loadLocalState();
  }
  
  // Bütçeyi localStorage'dan al (Supabase'e kaydetmeye gerek yok)
  const budget = parseFloat(localStorage.getItem('trading_budget') || '0');
  
  return {
    budget,
    trades: (tradesData || []).map(t => ({
      id: t.id,
      date: t.date,
      instrument: t.instrument,
      direction: t.direction as 'LONG' | 'SHORT',
      entryPrice: t.entry_price,
      exitPrice: t.exit_price,
      quantity: t.quantity,
      leverage: t.leverage,
      stopLoss: t.stop_loss,
      takeProfit: t.take_profit,
      commission: t.commission,
      strategy: t.strategy,
      mood: t.mood,
    })),
    notes: (notesData || []).map(n => ({
      id: n.id,
      date: n.date,
      instrument: n.instrument,
      entryReason: n.entry_reason,
      technicalAnalysis: n.technical_analysis,
      marketConditions: n.market_conditions,
      resultEvaluation: n.result_evaluation,
      lessonsLearned: n.lessons_learned,
      screenshot: n.screenshot,
    })),
  };
}

export async function saveTradeToSupabase(trade: Trade): Promise<void> {
  const userId = getUserId();
  
  const { error } = await supabase
    .from('trades')
    .upsert({
      id: trade.id,
      user_id: userId,
      date: trade.date,
      instrument: trade.instrument,
      direction: trade.direction,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      quantity: trade.quantity,
      leverage: trade.leverage,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      commission: trade.commission,
      strategy: trade.strategy,
      mood: trade.mood,
    });
    
  if (error) {
    console.error('Save trade error:', error);
    throw error;
  }
}

export async function deleteTradeFromSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Delete trade error:', error);
    throw error;
  }
}

export async function saveNoteToSupabase(note: TradeNote): Promise<void> {
  const userId = getUserId();
  
  const { error } = await supabase
    .from('notes')
    .upsert({
      id: note.id,
      user_id: userId,
      date: note.date,
      instrument: note.instrument,
      entry_reason: note.entryReason,
      technical_analysis: note.technicalAnalysis,
      market_conditions: note.marketConditions,
      result_evaluation: note.resultEvaluation,
      lessons_learned: note.lessonsLearned,
      screenshot: note.screenshot,
    });
    
  if (error) {
    console.error('Save note error:', error);
    throw error;
  }
}

export async function deleteNoteFromSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Delete note error:', error);
    throw error;
  }
}

export function saveBudget(budget: number): void {
  localStorage.setItem('trading_budget', budget.toString());
}

// Fallback - local storage
function loadLocalState(): AppState {
  const raw = localStorage.getItem('trading_journal_v1');
  if (!raw) return { budget: 0, trades: [], notes: [] };
  return JSON.parse(raw);
}
