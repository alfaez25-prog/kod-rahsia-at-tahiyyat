import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CERT_CSS } from '../lib/certificate.ts';
import { SchoolCrest } from './Decor.tsx';

export interface CertificateData {
  schoolName: string;
  logo: string;
  studentName: string;
  className: string;
  score: number;
  maxScore: number;
  mastery: number;
  date: string;
  badge: string;
  badges: string[];
}

/** Muat nama panjang: satu baris (104→72px), jika tidak muat guna dua baris (60→36px). */
export const NAME_BOX_HEIGHT = 140;
function useFitText(text: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [fit, setFit] = useState({ size: 104, wrap: false });
  const [fontsReady, setFontsReady] = useState(0);
  useEffect(() => {
    let alive = true;
    void document.fonts?.load("700 60px 'Amiri'").then(() => document.fonts.ready).then(() => alive && setFontsReady((n) => n + 1));
    return () => {
      alive = false;
    };
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.whiteSpace = 'nowrap';
    let s = 104;
    el.style.fontSize = `${s}px`;
    while (s > 72 && el.scrollWidth > el.clientWidth + 1) {
      s -= 2;
      el.style.fontSize = `${s}px`;
    }
    if (el.scrollWidth <= el.clientWidth + 1) {
      setFit({ size: s, wrap: false });
      return;
    }
    el.style.whiteSpace = 'normal';
    s = 60;
    el.style.fontSize = `${s}px`;
    while (s > 36 && (el.scrollHeight > NAME_BOX_HEIGHT || el.scrollWidth > el.clientWidth + 1)) {
      s -= 2;
      el.style.fontSize = `${s}px`;
    }
    setFit({ size: s, wrap: true });
  }, [text, fontsReady]);
  return { ref, ...fit };
}

const Corner = ({ style }: { style: React.CSSProperties }) => (
  <svg width="170" height="170" viewBox="0 0 100 100" style={{ position: 'absolute', ...style }} aria-hidden>
    <g fill="none" stroke="#a6801a" strokeWidth="1.6">
      <path d="M4 96 V30 Q4 4 30 4 H96" />
      <path d="M12 96 V34 Q12 12 34 12 H96" strokeWidth="0.8" />
    </g>
    <g fill="#c9a227" transform="translate(28 28)">
      <rect x="-12" y="-12" width="24" height="24" />
      <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" />
      <circle r="6" fill="#0b5242" />
    </g>
  </svg>
);

export const Certificate = forwardRef<HTMLDivElement, { data: CertificateData }>(function Certificate({ data }, ref) {
  const fit = useFitText(data.studentName);
  return (
    <div
      ref={ref}
      data-testid="certificate"
      style={{
        width: CERT_CSS.width,
        height: CERT_CSS.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Nunito', sans-serif",
        color: '#2a180d',
        background: 'radial-gradient(ellipse at 50% 40%, #fffaf0 0%, #f8f1e0 45%, #ecdcb4 100%)',
      }}
    >
      {/* bingkai */}
      <div style={{ position: 'absolute', inset: 36, border: '14px solid #0b5242', borderRadius: 18 }} />
      <div style={{ position: 'absolute', inset: 58, border: '3px solid #c9a227', borderRadius: 10 }} />
      <div style={{ position: 'absolute', inset: 70, border: '1px solid #c9a227', borderRadius: 8 }} />
      <Corner style={{ top: 50, left: 50 }} />
      <Corner style={{ top: 50, right: 50, transform: 'scaleX(-1)' }} />
      <Corner style={{ bottom: 50, left: 50, transform: 'scaleY(-1)' }} />
      <Corner style={{ bottom: 50, right: 50, transform: 'scale(-1,-1)' }} />
      {/* corak latar */}
      <svg width="760" height="760" viewBox="0 0 100 100" style={{ position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)', opacity: 0.05 }} aria-hidden>
        <g fill="#c9a227">
          <rect x="15" y="15" width="70" height="70" />
          <rect x="15" y="15" width="70" height="70" transform="rotate(45 50 50)" />
        </g>
      </svg>

      <div data-testid="cert-content" style={{ position: 'absolute', inset: '104px 150px 104px', display: 'flex', overflow: 'hidden', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <SchoolCrest logo={data.logo} size={100} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: 52, letterSpacing: 6, color: '#0b5242', lineHeight: 1.1 }}>{data.schoolName}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: 4, color: '#7c5e12' }}>PENDIDIKAN ISLAM · TAHUN 4</p>
          </div>
        </div>

        <p style={{ margin: '26px 0 0', fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: 62, letterSpacing: 10, color: '#7c5e12' }}>SIJIL PENCAPAIAN DIGITAL</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 6 }}>
          <span style={{ width: 200, height: 2, background: 'linear-gradient(90deg,transparent,#c9a227)' }} />
          <span style={{ fontFamily: "'Amiri', serif", fontSize: 40, color: '#0b5242' }} dir="rtl" lang="ar">التَّحِيَّاتُ لِلَّهِ</span>
          <span style={{ width: 200, height: 2, background: 'linear-gradient(270deg,transparent,#c9a227)' }} />
        </div>

        <p style={{ margin: '14px 0 0', fontSize: 30, color: '#5a3a22' }}>Dengan ini disahkan bahawa</p>
        <div style={{ margin: '4px 0 0', width: '100%', height: NAME_BOX_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p
            ref={fit.ref}
            data-testid="cert-name"
            style={{
              margin: 0,
              width: '100%',
              fontFamily: "'Amiri', serif",
              fontWeight: 700,
              fontSize: fit.size,
              lineHeight: 1.15,
              color: '#2a180d',
              whiteSpace: fit.wrap ? 'normal' : 'nowrap',
              textWrap: 'balance',
              overflowWrap: 'break-word',
              hyphens: 'none',
            }}
          >
            {data.studentName.replace(/-/g, '\u2011')}
          </p>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: 34, fontWeight: 800, color: '#0b5242', maxWidth: '100%', overflowWrap: 'anywhere' }} data-testid="cert-class">
          Kelas {data.className}
        </p>
        <p style={{ margin: '14px 0 0', fontSize: 26, color: '#5a3a22', maxWidth: 1440, lineHeight: 1.4 }}>
          telah berjaya menamatkan permainan <strong>KOD RAHSIA AT-TAHIYYAT: Misi Tahiyat Awal</strong> dan dianugerahkan gelaran
        </p>
        <p style={{ margin: '10px 0 0', fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: 70, letterSpacing: 6, color: '#0b5242', lineHeight: 1.15 }}>PAKAR TAHIYAT AWAL</p>

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <InfoBox label="MARKAH" value={`${data.score} / ${data.maxScore}`} testId="cert-score" />
          <InfoBox label="PENGUASAAN" value={`${data.mastery}%`} testId="cert-mastery" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 340 }}>
            <BadgeSeal />
            <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: '#7c5e12', lineHeight: 1.2 }} data-testid="cert-badge">{data.badge}</p>
            <p style={{ margin: '2px 0 0', fontSize: 18, color: '#5a3a22', lineHeight: 1.25 }} data-testid="cert-badge-count">
              {data.badges.length} daripada 5 lencana pencapaian
            </p>
          </div>
          <InfoBox label="TARIKH TAMAT" value={data.date} testId="cert-date" />
        </div>
      </div>
    </div>
  );
});

function InfoBox({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div style={{ width: 330, textAlign: 'center' }}>
      <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: value.length > 12 ? 30 : 40, fontWeight: 800, color: '#2a180d', whiteSpace: 'nowrap' }} data-testid={testId}>{value}</p>
      <div style={{ height: 2, background: '#a6801a', margin: '8px 20px' }} />
      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 4, color: '#7c5e12' }}>{label}</p>
    </div>
  );
}

function BadgeSeal() {
  return (
    <svg width="124" height="124" viewBox="0 0 100 100" aria-hidden>
      <g fill="#c9a227">
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x="44" y="2" width="12" height="20" rx="2" transform={`rotate(${i * 22.5} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="38" fill="#0b5242" stroke="#e6c35c" strokeWidth="3" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#e6c35c" strokeWidth="1" strokeDasharray="2 2" />
      <g fill="#e6c35c" transform="translate(50 46)">
        <rect x="-11" y="-11" width="22" height="22" />
        <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" />
        <circle r="6" fill="#0b5242" />
      </g>
      <text x="50" y="78" textAnchor="middle" fontSize="8" fontWeight="800" fill="#f8f1e0" fontFamily="Cinzel, serif" letterSpacing="1">PAKAR</text>
    </svg>
  );
}
