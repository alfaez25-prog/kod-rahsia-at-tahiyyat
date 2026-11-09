import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, HelpCircle, Lightbulb, XCircle } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Pill, Screen, TopBar, UnitAudio } from '../components/UI.tsx';
import { Divider } from '../components/Decor.tsx';
import { buildMeaningQuestion, checkMeaning } from '../data/questionBank.ts';
import { meaningPoints } from '../lib/scoring.ts';
import { play } from '../lib/audio.ts';

export function MeaningScreen({ unitId }: { unitId: number }) {
  const { settings, progress, session, update, go } = useGame();
  const unit = settings.units.find((u) => u.id === unitId)!;
  const q = useMemo(() => buildMeaningQuestion(unit, session?.sessionId ?? 'x'), [unit, session?.sessionId]);
  const rec = progress!.units[unitId].meaning;
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [lastWrong, setLastWrong] = useState<string | null>(null);
  const [correctChosen, setCorrectChosen] = useState<string | null>(rec.done ? q.correctId : null);

  const choose = (id: string) => {
    if (correctChosen || eliminated.includes(id)) return;
    const attempt = rec.attempts + 1;
    if (checkMeaning(q, id)) {
      const pts = meaningPoints(attempt);
      update((p) => {
        p.units[unitId].meaning = { attempts: attempt, done: true, points: pts };
        return p;
      });
      setCorrectChosen(id);
      play('correct');
    } else {
      update((p) => {
        p.units[unitId].meaning.attempts = attempt;
        return p;
      });
      setEliminated((e) => [...e, id]);
      setLastWrong(id);
      play('wrong');
    }
  };

  const wrongText = q.options.find((o) => o.id === lastWrong)?.text;

  return (
    <>
      <TopBar />
      <Screen>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Pill>Peti {unitId} / 8</Pill>
          <Pill tone="emerald">Cabaran 2 · Maksud</Pill>
          {rec.attempts > 0 && !correctChosen && <Pill tone="red">Percubaan ke-{rec.attempts + 1}</Pill>}
        </div>
        <h1 className="gold-text mt-3 text-center font-display text-2xl font-extrabold sm:text-3xl">{unit.title}</h1>
        <Divider className="mt-1" />

        <section className="parchment ornate-frame mt-5 rounded-3xl px-4 py-6 text-center sm:px-10 sm:py-8">
          <p dir="rtl" lang="ar" className="font-arabic text-3xl text-brown-900 sm:text-5xl" data-testid="meaning-arabic">
            {q.arabic}
          </p>
          <UnitAudio unit={unit} />
        </section>

        <h2 className="mt-6 flex items-center justify-center gap-2 text-center text-lg font-extrabold text-ivory-50 sm:text-xl">
          <HelpCircle className="text-gold-300" /> Apakah maksud bacaan ini?
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="group" aria-label="Pilihan maksud">
          {q.options.map((o, k) => {
            const isEliminated = eliminated.includes(o.id);
            const isCorrect = correctChosen === o.id;
            return (
              <motion.button
                key={o.id}
                type="button"
                onClick={() => choose(o.id)}
                disabled={isEliminated || (!!correctChosen && !isCorrect)}
                initial={{ opacity: 0, y: 16 }}
                animate={isEliminated && lastWrong === o.id ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] } : { opacity: 1, y: 0 }}
                transition={{ delay: isEliminated ? 0 : k * 0.06 }}
                whileHover={!correctChosen && !isEliminated ? { y: -3 } : undefined}
                data-testid="meaning-option"
                aria-label={o.text + (isEliminated ? ' (salah)' : isCorrect ? ' (betul)' : '')}
                className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-4 text-left text-base font-semibold leading-snug transition sm:text-lg ${
                  isCorrect
                    ? 'border-emerald-400 bg-emerald-700 text-ivory-50 shadow-[0_0_30px_rgba(63,191,152,0.5)]'
                    : isEliminated
                      ? 'border-red-400/40 bg-red-950/40 text-ivory-200/50 line-through'
                      : correctChosen
                        ? 'border-brown-700 bg-brown-900/40 text-ivory-200/40'
                        : 'border-gold-500/70 bg-brown-800/70 text-ivory-50 hover:border-gold-300 hover:bg-brown-700/70'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-extrabold ${isCorrect ? 'bg-gold-400 text-brown-900' : 'bg-gold-500/20 text-gold-300'}`}>
                  {isCorrect ? <CheckCircle2 size={20} /> : isEliminated ? <XCircle size={20} /> : 'ABCD'[k]}
                </span>
                <span>{o.text}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {!correctChosen && lastWrong && (
            <motion.div key={lastWrong} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-gold-500/50 bg-gold-500/10 p-4 text-sm text-gold-300" role="status" data-testid="meaning-feedback">
              <p className="font-bold text-red-300">"{wrongText}" bukan maksud bacaan ini.</p>
              <p className="mt-1 flex items-start gap-2">
                <Lightbulb size={18} className="mt-0.5 shrink-0" /> Petunjuk: {q.hint}
              </p>
              <p className="mt-1 text-ivory-200/80">Markah jika betul selepas ini: {meaningPoints(rec.attempts + 1)} XP.</p>
            </motion.div>
          )}
          {correctChosen && (
            <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col items-center text-center">
              <p className="font-display text-xl font-extrabold text-emerald-400">Tepat sekali!</p>
              <Button className="mt-3" onClick={() => go({ name: 'feedback', unitId })} data-testid="btn-to-feedback">
                Buka Peti <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Screen>
    </>
  );
}
