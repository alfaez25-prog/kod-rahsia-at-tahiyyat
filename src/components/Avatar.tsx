/** Empat avatar murid berpakaian sopan (2 lelaki bersongkok/kopiah, 2 perempuan bertudung). */
export const AVATARS = [
  { id: 0, label: 'Adam (songkok & baju Melayu hijau)' },
  { id: 1, label: 'Aisyah (tudung putih & baju kurung hijau)' },
  { id: 2, label: 'Hakim (kopiah putih & jubah krim)' },
  { id: 3, label: 'Maryam (tudung emas & baju kurung coklat)' },
] as const;

const SKIN = ['#e8b98f', '#d9a275', '#c68a5d', '#f0c9a2'];

export function Avatar({ id, size = 72 }: { id: number; size?: number }) {
  const skin = SKIN[id % 4];
  const isGirl = id === 1 || id === 3;
  const outfit = ['#0f6b56', '#14846a', '#efe2c4', '#7c4f2a'][id % 4];
  const head = ['#1a0f08', '#f8f1e0', '#fffaf0', '#c9a227'][id % 4];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={AVATARS[id % 4].label}>
      <circle cx="50" cy="50" r="48" fill="#2a180d" stroke="#c9a227" strokeWidth="3" />
      <clipPath id={`av-clip-${id}`}>
        <circle cx="50" cy="50" r="46" />
      </clipPath>
      <g clipPath={`url(#av-clip-${id})`}>
        {/* badan / pakaian */}
        <path d="M14 104 Q16 72 50 70 Q84 72 86 104 Z" fill={outfit} />
        {!isGirl && <path d="M44 70 L50 84 L56 70" fill="none" stroke="#c9a227" strokeWidth="2" />}
        {isGirl ? (
          <>
            {/* tudung labuh */}
            <path d="M22 58 Q22 22 50 20 Q78 22 78 58 Q80 80 50 86 Q20 80 22 58 Z" fill={head} stroke="rgb(0 0 0 / 0.15)" />
            <ellipse cx="50" cy="50" rx="17" ry="19" fill={skin} />
          </>
        ) : (
          <>
            <rect x="44" y="60" width="12" height="12" fill={skin} />
            <ellipse cx="50" cy="48" rx="18" ry="20" fill={skin} />
            {id === 0 ? (
              <path d="M31 36 L33 22 Q50 17 67 22 L69 36 Q50 32 31 36 Z" fill={head} />
            ) : (
              <path d="M31 38 Q31 20 50 20 Q69 20 69 38 Q50 33 31 38 Z" fill={head} stroke="#c9a227" strokeWidth="1" strokeDasharray="2 2" />
            )}
          </>
        )}
        {/* wajah ringkas */}
        <circle cx="43" cy="50" r="2.2" fill="#2a180d" />
        <circle cx="57" cy="50" r="2.2" fill="#2a180d" />
        <path d="M44 58 Q50 63 56 58" stroke="#7a3b1f" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
