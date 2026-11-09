import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, GraduationCap, Map as MapIcon, Volume2, VolumeX, Headphones } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Avatar } from './Avatar.tsx';
import { totalScore, MAX_SCORE } from '../lib/scoring.ts';
import { CLASSROOM_STEPS, safeUrl } from '../lib/settings.ts';
import { play } from '../lib/audio.ts';
import type { UnitContent } from '../data/types.ts';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'emerald' | 'ghost'; children: ReactNode };

export function Button({ variant = 'gold', className = '', children, onClick, ...rest }: BtnProps) {
  const base =
    variant === 'gold' ? 'btn-gold' : variant === 'emerald' ? 'btn-emerald' : 'border border-gold-500/50 bg-brown-900/40 text-ivory-100 hover:bg-brown-800/60';
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        play('click');
        onClick?.(e);
      }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-extrabold tracking-wide transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-300/60 ${base} ${className}`}
    >
      {children}
    </button>
  );
}

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6 ${className}`}
    >
      {children}
    </motion.main>
  );
}

export function MuteButton() {
  const { muted, toggleMute } = useGame();
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? 'Hidupkan bunyi' : 'Senyapkan bunyi'}
      aria-pressed={muted}
      className="grid h-11 w-11 place-items-center rounded-full border border-gold-500/60 bg-brown-900/70 text-gold-300 hover:bg-brown-800"
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}

/** Bar atas: avatar, nama, kelas, markah, butang peta & senyap. */
export function TopBar({ showMap = true }: { showMap?: boolean }) {
  const { session, progress, go } = useGame();
  if (!session || !progress) return null;
  const score = totalScore(progress);
  return (
    <header className="sticky top-0 z-30 border-b border-gold-600/30 bg-brown-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 sm:px-6">
        <Avatar id={session.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-ivory-50" data-testid="hud-name">{session.name}</p>
          <p className="truncate text-xs text-gold-300/90" data-testid="hud-class">Kelas {session.className}</p>
        </div>
        <div className="rounded-full border border-gold-500/60 bg-emerald-900/70 px-3 py-1 text-sm font-extrabold text-gold-300" aria-label={`Markah ${score} daripada ${MAX_SCORE}`}>
          <span data-testid="hud-score">{score}</span>
          <span className="text-ivory-200/70"><span className="hidden sm:inline"> / {MAX_SCORE}</span> XP</span>
        </div>
        {showMap && (
          <button
            type="button"
            onClick={() => go({ name: 'map' })}
            aria-label="Kembali ke peta"
            className="grid h-11 w-11 place-items-center rounded-full border border-gold-500/60 bg-brown-900/70 text-gold-300 hover:bg-brown-800"
          >
            <MapIcon size={20} />
          </button>
        )}
        <MuteButton />
      </div>
    </header>
  );
}

export function ClassroomGuide({ detailed = true }: { detailed?: boolean }) {
  const { settings } = useGame();
  const url = safeUrl(settings.classroomUrl);
  return (
    <section aria-labelledby="gc-title" className="parchment ornate-frame rounded-2xl p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-1 shrink-0 text-emerald-700" size={28} />
        <div>
          <h2 id="gc-title" className="font-display text-lg font-extrabold text-emerald-900 sm:text-xl">Hantar Sijil ke Google Classroom</h2>
          <p className="mt-1 text-sm leading-relaxed text-brown-800 sm:text-base">{settings.submissionText}</p>
        </div>
      </div>
      {detailed && (
        <ol className="mt-4 grid gap-2 sm:grid-cols-3">
          {CLASSROOM_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg bg-ivory-50/70 p-2 text-sm text-brown-900 ring-1 ring-gold-600/30">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-800 text-xs font-extrabold text-gold-300">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="classroom-link"
          className="btn-emerald inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 font-extrabold"
        >
          BUKA GOOGLE CLASSROOM <ExternalLink size={18} />
        </a>
        <p className="text-xs text-brown-700">Penghantaran tidak berlaku secara automatik — anda perlu melampirkan dan menyerahkan fail sendiri.</p>
      </div>
    </section>
  );
}

/** Rakaman bacaan HANYA jika guru telah menyediakan & mengesahkannya. */
export function UnitAudio({ unit }: { unit: UnitContent }) {
  if (!unit.audioUrl || !unit.audioVerified) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-brown-800">
      <Headphones size={18} className="text-emerald-700" />
      <span className="font-bold">Dengar bacaan (rakaman disahkan guru):</span>
      <audio controls preload="none" src={unit.audioUrl} className="h-9 max-w-full" />
    </div>
  );
}

export function Pill({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'emerald' | 'red' }) {
  const t = tone === 'gold' ? 'bg-gold-500/15 text-gold-300 ring-gold-500/50' : tone === 'emerald' ? 'bg-emerald-600/20 text-emerald-400 ring-emerald-400/40' : 'bg-red-500/15 text-red-300 ring-red-400/40';
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${t}`}>{children}</span>;
}

/** Jika dibuka dalam iframe (cth. Google Sites), cadangkan buka dalam tab baharu supaya muat turun sijil & simpanan berfungsi. */
export function EmbedNotice() {
  let embedded = false;
  try {
    embedded = window.self !== window.top;
  } catch {
    embedded = true;
  }
  if (!embedded) return null;
  return (
    <div className="mb-4 flex flex-col items-center gap-2 rounded-2xl border border-gold-400 bg-gold-500/15 p-3 text-center text-sm text-gold-300 sm:flex-row sm:text-left" data-testid="embed-notice">
      <span className="flex-1">
        Anda bermain di dalam laman terbenam. Untuk memastikan sijil boleh dimuat turun dan kemajuan disimpan, buka permainan dalam tab baharu.
      </span>
      <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 font-extrabold">
        BUKA SKRIN PENUH <ExternalLink size={16} />
      </a>
    </div>
  );
}
