import { motion } from 'motion/react';
import { Award, CheckCircle2, Lock, Medal, RotateCcw, Target } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, ClassroomGuide, Screen, TopBar } from '../components/UI.tsx';
import { Divider } from '../components/Decor.tsx';
import { badges, firstTry, mastery, MAX_SCORE, totalScore } from '../lib/scoring.ts';
import { certificateStatus } from '../lib/certificate.ts';

export function ResultsScreen() {
  const { progress, settings, session, go, register } = useGame();
  if (!progress || !session) return null;
  const score = totalScore(progress);
  const m = mastery(progress);
  const cert = certificateStatus(progress, settings.certificateMinMastery);
  const list = badges(progress);

  const replay = () => {
    register({ name: session.name, className: session.className, avatar: session.avatar });
    go({ name: 'map' });
  };

  return (
    <>
      <TopBar />
      <Screen className="max-w-4xl">
        <div className="mt-4 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-emerald-400">Keputusan Misi</p>
          <h1 className="gold-text font-display text-3xl font-extrabold sm:text-4xl">Tahniah, {session.name.split(' ')[0]}!</h1>
          <Divider className="mt-1" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="parchment ornate-frame rounded-3xl p-6 text-center">
            <Medal className="mx-auto text-gold-600" size={36} />
            <p className="mt-1 text-sm font-bold text-brown-700">Markah XP</p>
            <p className="font-display text-5xl font-extrabold text-emerald-900" data-testid="result-score">
              {score}
              <span className="text-2xl text-brown-700"> / {MAX_SCORE}</span>
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="parchment ornate-frame rounded-3xl p-6 text-center">
            <Target className="mx-auto text-emerald-700" size={36} />
            <p className="mt-1 text-sm font-bold text-brown-700">Peratus Penguasaan</p>
            <p className="font-display text-5xl font-extrabold text-emerald-900" data-testid="result-mastery">{m.percent}%</p>
            <p className="mt-1 text-xs text-brown-700">Ketepatan percubaan pertama: {m.correctItems} / 17 item</p>
          </motion.div>
        </div>

        <section className="mt-5 rounded-3xl border border-gold-500/40 bg-brown-900/60 p-4 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-ivory-50">Analisis Pembelajaran</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <Stat label="Lafaz" value={`${m.lafazFirst}/8`} sub={`${m.lafazPercent}%`} />
            <Stat label="Maksud" value={`${m.meaningFirst}/8`} sub={`${m.meaningPercent}%`} />
            <Stat label="Susunan" value={m.orderFirst ? '1/1' : '0/1'} sub={`${progress.order.attempts} cubaan, ${progress.order.hintsUsed} petunjuk`} />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase text-gold-300/80">
                <tr>
                  <th className="p-2">Peti</th>
                  <th className="p-2">Lafaz</th>
                  <th className="p-2">Maksud</th>
                  <th className="p-2 text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {settings.units.map((u) => {
                  const r = progress.units[u.id];
                  return (
                    <tr key={u.id} className="border-t border-gold-600/20 text-ivory-100">
                      <td className="p-2 font-bold">{u.id}. {u.title}</td>
                      <td className="p-2">{firstTry(r.lafaz) ? <span className="text-emerald-400">✓ Kali pertama</span> : <span className="text-gold-300">{r.lafaz.attempts} cubaan</span>}</td>
                      <td className="p-2">{firstTry(r.meaning) ? <span className="text-emerald-400">✓ Kali pertama</span> : <span className="text-gold-300">{r.meaning.attempts} cubaan</span>}</td>
                      <td className="p-2 text-right font-extrabold text-gold-300">{r.lafaz.points + r.meaning.points}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-gold-600/20 text-ivory-100">
                  <td className="p-2 font-bold" colSpan={3}>Cabaran Susunan Akhir</td>
                  <td className="p-2 text-right font-extrabold text-gold-300">{progress.order.points}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {m.percent < 100 && (
            <p className="mt-3 rounded-xl bg-emerald-900/50 p-3 text-sm text-ivory-200">
              Cadangan: ulang kaji {settings.units.filter((u) => !firstTry(progress.units[u.id].lafaz) || !firstTry(progress.units[u.id].meaning)).map((u) => `Peti ${u.id}`).join(', ') || 'susunan bacaan'} untuk meningkatkan penguasaan.
            </p>
          )}
        </section>

        <section className="mt-5">
          <h2 className="text-center font-display text-lg font-extrabold text-ivory-50">Lencana Pencapaian</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {list.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10, rotateY: 90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`rounded-2xl border p-3 text-center ${b.earned ? 'border-gold-400 bg-gradient-to-b from-emerald-800 to-emerald-950' : 'border-brown-700 bg-brown-900/50 opacity-60'}`}
                data-testid={`badge-${b.id}`}
              >
                <Award className={`mx-auto ${b.earned ? 'glow-pulse text-gold-300' : 'text-ivory-200/40'}`} size={30} />
                <p className="mt-1 text-sm font-extrabold text-ivory-50">{b.name}</p>
                <p className="text-xs text-ivory-200/70">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button disabled={!cert.unlocked} onClick={() => go({ name: 'certificate' })} className="text-lg" data-testid="btn-certificate">
            {cert.unlocked ? <Award size={20} /> : <Lock size={18} />} LIHAT SIJIL DIGITAL
          </Button>
          <Button variant="ghost" onClick={replay}>
            <RotateCcw size={18} /> Main Semula (sesi baharu)
          </Button>
        </div>
        {!cert.unlocked && <p className="mt-2 text-center text-sm text-gold-300">{cert.reason}</p>}
        {cert.unlocked && (
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-sm text-emerald-400">
            <CheckCircle2 size={16} /> Sijil anda telah dibuka!
          </p>
        )}

        <div className="mt-8">
          <ClassroomGuide />
        </div>
      </Screen>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-brown-800/70 p-3 ring-1 ring-gold-600/30">
      <p className="text-xs text-ivory-200/70">{label}</p>
      <p className="font-display text-2xl font-extrabold text-gold-300">{value}</p>
      <p className="text-xs text-ivory-200/70">{sub}</p>
    </div>
  );
}
