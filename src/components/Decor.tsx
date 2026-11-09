import { useMemo } from 'react';
import { motion } from 'motion/react';

/** Partikel emas terapung (CSS sahaja, ringan). */
export function GoldParticles({ count = 22 }: { count?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        size: 3 + ((i * 7) % 6),
        duration: 9 + ((i * 13) % 12),
        delay: -((i * 17) % 20),
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {parts.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

/** Bintang lapan bucu (motif khatam). */
export function Star8({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 100 100" className={className}>
      <g fill="currentColor">
        <rect x="18" y="18" width="64" height="64" />
        <rect x="18" y="18" width="64" height="64" transform="rotate(45 50 50)" />
      </g>
      <circle cx="50" cy="50" r="16" fill="rgb(0 0 0 / 0.18)" />
    </svg>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 text-gold-500 ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500 sm:w-28" />
      <Star8 size={14} />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500 sm:w-28" />
    </div>
  );
}

/** Peti harta berukir dengan penutup yang boleh terbuka. */
export function Chest({ open = false, locked = false, glow = false, size = 96, number }: { open?: boolean; locked?: boolean; glow?: boolean; size?: number; number?: number }) {
  const body = locked ? '#4a3220' : '#6b4423';
  const trim = locked ? '#7a6a4a' : '#c9a227';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={glow ? 'glow-pulse' : ''} aria-hidden>
      {open && (
        <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} style={{ transformOrigin: '60px 62px' }}>
          <ellipse cx="60" cy="62" rx="34" ry="14" fill="#fff3c4" opacity="0.9" />
          <path d="M42 62 L60 20 L78 62 Z" fill="url(#beam)" opacity="0.7" />
          <rect x="44" y="50" width="32" height="14" rx="2" fill="#f8f1e0" stroke="#a6801a" />
          <line x1="48" y1="55" x2="72" y2="55" stroke="#a6801a" strokeWidth="1" />
          <line x1="48" y1="59" x2="68" y2="59" stroke="#a6801a" strokeWidth="1" />
        </motion.g>
      )}
      <defs>
        <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* badan */}
      <rect x="18" y="62" width="84" height="44" rx="6" fill={body} stroke={trim} strokeWidth="3" />
      <rect x="18" y="74" width="84" height="5" fill={trim} opacity="0.8" />
      <rect x="30" y="62" width="6" height="44" fill={trim} opacity="0.7" />
      <rect x="84" y="62" width="6" height="44" fill={trim} opacity="0.7" />
      <path d="M48 90 l12 -8 l12 8 l-12 8 z" fill="none" stroke={trim} strokeWidth="2" opacity="0.8" />
      {/* penutup */}
      <motion.g
        animate={{ rotate: open ? -38 : 0, y: open ? -6 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        style={{ transformOrigin: '18px 62px' }}
      >
        <path d="M18 62 Q18 34 60 34 Q102 34 102 62 Z" fill={body} stroke={trim} strokeWidth="3" />
        <path d="M30 62 Q30 40 36 38" stroke={trim} strokeWidth="5" fill="none" opacity="0.7" />
        <path d="M90 62 Q90 40 84 38" stroke={trim} strokeWidth="5" fill="none" opacity="0.7" />
      </motion.g>
      {/* kunci */}
      {!open && (
        <g>
          <rect x="52" y="58" width="16" height="18" rx="3" fill={locked ? '#7a6a4a' : '#e6c35c'} stroke="#2a180d" strokeWidth="1.5" />
          {locked ? <circle cx="60" cy="66" r="3" fill="#2a180d" /> : <text x="60" y="72" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2a180d" fontFamily="Cinzel, serif">{number}</text>}
        </g>
      )}
    </svg>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label ?? 'Kemajuan'}>
      <div className="h-3 w-full overflow-hidden rounded-full border border-gold-600/60 bg-brown-900/80 shadow-inner">
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-emerald-600 via-gold-500 to-gold-300"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          <span className="shimmer absolute inset-0 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}

export function SchoolCrest({ logo, size = 56 }: { logo?: string; size?: number }) {
  if (logo) return <img src={logo} alt="Logo sekolah" width={size} height={size} className="rounded-full object-contain" style={{ width: size, height: size }} />;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Lambang">
      <circle cx="50" cy="50" r="47" fill="#0b5242" stroke="#c9a227" strokeWidth="4" />
      <g fill="#c9a227" opacity="0.9">
        <rect x="27" y="27" width="46" height="46" />
        <rect x="27" y="27" width="46" height="46" transform="rotate(45 50 50)" />
      </g>
      <circle cx="50" cy="50" r="17" fill="#0b5242" />
      <path d="M50 38 a12 12 0 1 0 8 21 a10 10 0 1 1 0 -18 a12 12 0 0 0 -8 -3z" fill="#f8f1e0" />
    </svg>
  );
}
