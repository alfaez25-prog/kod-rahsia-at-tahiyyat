import { useEffect, useMemo, useState, type PointerEvent as RPointerEvent } from 'react';
import { AnimatePresence, Reorder, motion, useDragControls } from 'motion/react';
import { ArrowDown, ArrowUp, GripVertical, Lightbulb, Lock, Sparkles, Trophy, Wand2 } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Pill, Screen, TopBar } from '../components/UI.tsx';
import { Divider } from '../components/Decor.tsx';
import { isOrderCorrect, orderCorrectCount, orderPoints, ORDER_HINT_PENALTY, UNIT_COUNT } from '../lib/scoring.ts';
import { seededShuffle } from '../lib/random.ts';
import { play } from '../lib/audio.ts';
import type { UnitContent } from '../data/types.ts';

const MAX_HINTS = 5;

/** Susunan awal rawak yang tidak terlalu hampir dengan jawapan (≤ 2 kad di tempat betul). */
export function initialArrangement(seed: string): number[] {
  const ids = Array.from({ length: UNIT_COUNT }, (_, i) => i + 1);
  for (let k = 0; k < 50; k++) {
    const a = seededShuffle(ids, `${seed}|order|${k}`);
    if (orderCorrectCount(a) <= 2) return a;
  }
  return ids.slice().reverse();
}

export function OrderScreen() {
  const { settings, progress, session, update, go } = useGame();
  const rec = progress!.order;
  const byId = useMemo(() => new Map(settings.units.map((u) => [u.id, u])), [settings.units]);
  const [order, setOrder] = useState<number[]>(() =>
    rec.arrangement.length === UNIT_COUNT ? rec.arrangement : initialArrangement(session?.sessionId ?? 'x'),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState<number[]>(() => (rec.done ? order : []));
  const [message, setMessage] = useState('');
  const [hintText, setHintText] = useState('');
  const [solved, setSolved] = useState(rec.done);

  useEffect(() => {
    update((p) => ({ ...p, order: { ...p.order, arrangement: order } }));
  }, [order, update]);

  const commit = (next: number[]) => {
    // Kad terkunci (petunjuk) mesti kekal di kedudukannya
    if (locked.some((id) => next.indexOf(id) !== id - 1)) return;
    setOrder(next);
    setMessage('');
  };

  const move = (idx: number, dir: -1 | 1) => {
    let j = idx + dir;
    while (j >= 0 && j < order.length && locked.includes(order[j])) j += dir;
    if (j < 0 || j >= order.length) return;
    const n = order.slice();
    [n[idx], n[j]] = [n[j], n[idx]];
    play('click');
    commit(n);
  };

  const tapCard = (id: number) => {
    if (solved || locked.includes(id)) return;
    play('click');
    if (selected === null) return setSelected(id);
    if (selected === id) return setSelected(null);
    const n = order.slice();
    const a = n.indexOf(selected);
    const b = n.indexOf(id);
    [n[a], n[b]] = [n[b], n[a]];
    setSelected(null);
    commit(n);
  };

  const check = () => {
    const attempt = rec.attempts + 1;
    if (isOrderCorrect(order)) {
      const pts = orderPoints(attempt, rec.hintsUsed);
      update((p) => ({ ...p, order: { ...p.order, attempts: attempt, done: true, points: pts, arrangement: order } }));
      setSolved(true);
      setLocked(order);
      play('complete');
    } else {
      update((p) => ({ ...p, order: { ...p.order, attempts: attempt } }));
      play('wrong');
      const c = orderCorrectCount(order);
      setMessage(`${c} daripada ${UNIT_COUNT} kad berada di kedudukan yang betul. Cuba lagi! Anda kini boleh menggunakan petunjuk.`);
    }
  };

  const hint = () => {
    const level = rec.hintsUsed + 1;
    update((p) => ({ ...p, order: { ...p.order, hintsUsed: level } }));
    if (level === 1) {
      setHintText('Petunjuk 1: Bacaan dimulakan dengan penghormatan kepada Allah (التَّحِيَّاتُ), diikuti salam kepada Nabi, salam kepada kami, dua kalimah syahadah, dan diakhiri dengan selawat.');
    } else if (level === 2) {
      const ok = order.filter((id, i) => id === i + 1);
      setLocked(ok);
      setHintText(ok.length ? `Petunjuk 2: ${ok.length} kad yang sudah betul kini dikunci (bertanda emas).` : 'Petunjuk 2: Belum ada kad di tempat yang betul. Mulakan dengan mencari kad التَّحِيَّاتُ.');
    } else {
      const idx = order.findIndex((id, i) => id !== i + 1);
      if (idx < 0) return;
      const n = order.slice();
      const from = n.indexOf(idx + 1);
      [n[idx], n[from]] = [n[from], n[idx]];
      const newLocked = Array.from(new Set([...locked.filter((id) => n.indexOf(id) === id - 1), idx + 1]));
      setLocked(newLocked);
      setOrder(n);
      setHintText(`Petunjuk ${level}: Satu kad telah diletakkan di kedudukan ${idx + 1} yang betul dan dikunci.`);
    }
    play('click');
  };

  const nextPts = orderPoints(rec.attempts + 1, rec.hintsUsed);

  return (
    <>
      <TopBar />
      <Screen className="max-w-3xl">
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Pill>Cabaran Akhir</Pill>
          {!solved && <Pill tone="emerald">Nilai semasa: {nextPts} XP</Pill>}
          {rec.hintsUsed > 0 && <Pill tone="red">Petunjuk: {rec.hintsUsed} (−{rec.hintsUsed * ORDER_HINT_PENALTY})</Pill>}
        </div>
        <h1 className="gold-text mt-3 text-center font-display text-3xl font-extrabold">Susun Manuskrip</h1>
        <Divider className="mt-1" />
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ivory-200/90">
          Susun 8 kad mengikut urutan bacaan tahiyat awal, dari atas (pertama) ke bawah (terakhir). Seret pemegang <GripVertical className="inline" size={14} />, guna butang
          naik/turun, atau ketik dua kad untuk menukar tempat.
        </p>

        <div className={`relative mt-5 rounded-3xl p-3 sm:p-5 ${solved ? 'parchment ornate-frame' : 'border border-gold-500/40 bg-brown-900/50'}`}>
          <Reorder.Group axis="y" values={order} onReorder={commit} className="flex flex-col gap-2" data-testid="order-list">
            {order.map((id, idx) => (
              <OrderCard
                key={id}
                unit={byId.get(id)!}
                index={idx}
                selected={selected === id}
                locked={locked.includes(id)}
                solved={solved}
                onTap={() => tapCard(id)}
                onUp={() => move(idx, -1)}
                onDown={() => move(idx, 1)}
                isFirst={idx === 0}
                isLast={idx === order.length - 1}
              />
            ))}
          </Reorder.Group>
          <AnimatePresence>
            {solved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.4] }} transition={{ duration: 2 }} className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle,rgba(255,243,196,0.7),transparent_70%)]" />
            )}
          </AnimatePresence>
        </div>

        {!solved ? (
          <>
            {hintText && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-gold-500/50 bg-gold-500/10 p-4 text-sm text-gold-300" data-testid="order-hint">
                <Lightbulb size={18} className="mt-0.5 shrink-0" />
                <span dir="auto">{hintText}</span>
              </p>
            )}
            <p role="status" aria-live="polite" className="mt-3 min-h-6 text-center text-sm font-bold text-red-300" data-testid="order-message">
              {message}
            </p>
            <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="ghost" onClick={hint} disabled={rec.attempts === 0 || rec.hintsUsed >= MAX_HINTS} title={rec.attempts === 0 ? 'Petunjuk dibuka selepas percubaan pertama' : ''} data-testid="btn-order-hint">
                <Lightbulb size={18} /> Petunjuk (−{ORDER_HINT_PENALTY} XP){rec.attempts === 0 && ' · selepas cubaan pertama'}
              </Button>
              <Button onClick={check} data-testid="btn-check-order" className="min-w-44">
                <Wand2 size={18} /> SEMAK SUSUNAN
              </Button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex flex-col items-center text-center">
            <Trophy size={56} className="glow-pulse text-gold-300" />
            <p className="mt-2 flex items-center gap-2 font-display text-2xl font-extrabold text-gold-300">
              <Sparkles /> Manuskrip Sempurna!
            </p>
            <p className="text-ivory-200" data-testid="order-earned">+{rec.points} XP</p>
            <Button className="mt-4" onClick={() => go({ name: 'results' })} data-testid="btn-to-results">
              Lihat Keputusan <Trophy size={18} />
            </Button>
          </motion.div>
        )}
      </Screen>
    </>
  );
}

function OrderCard(props: {
  unit: UnitContent;
  index: number;
  selected: boolean;
  locked: boolean;
  solved: boolean;
  isFirst: boolean;
  isLast: boolean;
  onTap: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const { unit, index, selected, locked, solved } = props;
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={unit.id}
      dragListener={false}
      dragControls={controls}
      drag={!locked && !solved ? 'y' : false}
      initial={solved ? { opacity: 0, x: 30 } : false}
      animate={solved ? { opacity: 1, x: 0, transition: { delay: index * 0.12 } } : undefined}
      className={`flex items-center gap-2 rounded-2xl border-2 p-2 sm:gap-3 sm:p-3 ${
        solved
          ? 'border-gold-500/60 bg-ivory-50/60'
          : locked
            ? 'border-gold-400 bg-gold-500/20'
            : selected
              ? 'border-emerald-400 bg-emerald-800/60 ring-4 ring-emerald-400/30'
              : 'border-gold-600/40 bg-brown-800/80'
      }`}
      data-testid="order-card"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${solved ? 'bg-emerald-800 text-gold-300' : 'bg-gold-500/20 text-gold-300'}`}>{index + 1}</span>
      {!solved &&
        (locked ? (
          <Lock size={20} className="shrink-0 text-gold-300" aria-label="Terkunci" />
        ) : (
          <span
            onPointerDown={(e: RPointerEvent) => controls.start(e)}
            className="grid h-11 w-8 shrink-0 cursor-grab touch-none place-items-center text-gold-300/80 active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical />
          </span>
        ))}
      <button
        type="button"
        onClick={props.onTap}
        disabled={locked || solved}
        dir="rtl"
        lang="ar"
        aria-pressed={selected}
        className={`font-arabic min-w-0 flex-1 rounded-xl px-2 text-right text-xl leading-[2] sm:text-3xl ${solved ? 'text-brown-900' : 'text-ivory-50'}`}
      >
        {unit.arabic}
      </button>
      {!solved && !locked && (
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" onClick={props.onUp} disabled={props.isFirst} aria-label="Naikkan kad" className="grid h-9 w-9 place-items-center rounded-lg bg-brown-900/70 text-gold-300 disabled:opacity-30" data-testid="btn-up">
            <ArrowUp size={18} />
          </button>
          <button type="button" onClick={props.onDown} disabled={props.isLast} aria-label="Turunkan kad" className="grid h-9 w-9 place-items-center rounded-lg bg-brown-900/70 text-gold-300 disabled:opacity-30" data-testid="btn-down">
            <ArrowDown size={18} />
          </button>
        </div>
      )}
    </Reorder.Item>
  );
}
