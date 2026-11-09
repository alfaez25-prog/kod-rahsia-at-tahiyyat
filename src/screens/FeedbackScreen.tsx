import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Info, Map as MapIcon, ScrollText } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Pill, Screen, TopBar, UnitAudio } from '../components/UI.tsx';
import { Chest, Divider } from '../components/Decor.tsx';
import { allUnitsDone, firstTry } from '../lib/scoring.ts';
import { play } from '../lib/audio.ts';
import { CATEGORY_LABEL } from '../data/tahiyat.ts';

export function FeedbackScreen({ unitId }: { unitId: number }) {
  const { settings, progress, go } = useGame();
  const unit = settings.units.find((u) => u.id === unitId)!;
  const rec = progress!.units[unitId];
  const nextUnit = settings.units.find((u) => u.id === unitId + 1);
  const all = allUnitsDone(progress!);

  useEffect(() => {
    play('chest');
  }, []);

  return (
    <>
      <TopBar />
      <Screen className="max-w-3xl">
        <div className="mt-4 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 9 }}>
            <Chest open glow size={140} />
          </motion.div>
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-emerald-400">Peti {unitId} Terbuka</p>
          <h1 className="gold-text font-display text-3xl font-extrabold">{unit.title}</h1>
          <Divider className="mt-1" />
        </div>

        <motion.section initial={{ opacity: 0, y: 20, rotateX: 25 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.3 }} className="parchment ornate-frame mt-5 rounded-3xl p-5 text-center sm:p-8">
          <p className="text-xs font-bold text-emerald-700">{CATEGORY_LABEL[unit.category]}</p>
          <p dir="rtl" lang="ar" className="font-arabic mt-1 text-3xl text-brown-900 sm:text-5xl">
            {unit.arabic}
          </p>
          <p className="mt-2 text-lg font-bold text-emerald-900 sm:text-xl" data-testid="feedback-meaning">
            “{unit.meaning}”
          </p>
          <UnitAudio unit={unit} />
          <div className="mt-4 rounded-2xl bg-ivory-50/70 p-4 text-left text-sm leading-relaxed text-brown-800 ring-1 ring-gold-600/30 sm:text-base">
            <p className="mb-1 flex items-center gap-2 font-extrabold text-brown-900">
              <BookOpen size={18} className="text-emerald-700" /> Penerangan
            </p>
            {unit.explanation}
          </div>
          {unit.category === 'selawat' && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-800/10 p-3 text-left text-xs text-brown-800 ring-1 ring-emerald-700/30">
              <Info size={16} className="mt-0.5 shrink-0 text-emerald-700" />
              Bacaan tasyahhud tamat pada Unit 7. Unit 8 ialah tambahan selawat yang diajarkan dalam tahiyat awal mengikut panduan pengajaran mazhab Syafi‘i. Rujuk guru untuk penjelasan lanjut.
            </p>
          )}
        </motion.section>

        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl border border-gold-500/40 bg-brown-900/60 p-3">
            <p className="text-xs text-ivory-200/70">Lafaz</p>
            <p className="font-display text-2xl font-extrabold text-gold-300">+{rec.lafaz.points}</p>
            {firstTry(rec.lafaz) ? <Pill tone="emerald">Percubaan pertama</Pill> : <Pill>{rec.lafaz.attempts} percubaan</Pill>}
          </div>
          <div className="rounded-2xl border border-gold-500/40 bg-brown-900/60 p-3">
            <p className="text-xs text-ivory-200/70">Maksud</p>
            <p className="font-display text-2xl font-extrabold text-gold-300">+{rec.meaning.points}</p>
            {firstTry(rec.meaning) ? <Pill tone="emerald">Percubaan pertama</Pill> : <Pill>{rec.meaning.attempts} percubaan</Pill>}
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="ghost" onClick={() => go({ name: 'map' })}>
            <MapIcon size={18} /> Peta
          </Button>
          {all && !progress!.order.done ? (
            <Button onClick={() => go({ name: 'order' })} data-testid="btn-next">
              <ScrollText size={18} /> Cabaran Akhir: Susun Manuskrip
            </Button>
          ) : nextUnit && !progress!.units[nextUnit.id].meaning.done ? (
            <Button onClick={() => go(progress!.units[nextUnit.id].lafaz.done ? { name: 'meaning', unitId: nextUnit.id } : { name: 'lafaz', unitId: nextUnit.id })} data-testid="btn-next">
              Peti {nextUnit.id} <ArrowRight size={18} />
            </Button>
          ) : null}
        </div>
      </Screen>
    </>
  );
}
