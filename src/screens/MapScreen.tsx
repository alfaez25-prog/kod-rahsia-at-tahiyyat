import { motion } from 'motion/react';
import { Award, CheckCircle2, Lock, ScrollText } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Pill, Screen, TopBar } from '../components/UI.tsx';
import { Chest, Divider, ProgressBar } from '../components/Decor.tsx';
import { allUnitsDone, gameComplete, UNIT_COUNT } from '../lib/scoring.ts';
import { certificateStatus } from '../lib/certificate.ts';

export function MapScreen() {
  const { go, progress, settings } = useGame();
  if (!progress) return null;
  const doneCount = settings.units.filter((u) => progress.units[u.id]?.meaning.done).length;
  const unlockedUpTo = doneCount + 1;
  const unitsDone = allUnitsDone(progress);
  const complete = gameComplete(progress);
  const cert = certificateStatus(progress, settings.certificateMinMastery);
  const stepsDone = doneCount + (progress.order.done ? 1 : 0);

  return (
    <>
      <TopBar showMap={false} />
      <Screen>
        <div className="mt-2 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-emerald-400">Peta Manuskrip</p>
          <h1 className="gold-text mt-1 font-display text-3xl font-extrabold sm:text-4xl">8 Peti Rahsia</h1>
          <Divider className="mt-1" />
        </div>
        <div className="mx-auto mt-4 max-w-xl">
          <div className="mb-1 flex justify-between text-xs font-bold text-ivory-200/80">
            <span>Kemajuan misi</span>
            <span data-testid="map-progress">{stepsDone} / {UNIT_COUNT + 1}</span>
          </div>
          <ProgressBar value={stepsDone} max={UNIT_COUNT + 1} />
        </div>

        <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {settings.units.map((u, idx) => {
            const rec = progress.units[u.id];
            const done = rec?.meaning.done;
            const locked = u.id > unlockedUpTo;
            const current = u.id === unlockedUpTo;
            const target = rec?.lafaz.done ? { name: 'meaning' as const, unitId: u.id } : { name: 'lafaz' as const, unitId: u.id };
            return (
              <motion.li key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => go(done ? { name: 'feedback', unitId: u.id } : target)}
                  data-testid={`chest-${u.id}`}
                  aria-label={`Peti ${u.id}: ${u.title}${done ? ' (selesai)' : locked ? ' (berkunci)' : ''}`}
                  className={`group relative flex w-full flex-col items-center rounded-2xl border p-3 pb-4 text-center transition ${
                    done
                      ? 'border-gold-400/70 bg-emerald-900/60'
                      : current
                        ? 'border-gold-400 bg-brown-800/70 shadow-[0_0_30px_-5px_rgba(230,195,92,0.6)] hover:-translate-y-1'
                        : 'cursor-not-allowed border-brown-700/60 bg-brown-900/50 opacity-70'
                  }`}
                >
                  <span className="absolute left-2 top-2 font-display text-xs font-extrabold text-gold-300/80">{String(u.id).padStart(2, '0')}</span>
                  {done && <CheckCircle2 className="absolute right-2 top-2 text-emerald-400" size={20} />}
                  {locked && <Lock className="absolute right-2 top-2 text-ivory-200/50" size={18} />}
                  <Chest size={84} open={done} locked={locked} glow={current} number={u.id} />
                  <span className="mt-1 text-sm font-extrabold leading-tight text-ivory-50">{u.title}</span>
                  {done ? (
                    <span className="mt-1 text-xs text-gold-300">+{rec.lafaz.points + rec.meaning.points} XP</span>
                  ) : current ? (
                    <span className="mt-1 text-xs font-bold text-gold-300">{rec?.lafaz.done ? 'Sambung: maksud' : 'Buka peti ini!'}</span>
                  ) : (
                    <span className="mt-1 text-xs text-ivory-200/60">Berkunci</span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ol>

        <section className="mt-8 rounded-3xl border border-gold-500/40 bg-brown-900/60 p-5 text-center sm:p-7">
          <ScrollText className="mx-auto text-gold-300" size={36} />
          <h2 className="mt-2 font-display text-xl font-extrabold text-ivory-50">Cabaran Akhir: Susun Manuskrip</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-ivory-200/80">Buka semua 8 peti untuk menyusun bacaan tahiyat awal yang lengkap.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {progress.order.done ? (
              <Pill tone="emerald">Selesai · +{progress.order.points} XP</Pill>
            ) : (
              <Button disabled={!unitsDone} onClick={() => go({ name: 'order' })} data-testid="btn-order">
                {unitsDone ? <ScrollText size={18} /> : <Lock size={18} />} Susun Manuskrip
              </Button>
            )}
            <Button variant="emerald" disabled={!complete} onClick={() => go({ name: 'results' })} data-testid="btn-results">
              Keputusan
            </Button>
            <Button variant="ghost" disabled={!cert.unlocked} onClick={() => go({ name: 'certificate' })} data-testid="btn-cert-map" title={cert.reason}>
              {cert.unlocked ? <Award size={18} /> : <Lock size={18} />} Sijil
            </Button>
          </div>
          {!cert.unlocked && <p className="mt-2 text-xs text-ivory-200/60" data-testid="cert-lock-reason">{cert.reason}</p>}
        </section>
      </Screen>
    </>
  );
}
