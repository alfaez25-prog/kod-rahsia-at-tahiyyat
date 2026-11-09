import { gameComplete, mastery, type ScoreInput } from './scoring.ts';

/** Dimensi sijil: A4 landskap pada 300 DPI. */
export const CERT_PX = { width: 3508, height: 2480 } as const;
/** Saiz susun atur CSS; dirender dengan pixelRatio 2 → 3508 × 2480. */
export const CERT_CSS = { width: 1754, height: 1240, pixelRatio: 2 } as const;
export const A4_MM = { width: 297, height: 210 } as const;

const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

export function formatDateMs(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export interface CertificateLock {
  unlocked: boolean;
  reason: string;
}

export function certificateStatus(p: ScoreInput, minMastery: number): CertificateLock {
  if (!gameComplete(p)) return { unlocked: false, reason: 'Sijil akan dibuka selepas semua 8 peti dan cabaran susunan akhir selesai.' };
  const m = mastery(p).percent;
  if (m < minMastery)
    return { unlocked: false, reason: `Guru menetapkan penguasaan minimum ${minMastery}%. Penguasaan anda ${m}%. Cuba main semula untuk membuka sijil.` };
  return { unlocked: true, reason: '' };
}

/** Bina nama fail yang selamat & unik. */
export function certificateFileName(name: string, className: string, completedAt: Date, ext: 'pdf' | 'png'): string {
  const slug = (s: string, max: number) =>
    s
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, max) || 'Murid';
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${completedAt.getFullYear()}${pad(completedAt.getMonth() + 1)}${pad(completedAt.getDate())}-${pad(completedAt.getHours())}${pad(completedAt.getMinutes())}${pad(completedAt.getSeconds())}`;
  return `Sijil_PakarTahiyatAwal_${slug(name, 40)}_${slug(className, 20)}_${stamp}.${ext}`;
}

// ---------- PNG 300 DPI (chunk pHYs) ----------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Sisip chunk pHYs (DPI) selepas IHDR. 300 DPI = 11811 piksel/meter. */
export function setPngDpi(png: Uint8Array, dpi = 300): Uint8Array {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (png[i] !== sig[i]) throw new Error('Bukan fail PNG');
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1; // unit: meter
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  // buang pHYs sedia ada
  const parts: Uint8Array[] = [png.subarray(0, 8)];
  let off = 8;
  let inserted = false;
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  while (off < png.length) {
    const len = view.getUint32(off);
    const type = String.fromCharCode(png[off + 4], png[off + 5], png[off + 6], png[off + 7]);
    const end = off + 12 + len;
    if (type !== 'pHYs') parts.push(png.subarray(off, end));
    if (type === 'IHDR' && !inserted) {
      parts.push(chunk);
      inserted = true;
    }
    off = end;
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

export function readPngInfo(png: Uint8Array): { width: number; height: number; dpi: number | null } {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  let off = 8;
  let dpi: number | null = null;
  while (off < png.length) {
    const len = view.getUint32(off);
    const type = String.fromCharCode(png[off + 4], png[off + 5], png[off + 6], png[off + 7]);
    if (type === 'pHYs') dpi = Math.round(view.getUint32(off + 8) * 0.0254);
    if (type === 'IDAT') break;
    off += 12 + len;
  }
  return { width, height, dpi };
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------- Penjanaan (pelayar) ----------

async function renderOptions() {
  await document.fonts?.ready;
  return {
    width: CERT_CSS.width,
    height: CERT_CSS.height,
    pixelRatio: CERT_CSS.pixelRatio,
    canvasWidth: CERT_CSS.width,
    canvasHeight: CERT_CSS.height,
    cacheBust: false,
    backgroundColor: '#f8f1e0',
    style: { transform: 'none', margin: '0' },
  };
}

export async function renderCertificatePng(node: HTMLElement): Promise<Uint8Array> {
  const { toPng } = await import('html-to-image');
  const opts = await renderOptions();
  // Render dua kali: kali pertama memanaskan cache fon/imej (isu dikenali html-to-image di Safari).
  await toPng(node, { ...opts, pixelRatio: 0.25 });
  const url = await toPng(node, opts);
  return setPngDpi(dataUrlToBytes(url), 300);
}

export async function renderCertificateJpeg(node: HTMLElement): Promise<string> {
  const { toJpeg } = await import('html-to-image');
  const opts = await renderOptions();
  await toJpeg(node, { ...opts, pixelRatio: 0.25 });
  return toJpeg(node, { ...opts, quality: 0.95 });
}

export async function buildCertificatePdf(jpegDataUrl: string, meta: { title: string; author: string }): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: meta.title, author: meta.author, subject: 'Sijil Pencapaian Digital', creator: 'Kod Rahsia At-Tahiyyat' });
  pdf.addImage(jpegDataUrl, 'JPEG', 0, 0, A4_MM.width, A4_MM.height, undefined, 'FAST');
  return pdf.output('blob');
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
