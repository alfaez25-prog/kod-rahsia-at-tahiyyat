// Jenis data teras permainan. Fail ini hanya mengandungi jenis (tiada logik).

export type UnitCategory = 'tasyahhud' | 'selawat';

/** Satu ruang kosong dalam cabaran lafaz. `tokens` ialah indeks perkataan (berturutan) yang disembunyikan. */
export interface BlankSpec {
  tokens: number[];
  /** Tepat 3 distraktor Arab berbaris. */
  distractors: string[];
  /** Petunjuk yang dipaparkan selepas percubaan salah. */
  hint: string;
}

export interface MeaningSpec {
  /** Tepat 3 distraktor maksud Bahasa Melayu. */
  distractors: string[];
  hint: string;
}

export interface UnitContent {
  id: number;
  /** Tajuk pendek peti, cth. "Peti Penghormatan". */
  title: string;
  category: UnitCategory;
  arabic: string;
  meaning: string;
  /** Penerangan selepas murid menjawab maksud. */
  explanation: string;
  lafaz: { blanks: BlankSpec[] };
  meaningQ: MeaningSpec;
  /** Rakaman bacaan; hanya dimainkan jika `audioVerified` = true (rakaman disahkan guru). */
  audioUrl: string;
  audioVerified: boolean;
}

export interface Option {
  id: string;
  text: string;
}

export interface BlankQuestion {
  id: string;
  tokens: number[];
  options: Option[];
  correctId: string;
  hint: string;
}

export interface LafazQuestion {
  unitId: number;
  words: string[];
  blanks: BlankQuestion[];
}

export interface MeaningQuestion {
  unitId: number;
  arabic: string;
  options: Option[];
  correctId: string;
  hint: string;
  explanation: string;
}
