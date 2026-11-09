import { useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, KeyRound, Plus, RotateCcw, Save, Trash2, Upload } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Screen } from '../components/UI.tsx';
import { SchoolCrest } from '../components/Decor.tsx';
import { cloneDefaults, exportSettingsJson, parseSettings, safeUrl, type TeacherSettings } from '../lib/settings.ts';
import { clearHistory, loadHistory, resetSettings } from '../lib/storage.ts';
import { tokenize, validateUnit, validateUnits } from '../data/questionBank.ts';
import type { UnitContent } from '../data/types.ts';

type Tab = 'umum' | 'kandungan' | 'data';

export function TeacherScreen() {
  const { go, settings, updateSettings } = useGame();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [draft, setDraft] = useState<TeacherSettings>(() => structuredClone(settings));
  const [tab, setTab] = useState<Tab>('umum');
  const [msg, setMsg] = useState<{ ok: boolean; text: string[] } | null>(null);
  const [history, setHistory] = useState(() => loadHistory());
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const save = () => {
    const errors = validateUnits(draft.units);
    if (errors.length) return setMsg({ ok: false, text: errors });
    const next = { ...draft, classroomUrl: safeUrl(draft.classroomUrl) };
    updateSettings(next);
    setDraft(structuredClone(next));
    setMsg({ ok: true, text: ['Tetapan disimpan dalam pelayar peranti ini.'] });
  };

  const exportJson = () => {
    const blob = new Blob([exportSettingsJson(draft)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tetapan-kod-rahsia-at-tahiyyat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  };

  const importJson = async (f: File) => {
    try {
      const r = parseSettings(JSON.parse(await f.text()));
      if (!r.ok || !r.settings) return setMsg({ ok: false, text: ['Import gagal:', ...r.errors] });
      setDraft(r.settings);
      setMsg({ ok: true, text: ['Fail diimport. Semak kandungan kemudian tekan SIMPAN TETAPAN.'] });
    } catch {
      setMsg({ ok: false, text: ['Fail JSON tidak sah.'] });
    }
  };

  const loadLogo = (f: File) => {
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const s = 256;
      const c = document.createElement('canvas');
      const r = Math.min(s / img.width, s / img.height, 1);
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      setDraft((d) => ({ ...d, logoDataUrl: c.toDataURL('image/png') }));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const setUnit = (id: number, fn: (u: UnitContent) => UnitContent) =>
    setDraft((d) => ({ ...d, units: d.units.map((u) => (u.id === id ? fn(structuredClone(u)) : u)) }));

  if (!authed) {
    return (
      <Screen className="max-w-md pt-10">
        <button type="button" onClick={() => go({ name: 'landing' })} className="mb-4 inline-flex items-center gap-1 text-sm text-gold-300 hover:underline">
          <ArrowLeft size={16} /> Kembali
        </button>
        <form
          className="parchment ornate-frame rounded-3xl p-7 text-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (pin === settings.teacherPin) setAuthed(true);
            else setMsg({ ok: false, text: ['PIN tidak tepat.'] });
          }}
        >
          <KeyRound className="mx-auto text-emerald-700" size={40} />
          <h1 className="mt-2 font-display text-2xl font-extrabold text-brown-900">Mod Guru</h1>
          <p className="mt-1 text-sm text-brown-700">Masukkan PIN guru (lalai: 1234 — sila tukar).</p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-4 w-full rounded-xl border-2 border-gold-600/50 bg-ivory-50 px-4 py-3 text-center text-xl tracking-[0.5em] text-brown-900 outline-none focus:border-emerald-700"
            aria-label="PIN guru"
            data-testid="teacher-pin"
          />
          {msg && !msg.ok && <p className="mt-2 text-sm font-bold text-red-700">{msg.text[0]}</p>}
          <Button type="submit" className="mt-4 w-full">Masuk</Button>
          <p className="mt-4 text-xs leading-relaxed text-brown-700">
            Mod guru ini disimpan secara setempat dalam pelayar. Ia <strong>bukan</strong> sistem keselamatan atau pangkalan data berpusat — PIN hanya menghalang akses tidak sengaja.
          </p>
        </form>
      </Screen>
    );
  }

  return (
    <Screen className="max-w-5xl pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => go({ name: 'landing' })} className="inline-flex items-center gap-1 text-sm text-gold-300 hover:underline">
          <ArrowLeft size={16} /> Keluar Mod Guru
        </button>
        <Button onClick={save} data-testid="btn-save-settings">
          <Save size={18} /> SIMPAN TETAPAN
        </Button>
      </div>
      <h1 className="gold-text mt-3 font-display text-3xl font-extrabold">Panel Tetapan Guru</h1>
      <p className="mt-1 flex items-start gap-2 rounded-xl bg-gold-500/10 p-3 text-sm text-gold-300 ring-1 ring-gold-500/40">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        Tetapan disimpan dalam localStorage pelayar ini sahaja. Mod guru setempat bukan sistem keselamatan atau pangkalan data berpusat. Gunakan Eksport JSON untuk memindahkan tetapan ke peranti lain.
      </p>

      {msg && (
        <div className={`mt-3 rounded-xl p-3 text-sm ring-1 ${msg.ok ? 'bg-emerald-900/50 text-emerald-300 ring-emerald-500/40' : 'bg-red-950/60 text-red-200 ring-red-400/40'}`} role="status" data-testid="teacher-msg">
          {msg.text.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist">
        {(['umum', 'kandungan', 'data'] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-extrabold capitalize ${tab === t ? 'bg-gold-500 text-brown-900' : 'bg-brown-800 text-ivory-200'}`}>
            {t === 'umum' ? 'Umum & Sijil' : t === 'kandungan' ? 'Semakan Lafaz & Bank Soalan' : 'Data & Import/Eksport'}
          </button>
        ))}
      </div>

      {tab === 'umum' && (
        <div className="mt-4 grid gap-4 rounded-3xl border border-gold-500/30 bg-brown-900/60 p-5 md:grid-cols-2">
          <Field label="Nama sekolah">
            <input className={inputCls} value={draft.schoolName} onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })} />
          </Field>
          <Field label="Logo sekolah">
            <div className="flex items-center gap-3">
              <SchoolCrest logo={draft.logoDataUrl} size={56} />
              <Button variant="ghost" onClick={() => logoRef.current?.click()}><Upload size={16} /> Muat naik</Button>
              {draft.logoDataUrl && <Button variant="ghost" onClick={() => setDraft({ ...draft, logoDataUrl: '' })}><Trash2 size={16} /></Button>}
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && loadLogo(e.target.files[0])} />
            </div>
          </Field>
          <Field label="Senarai kelas (satu baris satu kelas; kosongkan untuk murid menaip sendiri)">
            <textarea className={`${inputCls} h-28`} value={draft.classes.join('\n')} onChange={(e) => setDraft({ ...draft, classes: e.target.value.split('\n').map((s) => s.trimStart()) })} onBlur={() => setDraft((d) => ({ ...d, classes: d.classes.map((c) => c.trim()).filter(Boolean) }))} />
          </Field>
          <Field label="Pautan Google Classroom">
            <input className={inputCls} value={draft.classroomUrl} onChange={(e) => setDraft({ ...draft, classroomUrl: e.target.value })} />
            <span className="mt-1 block text-xs text-ivory-200/60">Hanya pautan http/https diterima. Lalai: https://classroom.google.com/</span>
          </Field>
          <Field label="Arahan penghantaran kepada murid" full>
            <textarea className={`${inputCls} h-24`} value={draft.submissionText} onChange={(e) => setDraft({ ...draft, submissionText: e.target.value })} />
          </Field>
          <Field label={`Tahap kelayakan sijil: penguasaan minimum ${draft.certificateMinMastery}%`}>
            <input type="range" min={0} max={100} step={5} value={draft.certificateMinMastery} onChange={(e) => setDraft({ ...draft, certificateMinMastery: Number(e.target.value) })} className="w-full accent-[#c9a227]" />
            <span className="block text-xs text-ivory-200/60">0% = sijil dibuka apabila semua cabaran selesai.</span>
          </Field>
          <Field label="PIN guru">
            <input className={inputCls} value={draft.teacherPin} onChange={(e) => setDraft({ ...draft, teacherPin: e.target.value })} />
          </Field>
        </div>
      )}

      {tab === 'kandungan' && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-ivory-200/80">
            Semak setiap lafaz Arab (dengan harakat) dan maksud sebelum diterbitkan kepada murid. Tandakan “Telah disemak guru” selepas semakan. Rakaman bacaan hanya dimainkan jika
            pautan disediakan <strong>dan</strong> ditanda “Rakaman disahkan”. Tiada text-to-speech atau AI digunakan untuk bacaan atau jawapan.
          </p>
          <p className="text-sm text-gold-300">
            Telah disemak: {draft.units.filter((u) => u.reviewed).length} / 8 unit
          </p>
          {draft.units.map((u) => (
            <UnitEditor key={u.id} unit={u} onChange={(fn) => setUnit(u.id, fn)} />
          ))}
        </div>
      )}

      {tab === 'data' && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-gold-500/30 bg-brown-900/60 p-5">
            <h2 className="font-display text-lg font-extrabold text-ivory-50">Import / Eksport Tetapan</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="emerald" onClick={exportJson}><Download size={16} /> Eksport JSON</Button>
              <Button variant="ghost" onClick={() => fileRef.current?.click()}><Upload size={16} /> Import JSON</Button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
              <Button
                variant="ghost"
                onClick={() => {
                  if (!confirm('Kembalikan semua tetapan dan kandungan kepada lalai?')) return;
                  resetSettings();
                  const d = cloneDefaults();
                  setDraft(d);
                  updateSettings(d);
                  setMsg({ ok: true, text: ['Tetapan dikembalikan kepada lalai.'] });
                }}
              >
                <RotateCcw size={16} /> Tetapan Lalai
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-gold-500/30 bg-brown-900/60 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-ivory-50">Rekod Tamat (peranti ini)</h2>
              <Button variant="ghost" onClick={() => { if (confirm('Padam semua rekod?')) { clearHistory(); setHistory([]); } }}><Trash2 size={16} /></Button>
            </div>
            <p className="text-xs text-ivory-200/60">Hanya untuk rujukan; bukan pangkalan data berpusat. Murid tetap perlu menghantar sijil ke Google Classroom.</p>
            <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto text-sm">
              {history.length === 0 && <li className="text-ivory-200/60">Tiada rekod.</li>}
              {history.map((h) => (
                <li key={h.sessionId} className="flex justify-between gap-2 rounded-lg bg-brown-800/60 px-3 py-2 text-ivory-100">
                  <span className="truncate">{h.name} · {h.className}</span>
                  <span className="shrink-0 text-gold-300">{h.score} XP · {h.mastery}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Screen>
  );
}

const inputCls = 'w-full rounded-xl border border-gold-600/50 bg-brown-950/70 px-3 py-2 text-ivory-50 outline-none focus:border-gold-400';
const arCls = `${inputCls} font-arabic text-2xl`;

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-extrabold text-gold-300">{label}</span>
      {children}
    </label>
  );
}

function UnitEditor({ unit, onChange }: { unit: UnitContent; onChange: (fn: (u: UnitContent) => UnitContent) => void }) {
  const words = tokenize(unit.arabic);
  const errors = validateUnit(unit);
  return (
    <details className="rounded-3xl border border-gold-500/30 bg-brown-900/60 p-4" data-testid={`unit-editor-${unit.id}`}>
      <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-extrabold text-ivory-50">
        Unit {unit.id}: {unit.title}
        {unit.reviewed ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-xs"><CheckCircle2 size={12} /> Disemak</span> : <span className="rounded-full bg-gold-600/40 px-2 py-0.5 text-xs">Belum disemak</span>}
        {errors.length > 0 && <span className="rounded-full bg-red-700 px-2 py-0.5 text-xs">{errors.length} ralat</span>}
      </summary>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="Tajuk peti">
          <input className={inputCls} value={unit.title} onChange={(e) => onChange((u) => ({ ...u, title: e.target.value }))} />
        </Field>
        <Field label="Kategori">
          <select className={inputCls} value={unit.category} onChange={(e) => onChange((u) => ({ ...u, category: e.target.value as UnitContent['category'] }))}>
            <option value="tasyahhud">Lafaz tasyahhud</option>
            <option value="selawat">Tambahan selawat (mazhab Syafi‘i)</option>
          </select>
        </Field>
        <Field label="Lafaz Arab (berbaris)" full>
          <input dir="rtl" lang="ar" className={arCls} value={unit.arabic} onChange={(e) => onChange((u) => ({ ...u, arabic: e.target.value }))} />
          <div className="mt-1 flex flex-wrap gap-1" dir="rtl">
            {words.map((w, i) => (
              <span key={i} className="rounded bg-brown-800 px-2 text-sm text-ivory-100"><span className="font-arabic text-lg">{w}</span> <span className="text-xs text-gold-300">#{i}</span></span>
            ))}
          </div>
        </Field>
        <Field label="Maksud" full>
          <input className={inputCls} value={unit.meaning} onChange={(e) => onChange((u) => ({ ...u, meaning: e.target.value }))} />
        </Field>
        <Field label="Penerangan selepas menjawab" full>
          <textarea className={`${inputCls} h-20`} value={unit.explanation} onChange={(e) => onChange((u) => ({ ...u, explanation: e.target.value }))} />
        </Field>
      </div>

      <h3 className="mt-4 text-sm font-extrabold text-gold-300">Bank soalan lafaz (ruang kosong)</h3>
      {unit.lafaz.blanks.map((b, bi) => (
        <div key={bi} className="mt-2 grid gap-2 rounded-2xl bg-brown-800/50 p-3 md:grid-cols-4">
          <Field label={`Ruang ${bi + 1}: no. perkataan (#)`}>
            <input
              className={inputCls}
              value={b.tokens.join(',')}
              onChange={(e) =>
                onChange((u) => {
                  u.lafaz.blanks[bi].tokens = e.target.value.split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number);
                  return u;
                })
              }
            />
            <span dir="rtl" className="font-arabic mt-1 block text-lg text-emerald-400">Jawapan: {b.tokens.map((t) => words[t] ?? '?').join(' ')}</span>
          </Field>
          {[0, 1, 2].map((di) => (
            <Field key={di} label={`Distraktor ${di + 1}`}>
              <input
                dir="rtl"
                lang="ar"
                className={arCls}
                value={b.distractors[di] ?? ''}
                onChange={(e) =>
                  onChange((u) => {
                    u.lafaz.blanks[bi].distractors[di] = e.target.value;
                    return u;
                  })
                }
              />
            </Field>
          ))}
          <Field label="Petunjuk" full>
            <input className={inputCls} value={b.hint} onChange={(e) => onChange((u) => { u.lafaz.blanks[bi].hint = e.target.value; return u; })} />
          </Field>
          {unit.lafaz.blanks.length > 1 && (
            <Button variant="ghost" onClick={() => onChange((u) => { u.lafaz.blanks.splice(bi, 1); return u; })}><Trash2 size={16} /> Buang ruang</Button>
          )}
        </div>
      ))}
      <Button variant="ghost" className="mt-2" onClick={() => onChange((u) => { u.lafaz.blanks.push({ tokens: [], distractors: ['', '', ''], hint: '' }); return u; })}>
        <Plus size={16} /> Tambah ruang
      </Button>

      <h3 className="mt-4 text-sm font-extrabold text-gold-300">Bank soalan maksud</h3>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        {[0, 1, 2].map((di) => (
          <Field key={di} label={`Distraktor ${di + 1}`}>
            <input className={inputCls} value={unit.meaningQ.distractors[di] ?? ''} onChange={(e) => onChange((u) => { u.meaningQ.distractors[di] = e.target.value; return u; })} />
          </Field>
        ))}
        <Field label="Petunjuk maksud" full>
          <input className={inputCls} value={unit.meaningQ.hint} onChange={(e) => onChange((u) => ({ ...u, meaningQ: { ...u.meaningQ, hint: e.target.value } }))} />
        </Field>
      </div>

      <h3 className="mt-4 text-sm font-extrabold text-gold-300">Rakaman bacaan (pilihan)</h3>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <Field label="Pautan fail audio (https://…mp3)">
          <input className={inputCls} value={unit.audioUrl} onChange={(e) => onChange((u) => ({ ...u, audioUrl: e.target.value }))} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ivory-100">
          <input type="checkbox" checked={unit.audioVerified} onChange={(e) => onChange((u) => ({ ...u, audioVerified: e.target.checked }))} className="h-5 w-5 accent-[#c9a227]" />
          Rakaman disahkan guru (bacaan betul)
        </label>
      </div>
      <label className="mt-4 flex items-center gap-2 font-bold text-ivory-50">
        <input type="checkbox" checked={unit.reviewed} onChange={(e) => onChange((u) => ({ ...u, reviewed: e.target.checked }))} className="h-5 w-5 accent-[#14846a]" />
        Telah disemak guru (lafaz, harakat & maksud)
      </label>
      {errors.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-red-300">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
    </details>
  );
}
