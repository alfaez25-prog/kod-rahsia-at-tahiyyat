/**
 * SISTEM MARKAH (XP)
 *
 * Lafaz  : 50 mata (percubaan 1) → 25 (percubaan 2) → 10 (percubaan 3) → 0 (percubaan 4+)
 * Maksud : 50 mata (percubaan 1) → 25 (percubaan 2) → 10 (percubaan 3) → 0 (percubaan 4+)
 * Susunan: 200 (percubaan 1) → 150 → 100 → 50 (percubaan 4+), tolak 25 bagi setiap petunjuk
 *          (minimum 25 mata selepas cabaran diselesaikan).
 * Maksimum: 8×50 + 8×50 + 200 = 1000.
 *
 * PERATUS PENGUASAAN (berasingan daripada XP): bilangan item yang betul pada percubaan pertama
 * (8 lafaz + 8 maksud + 1 susunan tanpa petunjuk = 17 item) dibahagi 17.
 */

export const LAFAZ_POINTS = [50, 25, 10, 0] as const;
export const MEANING_POINTS = [50, 25, 10, 0] as const;
export const ORDER_POINTS = [200, 150, 100, 50] as const;
export const ORDER_HINT_PENALTY = 25;
export const ORDER_MIN_POINTS = 25;
export const UNIT_COUNT = 8;
export const MAX_SCORE = UNIT_COUNT * LAFAZ_POINTS[0] + UNIT_COUNT * MEANING_POINTS[0] + ORDER_POINTS[0];
export const MASTERY_ITEMS = UNIT_COUNT * 2 + 1;

function byAttempt(table: readonly number[], attemptNumber: number): number {
  if (attemptNumber < 1) return 0;
  return table[Math.min(attemptNumber, table.length) - 1];
}

/** Mata untuk jawapan lafaz yang betul pada percubaan ke-n (bermula 1). */
export const lafazPoints = (attemptNumber: number) => byAttempt(LAFAZ_POINTS, attemptNumber);
export const meaningPoints = (attemptNumber: number) => byAttempt(MEANING_POINTS, attemptNumber);
export function orderPoints(attemptNumber: number, hintsUsed: number): number {
  const base = byAttempt(ORDER_POINTS, attemptNumber);
  if (base === 0) return 0;
  return Math.max(ORDER_MIN_POINTS, base - hintsUsed * ORDER_HINT_PENALTY);
}

export interface StepRecord {
  attempts: number;
  done: boolean;
  points: number;
}

export interface UnitRecord {
  lafaz: StepRecord;
  meaning: StepRecord;
}

export interface OrderRecord extends StepRecord {
  hintsUsed: number;
}

export interface ScoreInput {
  units: Record<number, UnitRecord>;
  order: OrderRecord;
}

export const emptyStep = (): StepRecord => ({ attempts: 0, done: false, points: 0 });
export const emptyUnit = (): UnitRecord => ({ lafaz: emptyStep(), meaning: emptyStep() });
export const emptyOrder = (): OrderRecord => ({ ...emptyStep(), hintsUsed: 0 });

export const firstTry = (s: StepRecord) => s.done && s.attempts === 1;

export function totalScore(p: ScoreInput): number {
  let sum = 0;
  for (let id = 1; id <= UNIT_COUNT; id++) {
    const u = p.units[id];
    if (!u) continue;
    sum += u.lafaz.points + u.meaning.points;
  }
  sum += p.order.points;
  return Math.min(sum, MAX_SCORE);
}

export interface MasteryBreakdown {
  lafazFirst: number;
  meaningFirst: number;
  orderFirst: boolean;
  correctItems: number;
  percent: number;
  lafazPercent: number;
  meaningPercent: number;
}

export function mastery(p: ScoreInput): MasteryBreakdown {
  let lafazFirst = 0;
  let meaningFirst = 0;
  for (let id = 1; id <= UNIT_COUNT; id++) {
    const u = p.units[id];
    if (!u) continue;
    if (firstTry(u.lafaz)) lafazFirst++;
    if (firstTry(u.meaning)) meaningFirst++;
  }
  const orderFirst = firstTry(p.order) && p.order.hintsUsed === 0;
  const correctItems = lafazFirst + meaningFirst + (orderFirst ? 1 : 0);
  return {
    lafazFirst,
    meaningFirst,
    orderFirst,
    correctItems,
    percent: Math.round((correctItems / MASTERY_ITEMS) * 100),
    lafazPercent: Math.round((lafazFirst / UNIT_COUNT) * 100),
    meaningPercent: Math.round((meaningFirst / UNIT_COUNT) * 100),
  };
}

export function allUnitsDone(p: ScoreInput): boolean {
  for (let id = 1; id <= UNIT_COUNT; id++) {
    const u = p.units[id];
    if (!u || !u.lafaz.done || !u.meaning.done) return false;
  }
  return true;
}

export function gameComplete(p: ScoreInput): boolean {
  return allUnitsDone(p) && p.order.done;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export function badges(p: ScoreInput): Badge[] {
  const m = mastery(p);
  const complete = gameComplete(p);
  return [
    { id: 'gigih', name: 'Penjelajah Gigih', description: 'Menamatkan semua cabaran.', earned: complete },
    { id: 'lafaz', name: 'Penjaga Lafaz', description: 'Semua lafaz betul pada percubaan pertama.', earned: m.lafazFirst === UNIT_COUNT },
    { id: 'makna', name: 'Pentafsir Makna', description: 'Semua maksud betul pada percubaan pertama.', earned: m.meaningFirst === UNIT_COUNT },
    { id: 'susun', name: 'Penyusun Manuskrip', description: 'Susunan betul pada percubaan pertama tanpa petunjuk.', earned: m.orderFirst },
    { id: 'pakar', name: 'Pakar Tahiyat Awal', description: 'Penguasaan 80% ke atas.', earned: complete && m.percent >= 80 },
  ];
}

/** Lencana utama untuk sijil. */
export function headlineBadge(p: ScoreInput): Badge {
  const list = badges(p).filter((b) => b.earned);
  return list[list.length - 1] ?? badges(p)[0];
}

/** Semak susunan: pulangkan bilangan kad yang berada di kedudukan betul. */
export function orderCorrectCount(order: number[]): number {
  return order.reduce((n, id, i) => n + (id === i + 1 ? 1 : 0), 0);
}

export function isOrderCorrect(order: number[]): boolean {
  return order.length === UNIT_COUNT && orderCorrectCount(order) === UNIT_COUNT;
}
