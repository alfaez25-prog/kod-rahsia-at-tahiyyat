import { motion } from 'motion/react';
import { Play, RotateCcw, ScrollText } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, ClassroomGuide, EmbedNotice, MuteButton, Screen } from '../components/UI.tsx';
import { Chest, Divider, SchoolCrest } from '../components/Decor.tsx';
import { gameComplete } from '../lib/scoring.ts';

export function Landing() {
  const { go, session, progress, settings } = useGame();
  const resume = session && progress;
  return (
    <Screen className="pt-6">
      <EmbedNotice />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SchoolCrest logo={settings.logoDataUrl} size={60} />
          <span className="font-display text-sm font-extrabold tracking-[0.2em] text-gold-300" data-testid="school-name">{settings.schoolName}</span>
        </div>
        <MuteButton />
      </div>

      <section className="relative mt-8 flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 10, delay: 0.2 }}>
          <Chest size={150} glow open />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-400">
          Pendidikan Islam · Tahun 4
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.06em' }}
          transition={{ duration: 1.1, delay: 0.4 }}
          className="gold-text mt-3 font-display text-4xl font-extrabold leading-tight sm:text-6xl"
        >
          KOD RAHSIA
          <br />
          AT-TAHIYYAT
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} dir="rtl" lang="ar" className="font-arabic mt-1 text-3xl text-gold-300 sm:text-4xl">
          التَّحِيَّاتُ لِلَّهِ
        </motion.p>
        <Divider className="mt-2" />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-3 font-display text-xl font-extrabold tracking-widest text-ivory-100 sm:text-2xl">
          Misi Tahiyat Awal
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-4 max-w-xl text-base leading-relaxed text-ivory-200/90">
          Sebuah manuskrip purba telah terkunci dalam <strong className="text-gold-300">8 peti rahsia</strong>. Lengkapkan lafaz, fahami maksudnya, dan susun semula
          bacaan tahiyat awal untuk menjadi <strong className="text-gold-300">Pakar Tahiyat Awal</strong>!
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-7 flex w-full max-w-md flex-col gap-3">
          {resume ? (
            <>
              <Button onClick={() => go(gameComplete(progress) ? { name: 'results' } : progress.tutorialSeen ? { name: 'map' } : { name: 'tutorial' })} className="text-lg">
                <Play size={20} /> SAMBUNG MISI — {session.name.split(' ')[0]}
              </Button>
              <Button variant="ghost" onClick={() => go({ name: 'register' })}>
                <RotateCcw size={18} /> Murid lain? Daftar nama baharu
              </Button>
            </>
          ) : (
            <Button onClick={() => go({ name: 'register' })} className="text-lg">
              <ScrollText size={20} /> MULA PENGEMBARAAN
            </Button>
          )}
        </motion.div>
      </section>

      <div className="mt-12">
        <ClassroomGuide />
      </div>

      <footer className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-ivory-200/60">
        <p>Pembahagian 8 unit ialah pembahagian pembelajaran, bukan penetapan bilangan baris bacaan dalam solat.</p>
      </footer>
    </Screen>
  );
}
