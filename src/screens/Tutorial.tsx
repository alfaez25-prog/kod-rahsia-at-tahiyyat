import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpenCheck, Hand, Languages, ListOrdered, Trophy } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Screen, TopBar } from '../components/UI.tsx';
import { MAX_SCORE } from '../lib/scoring.ts';

const STEPS = [
  { icon: BookOpenCheck, title: 'Buka 8 Peti Manuskrip', body: 'Setiap peti menyimpan satu bahagian bacaan tahiyat awal. Buka peti mengikut nombor, dari Peti 1 hingga Peti 8.' },
  { icon: Hand, title: 'Cabaran 1: Lengkapkan Lafaz', body: 'Pilih kad Arab yang betul untuk mengisi ruang kosong. Di komputer, anda boleh seret kad. Di telefon, ketik kad dan ia akan masuk ke ruang yang bercahaya.' },
  { icon: Languages, title: 'Cabaran 2: Fahami Maksud', body: 'Selepas lafaz lengkap, pilih maksud Bahasa Melayu yang tepat. Baca penerangan untuk faham lebih mendalam.' },
  { icon: ListOrdered, title: 'Cabaran Akhir: Susun Manuskrip', body: 'Susun semua 8 kad lafaz mengikut urutan bacaan. Seret kad, guna butang naik/turun, atau ketik dua kad untuk menukar tempat.' },
  { icon: Trophy, title: 'Markah & Sijil', body: `Jawapan betul pada percubaan pertama memberi markah penuh (maksimum ${MAX_SCORE} XP). Salah? Jangan risau — cuba lagi dengan petunjuk. Tamatkan semua cabaran untuk membuka sijil digital anda!` },
];

export function Tutorial() {
  const { go, update } = useGame();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const Icon = step.icon;
  const finish = () => {
    update((p) => ({ ...p, tutorialSeen: true }));
    go({ name: 'map' });
  };
  return (
    <>
      <TopBar showMap={false} />
      <Screen className="max-w-2xl pt-8">
        <p className="text-center text-xs font-extrabold uppercase tracking-[0.3em] text-emerald-400">Panduan Penjelajah</p>
        <div className="mt-3 flex justify-center gap-2" aria-hidden>
          {STEPS.map((_, k) => (
            <span key={k} className={`h-2 rounded-full transition-all ${k === i ? 'w-8 bg-gold-400' : 'w-2 bg-gold-600/40'}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="parchment ornate-frame mt-5 rounded-3xl p-7 text-center sm:p-10"
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-800 text-gold-300 ring-4 ring-gold-500/60">
              <Icon size={38} />
            </div>
            <p className="mt-3 text-sm font-extrabold text-emerald-700">Langkah {i + 1} / {STEPS.length}</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-brown-900">{step.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-brown-800 sm:text-lg">{step.body}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={finish}>
            Langkau
          </Button>
          {i < STEPS.length - 1 ? (
            <Button className="flex-[2]" onClick={() => setI(i + 1)}>
              Seterusnya <ArrowRight size={18} />
            </Button>
          ) : (
            <Button className="flex-[2]" onClick={finish} data-testid="btn-tutorial-done">
              Ke Peta Manuskrip <ArrowRight size={18} />
            </Button>
          )}
        </div>
      </Screen>
    </>
  );
}
