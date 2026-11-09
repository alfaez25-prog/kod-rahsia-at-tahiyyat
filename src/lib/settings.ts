import { DEFAULT_UNITS } from '../data/tahiyat.ts';
import type { UnitContent } from '../data/types.ts';

export const CLASSROOM_URL = 'https://classroom.google.com/';

export const DEFAULT_SUBMISSION_TEXT =
  'Selepas tamat permainan, muat turun sijil anda dalam format PDF atau PNG. Buka Google Classroom, pilih tugasan Pendidikan Islam, lampirkan sijil dan tekan Serahkan.';

export const CLASSROOM_STEPS = [
  'Tamatkan semua cabaran.',
  'Muat turun sijil PDF atau PNG.',
  'Buka Google Classroom.',
  'Pilih kelas Pendidikan Islam.',
  'Buka tugasan guru.',
  'Tekan Tambah atau cipta.',
  'Pilih fail sijil.',
  'Tekan Serahkan.',
  'Pastikan tugasan telah dihantar.',
];

/** Konfigurasi permainan (tetap). Ubah nilai di sini dan bina semula untuk menukar tetapan. */
export interface GameSettings {
  schoolName: string;
  /** Data URL / laluan logo. Kosong = lambang lalai. */
  logoDataUrl: string;
  /** Senarai kelas; jika kosong murid menaip kelas sendiri. */
  classes: string[];
  classroomUrl: string;
  submissionText: string;
  /** Peratus penguasaan minimum untuk membuka sijil (0 = cukup tamatkan semua cabaran). */
  certificateMinMastery: number;
  units: UnitContent[];
}

export const SETTINGS: GameSettings = {
  schoolName: 'SK BUKIT MINYAK',
  logoDataUrl: '',
  classes: [],
  classroomUrl: CLASSROOM_URL,
  submissionText: DEFAULT_SUBMISSION_TEXT,
  certificateMinMastery: 0,
  units: DEFAULT_UNITS,
};

/** Hanya benarkan pautan http(s) untuk pautan Classroom. */
export function safeUrl(url: string, fallback = CLASSROOM_URL): string {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : fallback;
  } catch {
    return fallback;
  }
}
