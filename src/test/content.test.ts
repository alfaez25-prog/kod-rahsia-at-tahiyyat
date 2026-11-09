import { describe, expect, it } from 'vitest';
import { DEFAULT_UNITS } from '../data/tahiyat.ts';
import { buildLafazQuestion, buildMeaningQuestion, checkLafaz, checkMeaning, sameText, tokenize, validateUnits } from '../data/questionBank.ts';

/** Teks rujukan disalin terus daripada spesifikasi guru. */
const SPEC = [
  ['التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ', 'Segala penghormatan, keberkatan, doa dan kebaikan adalah untuk Allah.'],
  ['السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ', 'Salam sejahtera ke atasmu, wahai Nabi.'],
  ['وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ', 'Dan rahmat Allah serta keberkatan-Nya.'],
  ['السَّلَامُ عَلَيْنَا', 'Salam sejahtera ke atas kami.'],
  ['وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ', 'Dan ke atas hamba-hamba Allah yang soleh.'],
  ['أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ', 'Aku bersaksi bahawa tiada Tuhan yang berhak disembah melainkan Allah.'],
  ['وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ', 'Dan aku bersaksi bahawa Nabi Muhammad ialah pesuruh Allah.'],
  ['اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ', 'Ya Allah, limpahkanlah selawat ke atas penghulu kami Nabi Muhammad.'],
] as const;

const SEED = 'ujian-sesi';

describe('Data bacaan wajib', () => {
  it('mengandungi tepat 8 unit bernombor 1–8', () => {
    expect(DEFAULT_UNITS.map((u) => u.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it.each(SPEC.map((s, i) => [i + 1, ...s]))('Unit %i: lafaz & maksud sepadan tepat dengan spesifikasi', (id, ar, ms) => {
    const u = DEFAULT_UNITS[Number(id) - 1];
    expect(u.arabic).toBe(ar);
    expect(u.meaning).toBe(ms);
  });
  it('mengekalkan harakat (setiap perkataan mempunyai baris)', () => {
    for (const u of DEFAULT_UNITS) for (const w of tokenize(u.arabic)) expect(w).toMatch(/[ً-ْ]/u);
  });
  it('membezakan tasyahhud (Unit 1–7) daripada tambahan selawat (Unit 8)', () => {
    expect(DEFAULT_UNITS.slice(0, 7).every((u) => u.category === 'tasyahhud')).toBe(true);
    expect(DEFAULT_UNITS[7].category).toBe('selawat');
  });
  it('bank soalan lalai lulus validasi', () => {
    expect(validateUnits(DEFAULT_UNITS)).toEqual([]);
  });
});

describe('Cabaran 1 — soalan lafaz', () => {
  it.each(DEFAULT_UNITS.map((u) => [u.id, u]))('Unit %i mempunyai soalan lafaz dengan 4 pilihan & satu jawapan tepat', (_id, u) => {
    const q = buildLafazQuestion(u, SEED);
    expect(q.blanks.length).toBeGreaterThanOrEqual(1);
    const words = tokenize(u.arabic);
    for (const b of q.blanks) {
      expect(b.options).toHaveLength(4);
      expect(new Set(b.options.map((o) => o.id)).size).toBe(4);
      const correct = b.options.filter((o) => o.id === b.correctId);
      expect(correct).toHaveLength(1);
      // jawapan tepat = perkataan sebenar dalam lafaz
      expect(correct[0].text).toBe(b.tokens.map((t) => words[t]).join(' '));
      // distraktor tidak menduplikasi jawapan betul atau satu sama lain
      const others = b.options.filter((o) => o.id !== b.correctId);
      for (const o of others) expect(sameText(o.text, correct[0].text)).toBe(false);
      expect(new Set(b.options.map((o) => o.text.normalize('NFC'))).size).toBe(4);
      // semua pilihan Arab berbaris
      for (const o of b.options) expect(o.text).toMatch(/[ً-ْ]/u);
    }
  });
  it('unit panjang menggunakan beberapa ruang; unit pendek (Unit 4) menggunakan pilihan lafaz penuh', () => {
    expect(buildLafazQuestion(DEFAULT_UNITS[0], SEED).blanks.length).toBeGreaterThan(1);
    const u4 = buildLafazQuestion(DEFAULT_UNITS[3], SEED);
    expect(u4.blanks).toHaveLength(1);
    expect(u4.blanks[0].tokens).toEqual([0, 1]);
  });
  it('menyemak berdasarkan ID, bukan teks', () => {
    const q = buildLafazQuestion(DEFAULT_UNITS[0], SEED);
    const right = Object.fromEntries(q.blanks.map((b) => [b.id, b.correctId]));
    expect(checkLafaz(q, right)).toEqual([]);
    const wrong = { ...right, [q.blanks[1].id]: q.blanks[1].options.find((o) => o.id !== q.blanks[1].correctId)!.id };
    expect(checkLafaz(q, wrong)).toEqual([1]);
    // memasukkan TEKS jawapan (bukan ID) tidak diterima
    const textAnswer = { ...right, [q.blanks[0].id]: q.blanks[0].options.find((o) => o.id === q.blanks[0].correctId)!.text };
    expect(checkLafaz(q, textAnswer)).toEqual([0]);
  });
  it('ID pilihan tidak mendedahkan jawapan', () => {
    const q = buildLafazQuestion(DEFAULT_UNITS[1], SEED);
    for (const b of q.blanks) for (const o of b.options) expect(o.id).not.toMatch(/correct|betul|true/i);
  });
  it('susunan pilihan stabil bagi sesi yang sama', () => {
    const a = buildLafazQuestion(DEFAULT_UNITS[5], SEED).blanks[0].options.map((o) => o.text);
    const b = buildLafazQuestion(DEFAULT_UNITS[5], SEED).blanks[0].options.map((o) => o.text);
    expect(a).toEqual(b);
  });
});

describe('Cabaran 2 — soalan maksud', () => {
  it.each(DEFAULT_UNITS.map((u) => [u.id, u]))('Unit %i mempunyai 4 pilihan maksud & satu jawapan tepat dari data', (_id, u) => {
    const q = buildMeaningQuestion(u, SEED);
    expect(q.options).toHaveLength(4);
    const correct = q.options.filter((o) => o.id === q.correctId);
    expect(correct).toHaveLength(1);
    expect(correct[0].text).toBe(u.meaning);
    expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
    expect(checkMeaning(q, q.correctId)).toBe(true);
    for (const o of q.options.filter((x) => x.id !== q.correctId)) {
      expect(checkMeaning(q, o.id)).toBe(false);
      expect(sameText(o.text, u.meaning)).toBe(false);
    }
    expect(q.explanation.length).toBeGreaterThan(20);
  });
});

describe('Validasi bank soalan', () => {
  it('menolak distraktor yang sama dengan jawapan betul', () => {
    const units = structuredClone(DEFAULT_UNITS);
    units[0].lafaz.blanks[0].distractors[0] = 'الْمُبَارَكَاتُ';
    units[2].meaningQ.distractors[1] = units[2].meaning;
    const errs = validateUnits(units);
    expect(errs.some((e) => e.includes('Unit 1') && e.includes('sama dengan jawapan'))).toBe(true);
    expect(errs.some((e) => e.includes('Unit 3 maksud'))).toBe(true);
  });
  it('menolak bank tanpa 8 unit', () => {
    expect(validateUnits(DEFAULT_UNITS.slice(0, 7)).length).toBeGreaterThan(0);
  });
  it('menolak indeks perkataan di luar julat', () => {
    const units = structuredClone(DEFAULT_UNITS);
    units[3].lafaz.blanks[0].tokens = [5];
    expect(validateUnits(units).some((e) => e.includes('di luar julat'))).toBe(true);
  });
});
