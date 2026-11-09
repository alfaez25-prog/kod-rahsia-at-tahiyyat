import { DEFAULT_UNITS } from '../data/tahiyat.ts';
import type { UnitContent } from '../data/types.ts';
import { validateUnits } from '../data/questionBank.ts';

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

export interface TeacherSettings {
  version: 1;
  schoolName: string;
  /** Data URL logo (dikecilkan). Kosong = lambang lalai. */
  logoDataUrl: string;
  /** Senarai kelas; jika kosong murid menaip kelas sendiri. */
  classes: string[];
  classroomUrl: string;
  submissionText: string;
  /** Peratus penguasaan minimum untuk membuka sijil (0 = cukup tamatkan semua cabaran). */
  certificateMinMastery: number;
  teacherPin: string;
  units: UnitContent[];
}

export const DEFAULT_SETTINGS: TeacherSettings = {
  version: 1,
  schoolName: 'SK BUKIT MINYAK',
  logoDataUrl: '',
  classes: [],
  classroomUrl: CLASSROOM_URL,
  submissionText: DEFAULT_SUBMISSION_TEXT,
  certificateMinMastery: 0,
  teacherPin: '1234',
  units: DEFAULT_UNITS,
};

export const cloneDefaults = (): TeacherSettings => structuredClone(DEFAULT_SETTINGS);

/** Hanya benarkan pautan http(s) untuk pautan Classroom. */
export function safeUrl(url: string, fallback = CLASSROOM_URL): string {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : fallback;
  } catch {
    return fallback;
  }
}

export interface ParseResult {
  ok: boolean;
  settings?: TeacherSettings;
  errors: string[];
}

/** Gabungkan objek mentah (cth. dari JSON import) dengan nilai lalai dan validasi. */
export function parseSettings(raw: unknown): ParseResult {
  if (!raw || typeof raw !== 'object') return { ok: false, errors: ['Fail bukan objek JSON tetapan yang sah.'] };
  const r = raw as Partial<TeacherSettings>;
  const d = cloneDefaults();
  const s: TeacherSettings = {
    version: 1,
    schoolName: typeof r.schoolName === 'string' && r.schoolName.trim() ? r.schoolName.trim() : d.schoolName,
    logoDataUrl: typeof r.logoDataUrl === 'string' && r.logoDataUrl.startsWith('data:image/') ? r.logoDataUrl : '',
    classes: Array.isArray(r.classes) ? r.classes.filter((c): c is string => typeof c === 'string' && !!c.trim()).map((c) => c.trim()) : [],
    classroomUrl: typeof r.classroomUrl === 'string' ? safeUrl(r.classroomUrl) : d.classroomUrl,
    submissionText: typeof r.submissionText === 'string' && r.submissionText.trim() ? r.submissionText : d.submissionText,
    certificateMinMastery:
      typeof r.certificateMinMastery === 'number' && r.certificateMinMastery >= 0 && r.certificateMinMastery <= 100
        ? Math.round(r.certificateMinMastery)
        : 0,
    teacherPin: typeof r.teacherPin === 'string' && r.teacherPin.trim() ? r.teacherPin.trim() : d.teacherPin,
    units: Array.isArray(r.units) ? (r.units as UnitContent[]).map(normalizeUnit) : d.units,
  };
  const errors = validateUnits(s.units);
  return errors.length ? { ok: false, errors } : { ok: true, settings: s, errors: [] };
}

function normalizeUnit(u: UnitContent): UnitContent {
  const def = DEFAULT_UNITS.find((d) => d.id === u?.id);
  return {
    id: Number(u?.id),
    title: String(u?.title ?? def?.title ?? ''),
    category: u?.category === 'selawat' ? 'selawat' : 'tasyahhud',
    arabic: String(u?.arabic ?? '').normalize('NFC'),
    meaning: String(u?.meaning ?? ''),
    explanation: String(u?.explanation ?? ''),
    lafaz: {
      blanks: (u?.lafaz?.blanks ?? []).map((b) => ({
        tokens: (b.tokens ?? []).map(Number),
        distractors: (b.distractors ?? []).map((x) => String(x).normalize('NFC')),
        hint: String(b.hint ?? ''),
      })),
    },
    meaningQ: {
      distractors: (u?.meaningQ?.distractors ?? []).map(String),
      hint: String(u?.meaningQ?.hint ?? ''),
    },
    audioUrl: typeof u?.audioUrl === 'string' ? u.audioUrl : '',
    audioVerified: !!u?.audioVerified,
    reviewed: !!u?.reviewed,
  };
}

export function exportSettingsJson(s: TeacherSettings): string {
  return JSON.stringify(s, null, 2);
}
