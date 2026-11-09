import { describe, expect, it } from 'vitest';
import { certificateFileName, certificateStatus, crc32, formatDateMs, readPngInfo, setPngDpi, CERT_CSS, CERT_PX } from '../lib/certificate.ts';
import { emptyOrder, emptyUnit, type ScoreInput } from '../lib/scoring.ts';

function progress(done: boolean, firstTry = true): ScoreInput {
  const units: ScoreInput['units'] = {};
  for (let i = 1; i <= 8; i++)
    units[i] = done ? { lafaz: { attempts: firstTry ? 1 : 2, done: true, points: 50 }, meaning: { attempts: 1, done: true, points: 50 } } : emptyUnit();
  return { units, order: done ? { attempts: 1, done: true, points: 200, hintsUsed: 0 } : emptyOrder() };
}

// PNG 1×1 minimum
const PNG_1x1 = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));

describe('Sijil', () => {
  it('terkunci sebelum semua cabaran tamat', () => {
    expect(certificateStatus(progress(false), 0).unlocked).toBe(false);
    const p = progress(true);
    p.order = emptyOrder();
    expect(certificateStatus(p, 0).unlocked).toBe(false);
    expect(certificateStatus(progress(true), 0).unlocked).toBe(true);
  });
  it('mematuhi tahap kelayakan guru', () => {
    expect(certificateStatus(progress(true, false), 80).unlocked).toBe(false);
    expect(certificateStatus(progress(true, true), 80).unlocked).toBe(true);
  });
  it('dimensi A4 landskap 300 DPI', () => {
    expect(CERT_PX).toEqual({ width: 3508, height: 2480 });
    expect(CERT_CSS.width * CERT_CSS.pixelRatio).toBe(3508);
    expect(CERT_CSS.height * CERT_CSS.pixelRatio).toBe(2480);
  });
  it('nama fail selamat dan unik', () => {
    const d = new Date(2026, 10, 9, 14, 5, 7);
    const f = certificateFileName('Nur ‘Aisyah / binti: Ahmad*?', '4 Bestari', d, 'pdf');
    expect(f).toBe('Sijil_PakarTahiyatAwal_Nur_Aisyah_binti_Ahmad_4_Bestari_20261109-140507.pdf');
    expect(f).toMatch(/^[A-Za-z0-9_.-]+$/);
    expect(certificateFileName('محمد', '4A', d, 'png')).toMatch(/_Murid_4A_20261109-140507\.png$/);
    expect(certificateFileName('A', '4A', new Date(2026, 10, 9, 14, 5, 8), 'png')).not.toBe(certificateFileName('A', '4A', d, 'png'));
  });
  it('format tarikh Bahasa Melayu', () => {
    expect(formatDateMs(new Date(2026, 10, 9))).toBe('9 November 2026');
    expect(formatDateMs(new Date(2026, 2, 1))).toBe('1 Mac 2026');
  });
  it('menyisip metadata 300 DPI ke dalam PNG', () => {
    expect(readPngInfo(PNG_1x1).dpi).toBeNull();
    const out = setPngDpi(PNG_1x1, 300);
    const info = readPngInfo(out);
    expect(info).toEqual({ width: 1, height: 1, dpi: 300 });
    // idempoten
    expect(readPngInfo(setPngDpi(out, 300)).dpi).toBe(300);
    expect(setPngDpi(out, 300).length).toBe(out.length);
  });
  it('crc32 betul', () => {
    expect(crc32(new TextEncoder().encode('IEND'))).toBe(0xae426082);
  });
});
