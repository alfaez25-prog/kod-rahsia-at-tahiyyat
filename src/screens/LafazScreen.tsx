import { useMemo, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Lightbulb, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Pill, Screen, TopBar, UnitAudio } from '../components/UI.tsx';
import { Chest, Divider } from '../components/Decor.tsx';
import { buildLafazQuestion, checkLafaz } from '../data/questionBank.ts';
import { lafazPoints } from '../lib/scoring.ts';
import { play } from '../lib/audio.ts';
import { CATEGORY_LABEL } from '../data/tahiyat.ts';

export function LafazScreen({ unitId }: { unitId: number }) {
  const { settings, progress, session, update, go } = useGame();
  const unit = settings.units.find((u) => u.id === unitId)!;
  const prevUnit = settings.units.find((u) => u.id === unitId - 1);
  const q = useMemo(() => buildLafazQuestion(unit, session?.sessionId ?? 'x'), [unit, session?.sessionId]);
  const rec = progress!.units[unitId].lafaz;

  const [answers, setAnswers] = useState<Record<string, string | undefined>>({});
  const [active, setActive] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [solved, setSolved] = useState(rec.done);
  const [earned, setEarned] = useState(rec.points);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const blankByToken = new Map<number, number>();
  q.blanks.forEach((b, bi) => b.tokens.forEach((t) => blankByToken.set(t, bi)));
  const activeBlank = q.blanks[active];

  const place = (bi: number, optionId: string) => {
    play('click');
    const next = { ...answers, [q.blanks[bi].id]: optionId };
    setAnswers(next);
    setWrong((w) => w.filter((x) => x !== bi));
    setMessage('');
    const nextEmpty = q.blanks.findIndex((b) => !next[b.id]);
    if (nextEmpty >= 0) setActive(nextEmpty);
  };

  const clearBlank = (bi: number) => {
    setAnswers((a) => ({ ...a, [q.blanks[bi].id]: undefined }));
    setActive(bi);
  };

  const check = () => {
    if (q.blanks.some((b) => !answers[b.id])) {
      setMessage('Isi semua ruang kosong dahulu sebelum menyemak.');
      return;
    }
    const attempt = rec.attempts + 1;
    const bad = checkLafaz(q, answers);
    if (bad.length === 0) {
      const pts = lafazPoints(attempt);
      update((p) => {
        p.units[unitId].lafaz = { attempts: attempt, done: true, points: pts };
        return p;
      });
      setEarned(pts);
      setSolved(true);
      play('chest');
    } else {
      update((p) => {
        p.units[unitId].lafaz.attempts = attempt;
        return p;
      });
      play('wrong');
      setWrong(bad);
      setHints(bad.map((i) => q.blanks[i].hint));
      setAnswers((a) => {
        const n = { ...a };
        bad.forEach((i) => (n[q.blanks[i].id] = undefined));
        return n;
      });
      setActive(bad[0]);
      setMessage(
        `${bad.length === q.blanks.length ? 'Belum tepat' : `${bad.length} ruang belum tepat`}. Baca petunjuk dan cuba lagi! Markah jika betul selepas ini: ${lafazPoints(attempt + 1)} XP.`,
      );
    }
  };

  const onDrop = (bi: number) => (e: DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/plain');
    if (q.blanks[bi].options.some((o) => o.id === id)) place(bi, id);
  };

  const textFor = (bi: number) => q.blanks[bi].options.find((o) => o.id === answers[q.blanks[bi].id])?.text;

  // Bina paparan perkataan (RTL) dengan ruang kosong
  const segments: Array<{ kind: 'word'; text: string; key: string } | { kind: 'blank'; bi: number; key: string }> = [];
  q.words.forEach((w, ti) => {
    const bi = blankByToken.get(ti);
    if (bi === undefined) segments.push({ kind: 'word', text: w, key: `w${ti}` });
    else if (q.blanks[bi].tokens[0] === ti) segments.push({ kind: 'blank', bi, key: `b${bi}` });
  });

  return (
    <>
      <TopBar />
      <Screen>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-center">
          <Pill>Peti {unitId} / 8</Pill>
          <Pill tone="emerald">Cabaran 1 · Lengkapkan Lafaz</Pill>
          {rec.attempts > 0 && !solved && <Pill tone="red">Percubaan ke-{rec.attempts + 1}</Pill>}
        </div>
        <h1 className="gold-text mt-3 text-center font-display text-2xl font-extrabold sm:text-3xl">{unit.title}</h1>
        <p className="text-center text-xs text-ivory-200/70">{CATEGORY_LABEL[unit.category]}</p>
        <Divider className="mt-1" />

        <section className="parchment ornate-frame relative mt-5 overflow-hidden rounded-3xl px-4 py-6 sm:px-10 sm:py-9" aria-label="Manuskrip lafaz">
          {prevUnit && (
            <p className="mb-2 text-center text-xs text-brown-700">
              Sambungan selepas:{' '}
              <span dir="rtl" lang="ar" className="font-arabic text-lg text-brown-800/70">
                {prevUnit.arabic}
              </span>
            </p>
          )}
          <div dir="rtl" lang="ar" className="font-arabic flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-3xl text-brown-900 sm:text-5xl" data-testid="lafaz-line">
            {segments.map((s) =>
              s.kind === 'word' ? (
                <span key={s.key}>{s.text}</span>
              ) : (
                <motion.button
                  key={s.key}
                  type="button"
                  onClick={() => (answers[q.blanks[s.bi].id] ? clearBlank(s.bi) : setActive(s.bi))}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(s.bi);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={onDrop(s.bi)}
                  animate={wrong.includes(s.bi) ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  aria-label={`Ruang kosong ${s.bi + 1}${textFor(s.bi) ? `: ${textFor(s.bi)} (ketik untuk kosongkan)` : ''}`}
                  data-testid={`blank-${s.bi}`}
                  className={`min-h-16 min-w-28 rounded-xl border-2 border-dashed px-3 leading-[1.9] transition sm:min-w-36 ${
                    solved
                      ? 'border-transparent bg-transparent text-emerald-800'
                      : textFor(s.bi)
                        ? 'border-emerald-700 bg-emerald-700/10'
                        : wrong.includes(s.bi)
                          ? 'border-red-600 bg-red-500/10'
                          : active === s.bi || dragOver === s.bi
                            ? 'border-gold-600 bg-gold-300/50 shadow-[0_0_20px_rgba(201,162,39,0.6)]'
                            : 'border-gold-600/60 bg-ivory-50/40'
                  }`}
                >
                  {solved ? q.blanks[s.bi].tokens.map((t) => q.words[t]).join(' ') : textFor(s.bi) ?? <span className="text-xl text-brown-700/50">؟</span>}
                </motion.button>
              ),
            )}
          </div>
          {solved && <UnitAudio unit={unit} />}

          <AnimatePresence>
            {solved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,243,196,0.55),transparent_70%)]" />
            )}
          </AnimatePresence>
        </section>

        {!solved ? (
          <>
            <div className="mt-5 text-center text-sm text-ivory-200/90">
              {q.blanks.length > 1 ? (
                <>
                  Pilih kad untuk <strong className="text-gold-300">ruang {active + 1}</strong> daripada {q.blanks.length} (ruang yang bercahaya). Ketik atau seret kad ke ruang.
                </>
              ) : (
                <>Ketik atau seret kad yang betul ke ruang kosong.</>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label={`Pilihan untuk ruang ${active + 1}`}>
              {activeBlank.options.map((o, k) => {
                const used = answers[activeBlank.id] === o.id;
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20, rotateX: 30 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: k * 0.05 }}
                    whileHover={{ y: -4, rotateX: 8 }}
                    whileTap={{ scale: 0.96 }}
                    style={{ perspective: 600 }}
                  >
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', o.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => place(active, o.id)}
                      dir="rtl"
                      lang="ar"
                      data-testid="lafaz-option"
                      className={`card-3d font-arabic min-h-20 w-full cursor-grab rounded-2xl border-2 bg-gradient-to-b from-ivory-50 to-ivory-200 px-2 py-2 text-2xl text-brown-900 active:cursor-grabbing sm:text-3xl ${used ? 'border-emerald-600 ring-4 ring-emerald-500/40' : 'border-gold-500'}`}
                    >
                      {o.text}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {hints.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 rounded-2xl border border-gold-500/50 bg-gold-500/10 p-4">
                  {hints.map((h, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm text-gold-300">
                      <Lightbulb size={18} className="mt-0.5 shrink-0" /> <span>Petunjuk: {h}</span>
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <p role="status" aria-live="polite" className="mt-3 min-h-6 text-center text-sm font-bold text-red-300" data-testid="lafaz-message">
              {message}
            </p>
            <div className="mt-2 flex justify-center gap-3">
              <Button variant="ghost" onClick={() => { setAnswers({}); setActive(0); }}>
                <RotateCcw size={18} /> Kosongkan
              </Button>
              <Button onClick={check} data-testid="btn-check-lafaz" className="min-w-40">
                <Wand2 size={18} /> SEMAK
              </Button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center text-center">
            <Chest open size={110} glow />
            <p className="mt-2 flex items-center gap-2 font-display text-2xl font-extrabold text-gold-300">
              <Sparkles /> Lafaz Lengkap!
            </p>
            <p className="text-ivory-200" data-testid="lafaz-earned">
              +{earned} XP {rec.attempts === 1 ? '· Betul pada percubaan pertama!' : `· Selesai dalam ${rec.attempts} percubaan`}
            </p>
            <Button className="mt-4" onClick={() => go({ name: 'meaning', unitId })} data-testid="btn-to-meaning">
              Cabaran Maksud <ArrowRight size={18} />
            </Button>
          </motion.div>
        )}
      </Screen>
    </>
  );
}
