import type { LafazQuestion, MeaningQuestion, Option, UnitContent } from './types.ts';
import { hashString, seededShuffle } from '../lib/random.ts';

/** Pecahkan lafaz kepada perkataan (token). */
export function tokenize(arabic: string): string[] {
  return arabic.normalize('NFC').trim().split(/\s+/u);
}

/** Bandingan ketat selepas normalisasi Unicode (hanya untuk validasi bank, bukan penyemakan jawapan). */
export function sameText(a: string, b: string): boolean {
  return a.normalize('NFC').trim().replace(/\s+/gu, ' ') === b.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

/** ID pilihan legap: tidak mendedahkan jawapan dalam DOM. */
function optionId(qid: string, idx: number, seed: string): string {
  return `o${hashString(`${seed}|${qid}|${idx}`).toString(36)}${idx}`;
}

function buildOptions(qid: string, correct: string, distractors: string[], seed: string) {
  const raw = [correct, ...distractors];
  const opts: Option[] = raw.map((text, i) => ({ id: optionId(qid, i, seed), text }));
  const correctId = opts[0].id;
  return { options: seededShuffle(opts, `${seed}|${qid}|shuffle`), correctId };
}

export function buildLafazQuestion(unit: UnitContent, seed: string): LafazQuestion {
  const words = tokenize(unit.arabic);
  return {
    unitId: unit.id,
    words,
    blanks: unit.lafaz.blanks.map((b, bi) => {
      const qid = `u${unit.id}-l${bi}`;
      const correct = b.tokens.map((t) => words[t]).join(' ');
      const { options, correctId } = buildOptions(qid, correct, b.distractors, seed);
      return { id: qid, tokens: b.tokens, options, correctId, hint: b.hint };
    }),
  };
}

export function buildMeaningQuestion(unit: UnitContent, seed: string): MeaningQuestion {
  const qid = `u${unit.id}-m`;
  const { options, correctId } = buildOptions(qid, unit.meaning, unit.meaningQ.distractors, seed);
  return {
    unitId: unit.id,
    arabic: unit.arabic,
    options,
    correctId,
    hint: unit.meaningQ.hint,
    explanation: unit.explanation,
  };
}

/** Semak jawapan lafaz berdasarkan ID — pulangkan senarai indeks ruang yang salah. */
export function checkLafaz(q: LafazQuestion, answers: Record<string, string | undefined>): number[] {
  return q.blanks.flatMap((b, i) => (answers[b.id] === b.correctId ? [] : [i]));
}

export function checkMeaning(q: MeaningQuestion, optionIdChosen: string): boolean {
  return optionIdChosen === q.correctId;
}

/** Validasi bank soalan (digunakan oleh ujian, import JSON dan Mod Guru). */
export function validateUnits(units: UnitContent[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(units) || units.length !== 8) {
    errors.push('Bank soalan mesti mengandungi tepat 8 unit.');
    return errors;
  }
  const ids = units.map((u) => u.id).sort((a, b) => a - b);
  if (ids.join(',') !== '1,2,3,4,5,6,7,8') errors.push('ID unit mesti 1 hingga 8.');

  for (const u of units) errors.push(...validateUnit(u));
  return errors;
}

/** Validasi satu unit. */
export function validateUnit(u: UnitContent): string[] {
  const errors: string[] = [];
  {
    const tag = `Unit ${u.id}`;
    if (!u.arabic?.trim()) errors.push(`${tag}: lafaz Arab kosong.`);
    if (!u.meaning?.trim()) errors.push(`${tag}: maksud kosong.`);
    const words = tokenize(u.arabic ?? '');
    const used = new Set<number>();
    if (!u.lafaz?.blanks?.length) errors.push(`${tag}: tiada ruang kosong lafaz.`);
    u.lafaz?.blanks?.forEach((b, bi) => {
      const btag = `${tag} ruang ${bi + 1}`;
      if (!b.tokens.length) errors.push(`${btag}: tiada perkataan dipilih.`);
      b.tokens.forEach((t, k) => {
        if (!Number.isInteger(t) || t < 0 || t >= words.length) errors.push(`${btag}: indeks perkataan ${t} di luar julat.`);
        if (k > 0 && t !== b.tokens[k - 1] + 1) errors.push(`${btag}: perkataan mesti berturutan.`);
        if (used.has(t)) errors.push(`${btag}: perkataan bertindih dengan ruang lain.`);
        used.add(t);
      });
      const correct = b.tokens.map((t) => words[t]).join(' ');
      checkDistractors(btag, correct, b.distractors, errors);
    });
    checkDistractors(`${tag} maksud`, u.meaning ?? '', u.meaningQ?.distractors ?? [], errors);
  }
  return errors;
}

function checkDistractors(tag: string, correct: string, ds: string[], errors: string[]) {
  if (ds.length !== 3) errors.push(`${tag}: mesti ada tepat 3 distraktor.`);
  ds.forEach((d, i) => {
    if (!d?.trim()) errors.push(`${tag}: distraktor ${i + 1} kosong.`);
    else if (sameText(d, correct)) errors.push(`${tag}: distraktor ${i + 1} sama dengan jawapan betul.`);
  });
  const set = new Set(ds.map((d) => d?.normalize('NFC').trim()));
  if (set.size !== ds.length) errors.push(`${tag}: distraktor berulang.`);
}
