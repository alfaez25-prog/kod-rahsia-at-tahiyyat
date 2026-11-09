import { emptyOrder, emptyUnit, UNIT_COUNT, type OrderRecord, type UnitRecord } from './scoring.ts';
import { randomId } from './random.ts';

/**
 * PENYIMPANAN SETEMPAT (localStorage sahaja — tiada data dihantar ke pelayan luar).
 * - krat:session        → murid aktif semasa (nama, kelas, avatar, sessionId)
 * - krat:progress:<sid> → kemajuan bagi SATU sesi sahaja (tidak bercampur antara murid)
 */

export const KEYS = {
  session: 'krat:session',
  progress: (sid: string) => `krat:progress:${sid}`,
  muted: 'krat:muted',
} as const;

export interface Student {
  name: string;
  className: string;
  avatar: number;
}

export interface Session extends Student {
  sessionId: string;
  studentKey: string;
  startedAt: string;
}

export interface Progress {
  version: 1;
  sessionId: string;
  studentKey: string;
  tutorialSeen: boolean;
  units: Record<number, UnitRecord>;
  order: OrderRecord & { arrangement: number[] };
  completedAt: string | null;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* abaikan */
  }
}
function readJson<T>(key: string): T | null {
  const raw = safeGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Normalisasi nama + kelas menjadi kunci murid yang konsisten. */
export function studentKey(name: string, className: string): string {
  const n = (s: string) => s.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleUpperCase('ms-MY');
  return `${n(name)}|${n(className)}`;
}

export function cleanName(s: string): string {
  return s.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

export interface RegistrationErrors {
  name?: string;
  className?: string;
}

export const NAME_MAX = 80;

export function validateRegistration(name: string, className: string): RegistrationErrors {
  const e: RegistrationErrors = {};
  const n = cleanName(name);
  if (!n) e.name = 'Sila tulis nama penuh anda dahulu ya.';
  else if (n.length < 3) e.name = 'Nama terlalu pendek — tulis nama penuh anda.';
  else if (n.length > NAME_MAX) e.name = `Nama terlalu panjang (maksimum ${NAME_MAX} aksara).`;
  if (!cleanName(className)) e.className = 'Sila pilih atau tulis kelas anda.';
  return e;
}

export const isRegistrationValid = (name: string, className: string) =>
  Object.keys(validateRegistration(name, className)).length === 0;

export function newProgress(sessionId: string, key: string): Progress {
  const units: Record<number, UnitRecord> = {};
  for (let i = 1; i <= UNIT_COUNT; i++) units[i] = emptyUnit();
  return {
    version: 1,
    sessionId,
    studentKey: key,
    tutorialSeen: false,
    units,
    order: { ...emptyOrder(), arrangement: [] },
    completedAt: null,
  };
}

/** Mulakan sesi baharu (dipanggil setiap kali murid mendaftar / menukar nama). */
export function startSession(student: Student, now = new Date()): { session: Session; progress: Progress } {
  const prev = loadSession();
  if (prev) safeRemove(KEYS.progress(prev.sessionId));
  const name = cleanName(student.name);
  const className = cleanName(student.className);
  const session: Session = {
    name,
    className,
    avatar: student.avatar,
    sessionId: randomId(),
    studentKey: studentKey(name, className),
    startedAt: now.toISOString(),
  };
  const progress = newProgress(session.sessionId, session.studentKey);
  safeSet(KEYS.session, JSON.stringify(session));
  saveProgress(progress);
  return { session, progress };
}

export function loadSession(): Session | null {
  const s = readJson<Session>(KEYS.session);
  if (!s || typeof s.sessionId !== 'string' || typeof s.name !== 'string') return null;
  return s;
}

/** Muat kemajuan HANYA jika ia milik sesi & murid yang sama. */
export function loadProgress(session: Session): Progress {
  const p = readJson<Progress>(KEYS.progress(session.sessionId));
  if (!p || p.sessionId !== session.sessionId || p.studentKey !== session.studentKey) {
    const fresh = newProgress(session.sessionId, session.studentKey);
    saveProgress(fresh);
    return fresh;
  }
  for (let i = 1; i <= UNIT_COUNT; i++) if (!p.units[i]) p.units[i] = emptyUnit();
  return p;
}

export function saveProgress(p: Progress): boolean {
  return safeSet(KEYS.progress(p.sessionId), JSON.stringify(p));
}

export function endSession() {
  const s = loadSession();
  if (s) safeRemove(KEYS.progress(s.sessionId));
  safeRemove(KEYS.session);
}

export const loadMuted = () => safeGet(KEYS.muted) === '1';
export const saveMuted = (m: boolean) => safeSet(KEYS.muted, m ? '1' : '0');
