import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileImage, Loader2, Lock, Printer } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, ClassroomGuide, EmbedNotice, Screen, TopBar } from '../components/UI.tsx';
import { Certificate, type CertificateData } from '../components/Certificate.tsx';
import { badges, headlineBadge, mastery, MAX_SCORE, totalScore } from '../lib/scoring.ts';
import {
  buildCertificatePdf,
  CERT_CSS,
  certificateFileName,
  certificateStatus,
  downloadBlob,
  formatDateMs,
  renderCertificateJpeg,
  renderCertificatePng,
} from '../lib/certificate.ts';
import { play } from '../lib/audio.ts';

type Busy = null | 'pdf' | 'png' | 'print';

export function CertificateScreen() {
  const { progress, session, settings, go } = useGame();
  const certRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState('');

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / CERT_CSS.width));
    ro.observe(el);
    setScale(el.clientWidth / CERT_CSS.width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => play('complete'), []);

  if (!progress || !session) return null;
  const lock = certificateStatus(progress, settings.certificateMinMastery);
  if (!lock.unlocked) {
    return (
      <>
        <TopBar />
        <Screen className="max-w-xl pt-10 text-center">
          <Lock className="mx-auto text-gold-300" size={48} />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-ivory-50">Sijil Masih Berkunci</h1>
          <p className="mt-2 text-ivory-200" data-testid="cert-locked">{lock.reason}</p>
          <Button className="mt-5" onClick={() => go({ name: 'map' })}>Kembali ke Peta</Button>
        </Screen>
      </>
    );
  }

  const completed = new Date(progress.completedAt!);
  const earned = badges(progress).filter((b) => b.earned).map((b) => b.name);
  const data: CertificateData = {
    schoolName: settings.schoolName,
    logo: settings.logoDataUrl,
    studentName: session.name,
    className: session.className,
    score: totalScore(progress),
    maxScore: MAX_SCORE,
    mastery: mastery(progress).percent,
    date: formatDateMs(completed),
    badge: headlineBadge(progress).name,
    badges: earned,
  };

  const run = async (kind: Exclude<Busy, null>) => {
    if (!certRef.current || busy) return;
    setBusy(kind);
    setStatus('Menyediakan sijil berkualiti tinggi…');
    try {
      if (kind === 'png') {
        const bytes = await renderCertificatePng(certRef.current);
        downloadBlob(new Blob([bytes as BlobPart], { type: 'image/png' }), certificateFileName(session.name, session.className, completed, 'png'));
        setStatus('Sijil PNG (3508 × 2480 piksel, 300 DPI) telah dimuat turun. Semak folder Muat Turun anda.');
      } else if (kind === 'pdf') {
        const jpeg = await renderCertificateJpeg(certRef.current);
        const blob = await buildCertificatePdf(jpeg, { title: `Sijil Pakar Tahiyat Awal — ${session.name}`, author: settings.schoolName });
        downloadBlob(blob, certificateFileName(session.name, session.className, completed, 'pdf'));
        setStatus('Sijil PDF (A4 landskap) telah dimuat turun. Semak folder Muat Turun anda.');
      } else {
        const jpeg = await renderCertificateJpeg(certRef.current);
        const area = document.getElementById('print-area');
        if (area) {
          area.innerHTML = '';
          const img = new Image();
          img.alt = 'Sijil';
          img.src = jpeg;
          area.appendChild(img);
          await img.decode().catch(() => undefined);
        }
        setStatus('');
        window.print();
      }
      play('correct');
    } catch (e) {
      console.error(e);
      setStatus('Maaf, sijil gagal dijana. Cuba lagi, atau gunakan pelayar Chrome/Edge terkini.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <TopBar />
      <Screen className="max-w-5xl">
      <EmbedNotice />
        <div className="mt-4 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-emerald-400">Ganjaran Misi</p>
          <h1 className="gold-text font-display text-3xl font-extrabold">Sijil Digital Anda</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, rotateX: 40, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          ref={wrapRef}
          className="relative mt-5 w-full overflow-hidden rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-2 ring-gold-500/60"
          style={{ height: CERT_CSS.height * scale }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: CERT_CSS.width, height: CERT_CSS.height }}>
            <Certificate ref={certRef} data={data} />
          </div>
        </motion.div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button onClick={() => run('pdf')} disabled={!!busy} data-testid="btn-pdf">
            {busy === 'pdf' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} MUAT TURUN PDF
          </Button>
          <Button onClick={() => run('png')} disabled={!!busy} data-testid="btn-png">
            {busy === 'png' ? <Loader2 className="animate-spin" size={18} /> : <FileImage size={18} />} MUAT TURUN PNG
          </Button>
          <Button variant="emerald" onClick={() => run('print')} disabled={!!busy} data-testid="btn-print">
            {busy === 'print' ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />} CETAK SIJIL
          </Button>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-6 text-center text-sm font-bold text-gold-300" data-testid="cert-status">
          {status}
        </p>

        <div className="mt-6">
          <ClassroomGuide />
        </div>
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={() => go({ name: 'results' })}>Kembali ke Keputusan</Button>
        </div>
      </Screen>
    </>
  );
}
