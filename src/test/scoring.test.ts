import { describe, expect, it } from 'vitest';
import {
  badges, emptyOrder, emptyUnit, gameComplete, isOrderCorrect, lafazPoints, mastery, MAX_SCORE, meaningPoints,
  orderCorrectCount, orderPoints, totalScore, type ScoreInput,
} from '../lib/scoring.ts';
import { initialArrangement } from '../screens/OrderScreen.tsx';

function perfect(): ScoreInput {
  const units: ScoreInput['units'] = {};
  for (let i = 1; i <= 8; i++) units[i] = { lafaz: { attempts: 1, done: true, points: 50 }, meaning: { attempts: 1, done: true, points: 50 } };
  return { units, order: { attempts: 1, done: true, points: 200, hintsUsed: 0 } };
}

describe('Sistem markah', () => {
  it('markah maksimum ialah 1000', () => {
    expect(MAX_SCORE).toBe(1000);
    expect(totalScore(perfect())).toBe(1000);
  });
  it('percubaan pertama memberi 50 mata; percubaan semula dikurangkan', () => {
    expect(lafazPoints(1)).toBe(50);
    expect(lafazPoints(2)).toBe(25);
    expect(lafazPoints(3)).toBe(10);
    expect(lafazPoints(4)).toBe(0);
    expect(lafazPoints(9)).toBe(0);
    expect(meaningPoints(1)).toBe(50);
    expect(meaningPoints(2)).toBeLessThan(50);
  });
  it('cabaran susunan: 200 percubaan pertama, berkurang dengan percubaan & petunjuk', () => {
    expect(orderPoints(1, 0)).toBe(200);
    expect(orderPoints(2, 0)).toBe(150);
    expect(orderPoints(2, 2)).toBe(100);
    expect(orderPoints(5, 0)).toBe(50);
    expect(orderPoints(4, 10)).toBe(25);
  });
  it('tidak memberi markah penuh selepas beberapa percubaan', () => {
    const p = perfect();
    p.units[3].lafaz = { attempts: 3, done: true, points: lafazPoints(3) };
    p.order = { attempts: 2, done: true, points: orderPoints(2, 1), hintsUsed: 1 };
    expect(totalScore(p)).toBeLessThan(1000);
    expect(totalScore(p)).toBe(1000 - 40 - 75);
  });
  it('peratus penguasaan dikira daripada ketepatan percubaan pertama (17 item), berasingan daripada XP', () => {
    expect(mastery(perfect()).percent).toBe(100);
    const p = perfect();
    p.units[1].lafaz.attempts = 2;
    p.units[2].meaning.attempts = 3;
    p.order.hintsUsed = 1; // susunan dengan petunjuk tidak dikira percubaan pertama
    const m = mastery(p);
    expect(m.correctItems).toBe(14);
    expect(m.percent).toBe(Math.round((14 / 17) * 100));
    expect(m.lafazPercent).toBe(Math.round((7 / 8) * 100));
    expect(m.meaningPercent).toBe(Math.round((7 / 8) * 100));
  });
  it('kemajuan kosong: 0 markah, 0% dan belum tamat', () => {
    const units: ScoreInput['units'] = {};
    for (let i = 1; i <= 8; i++) units[i] = emptyUnit();
    const p = { units, order: emptyOrder() };
    expect(totalScore(p)).toBe(0);
    expect(mastery(p).percent).toBe(0);
    expect(gameComplete(p)).toBe(false);
  });
  it('lencana', () => {
    const b = badges(perfect());
    expect(b.every((x) => x.earned)).toBe(true);
  });
});

describe('Cabaran susunan akhir', () => {
  it('mengenal pasti susunan betul dan salah', () => {
    expect(isOrderCorrect([1, 2, 3, 4, 5, 6, 7, 8])).toBe(true);
    expect(isOrderCorrect([2, 1, 3, 4, 5, 6, 7, 8])).toBe(false);
    expect(orderCorrectCount([2, 1, 3, 4, 5, 6, 7, 8])).toBe(6);
    expect(isOrderCorrect([1, 2, 3])).toBe(false);
  });
  it('susunan awal rawak bukan jawapan & tidak mendedahkan urutan', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const a = initialArrangement(seed);
      expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(isOrderCorrect(a)).toBe(false);
      expect(orderCorrectCount(a)).toBeLessThanOrEqual(2);
    }
  });
});
