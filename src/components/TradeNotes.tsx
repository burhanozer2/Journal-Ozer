import { useState } from 'react';
import type { TradeNote } from '../types';
import { INSTRUMENTS } from '../types';
import { Plus, Trash2, Edit3, X, Check } from 'lucide-react';

interface Props {
  notes: TradeNote[];
  onAdd: (n: TradeNote) => void;
  onUpdate: (n: TradeNote) => void;
  onDelete: (id: string) => void;
}

const emptyNote: Omit<TradeNote, 'id'> = {
  date: new Date().toISOString().slice(0, 10),
  instrument: INSTRUMENTS[0].name,
  entryReason: '',
  technicalAnalysis: '',
  marketConditions: '',
  resultEvaluation: '',
  lessonsLearned: '',
  screenshot: '',
};

export default function TradeNotes({ notes, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyNote);

  const handleSubmit = () => {
    if (editId) {
      onUpdate({ ...form, id: editId } as TradeNote);
      setEditId(null);
    } else {
      onAdd({ ...form, id: crypto.randomUUID() } as TradeNote);
    }
    setForm(emptyNote);
    setShowForm(false);
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
        <h2 className="text-xl font-bold" style={{ color: 'var(--white)' }}>İşlem Notları</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyNote); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          style={{ background: showForm ? 'var(--red)' : 'var(--purple)', color: '#fff' }}
        >
          {showForm ? <><X size={16} /> İptal</> : <><Plus size={16} /> Yeni Not</>}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 animate-in">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tarih">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full" />
            </Field>
            <Field label="Enstrüman">
              <select value={form.instrument} onChange={e => setForm({ ...form, instrument: e.target.value })} className="w-full">
                {INSTRUMENTS.map(i => <option key={i.symbol} value={i.name}>{i.name}</option>)}
              </select>
            </Field>
            <Field label="Giriş Sebebi">
              <textarea value={form.entryReason} onChange={e => setForm({ ...form, entryReason: e.target.value })}
                className="w-full h-20" placeholder="Neden bu işleme girdiniz?" />
            </Field>
            <Field label="Teknik Analiz">
              <textarea value={form.technicalAnalysis} onChange={e => setForm({ ...form, technicalAnalysis: e.target.value })}
                className="w-full h-20" placeholder="Teknik analiz notları..." />
            </Field>
            <Field label="Piyasa Koşulları">
              <textarea value={form.marketConditions} onChange={e => setForm({ ...form, marketConditions: e.target.value })}
                className="w-full h-20" placeholder="Piyasa durumu..." />
            </Field>
            <Field label="Sonuç Değerlendirmesi">
              <textarea value={form.resultEvaluation} onChange={e => setForm({ ...form, resultEvaluation: e.target.value })}
                className="w-full h-20" placeholder="İşlem sonucu..." />
            </Field>
            <Field label="Ders Çıkarılan">
              <textarea value={form.lessonsLearned} onChange={e => setForm({ ...form, lessonsLearned: e.target.value })}
                className="w-full h-20" placeholder="Bu işlemden ne öğrendiniz?" />
            </Field>
            <Field label="Ekran Görüntüsü Notu">
              <input type="text" value={form.screenshot} onChange={e => setForm({ ...form, screenshot: e.target.value })}
                className="w-full" placeholder="Dosya adı veya URL" />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium cursor-pointer"
              style={{ background: 'var(--purple)', color: '#fff' }}>
              <Check size={16} /> {editId ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-2 gap-4">
        {notes.length === 0 ? (
          <div className="col-span-2 card p-12 text-center" style={{ color: 'var(--gray)' }}>
            Henüz not eklenmedi
          </div>
        ) : (
          [...notes].reverse().map(note => (
            <div key={note.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold" style={{ color: 'var(--white)' }}>{note.instrument}</span>
                  <span className="text-xs ml-2 mono" style={{ color: 'var(--gray)' }}>{note.date}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setForm(note); setEditId(note.id); setShowForm(true); }}
                    className="p-1.5 rounded hover:bg-white/5 cursor-pointer" style={{ color: 'var(--blue)' }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => onDelete(note.id)}
                    className="p-1.5 rounded hover:bg-white/5 cursor-pointer" style={{ color: 'var(--red)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {note.entryReason && (
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--cyan)' }}>Giriş Sebebi</div>
                  <p className="text-sm" style={{ color: 'var(--gray-light)' }}>{note.entryReason}</p>
                </div>
              )}
              {note.technicalAnalysis && (
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--orange)' }}>Teknik Analiz</div>
                  <p className="text-sm" style={{ color: 'var(--gray-light)' }}>{note.technicalAnalysis}</p>
                </div>
              )}
              {note.lessonsLearned && (
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--teal)' }}>Ders Çıkarılan</div>
                  <p className="text-sm" style={{ color: 'var(--gray-light)' }}>{note.lessonsLearned}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
