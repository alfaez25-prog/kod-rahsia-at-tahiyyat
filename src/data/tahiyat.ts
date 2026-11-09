import type { UnitContent } from './types.ts';

/**
 * DATA BACAAN TAHIYAT AWAL (lalai).
 * Lafaz Arab dan maksud disalin tepat daripada spesifikasi guru.
 * Pembahagian 8 unit ini ialah pembahagian PEDAGOGI, bukan penetapan bilangan baris dalam ibadah.
 * Unit 1–7: lafaz tasyahhud. Unit 8: tambahan selawat ke atas Nabi ﷺ yang diajarkan
 * mengikut panduan pengajaran mazhab Syafi‘i (bukan sebahagian lafaz tasyahhud itu sendiri).
 * Untuk menukar kandungan, sunting fail ini dan bina semula (npm run build).
 */
export const DEFAULT_UNITS: UnitContent[] = [
  {
    id: 1,
    title: 'Peti Penghormatan',
    category: 'tasyahhud',
    arabic: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ',
    meaning: 'Segala penghormatan, keberkatan, doa dan kebaikan adalah untuk Allah.',
    explanation:
      'Bacaan tahiyat dimulakan dengan memuji Allah. Semua penghormatan (التَّحِيَّاتُ), keberkatan (الْمُبَارَكَاتُ), doa (الصَّلَوَاتُ) dan kebaikan (الطَّيِّبَاتُ) hanya layak untuk Allah (لِلَّهِ).',
    lafaz: {
      blanks: [
        {
          tokens: [1],
          distractors: ['الْبَرَكَاتُ', 'الْمُبَارَكَةُ', 'الصَّالِحَاتُ'],
          hint: 'Perkataan ini bermaksud "keberkatan" dan berakhir dengan ـَاتُ, sama seperti التَّحِيَّاتُ.',
        },
        {
          tokens: [3],
          distractors: ['الطَّيِّبَةُ', 'الطَّاهِرَاتُ', 'الْحَسَنَاتُ'],
          hint: 'Perkataan ini bermaksud "kebaikan" dan bermula dengan الطَّـ.',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Segala puji dan syukur adalah untuk Allah, Tuhan sekalian alam.',
        'Segala penghormatan, keberkatan, doa dan kebaikan adalah untuk Nabi Muhammad.',
        'Salam sejahtera, rahmat dan keberkatan untuk hamba-hamba Allah.',
      ],
      hint: 'Lihat perkataan terakhir لِلَّهِ — semuanya ditujukan kepada siapa?',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 2,
    title: 'Peti Salam kepada Nabi',
    category: 'tasyahhud',
    arabic: 'السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ',
    meaning: 'Salam sejahtera ke atasmu, wahai Nabi.',
    explanation:
      'Kita mengucapkan salam kepada Nabi Muhammad ﷺ. عَلَيْكَ bermaksud "ke atasmu" dan أَيُّهَا النَّبِيُّ bermaksud "wahai Nabi".',
    lafaz: {
      blanks: [
        {
          tokens: [1],
          distractors: ['عَلَيْنَا', 'عَلَيْهِ', 'عَلَيْكُمْ'],
          hint: 'Salam ini ditujukan terus kepada seorang sahaja, iaitu "ke atasmu".',
        },
        {
          tokens: [3],
          distractors: ['الرَّسُولُ', 'الصَّالِحُ', 'الْكَرِيمُ'],
          hint: 'Perkataan ini bermaksud "Nabi".',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Salam sejahtera ke atas kami.',
        'Salam sejahtera ke atas hamba-hamba Allah yang soleh.',
        'Wahai Nabi, berilah kami salam sejahtera.',
      ],
      hint: 'عَلَيْكَ bermaksud "ke atasmu" — salam ini untuk siapa?',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 3,
    title: 'Peti Rahmat',
    category: 'tasyahhud',
    arabic: 'وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
    meaning: 'Dan rahmat Allah serta keberkatan-Nya.',
    explanation:
      'Selepas salam, kita mendoakan rahmat Allah (رَحْمَةُ اللَّهِ) dan keberkatan-Nya (بَرَكَاتُهُ) ke atas Nabi ﷺ.',
    lafaz: {
      blanks: [
        {
          tokens: [2],
          distractors: ['وَمَغْفِرَتُهُ', 'وَبَرَكَاتُنَا', 'وَنِعْمَتُهُ'],
          hint: 'Perkataan ini bermaksud "dan keberkatan-Nya" — ـهُ di hujung bermaksud "-Nya".',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Dan keampunan Allah serta nikmat-Nya.',
        'Dan keberkatan Allah ke atas hamba-hamba-Nya.',
        'Dan rahmat Nabi serta keberkatannya.',
      ],
      hint: 'رَحْمَةُ = rahmat, بَرَكَاتُهُ = keberkatan-Nya. Rahmat itu milik siapa?',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 4,
    title: 'Peti Salam untuk Kami',
    category: 'tasyahhud',
    arabic: 'السَّلَامُ عَلَيْنَا',
    meaning: 'Salam sejahtera ke atas kami.',
    explanation:
      'Kini salam ditujukan kepada diri kita sendiri. عَلَيْنَا bermaksud "ke atas kami". Bezakan dengan عَلَيْكَ (ke atasmu) dalam Unit 2.',
    lafaz: {
      blanks: [
        {
          tokens: [0, 1],
          distractors: ['السَّلَامُ عَلَيْكَ', 'السَّلَامُ عَلَيْكُمْ', 'السَّلَامُ عَلَيْهِمْ'],
          hint: 'Salam ini untuk "kami" — cari perkataan yang berakhir dengan ـنَا.',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Salam sejahtera ke atasmu, wahai Nabi.',
        'Salam sejahtera ke atas kamu semua.',
        'Rahmat Allah ke atas kami.',
      ],
      hint: 'ـنَا dalam عَلَيْنَا bermaksud "kami".',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 5,
    title: 'Peti Hamba yang Soleh',
    category: 'tasyahhud',
    arabic: 'وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ',
    meaning: 'Dan ke atas hamba-hamba Allah yang soleh.',
    explanation:
      'Salam juga ditujukan kepada semua hamba Allah yang soleh. عِبَادِ bermaksud "hamba-hamba" dan الصَّالِحِينَ bermaksud "yang soleh".',
    lafaz: {
      blanks: [
        {
          tokens: [1],
          distractors: ['عَبْدِ', 'رَسُولِ', 'أَوْلِيَاءِ'],
          hint: 'Perkataan ini bermaksud "hamba-hamba" (ramai).',
        },
        {
          tokens: [3],
          distractors: ['الصَّالِحَاتِ', 'الْمُؤْمِنِينَ', 'الطَّيِّبِينَ'],
          hint: 'Perkataan ini bermaksud "yang soleh" dan berakhir dengan ـِينَ.',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Dan ke atas Nabi Muhammad, pesuruh Allah.',
        'Dan ke atas kami, hamba Allah yang beriman.',
        'Dan ke atas para malaikat Allah yang mulia.',
      ],
      hint: 'عِبَادِ اللَّهِ = hamba-hamba Allah. Apakah sifat mereka?',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 6,
    title: 'Peti Kesaksian Keesaan',
    category: 'tasyahhud',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ',
    meaning: 'Aku bersaksi bahawa tiada Tuhan yang berhak disembah melainkan Allah.',
    explanation:
      'Ini ialah kalimah syahadah tauhid. أَشْهَدُ = aku bersaksi, لَا إِلَهَ = tiada Tuhan, إِلَّا اللَّهُ = melainkan Allah.',
    lafaz: {
      blanks: [
        {
          tokens: [0],
          distractors: ['نَشْهَدُ', 'يَشْهَدُ', 'شَهِدْتُ'],
          hint: 'Perkataan ini bermaksud "aku bersaksi" dan bermula dengan أَ.',
        },
        {
          tokens: [4],
          distractors: ['إِلَى', 'إِنَّ', 'عَلَى'],
          hint: 'Perkataan ini bermaksud "melainkan".',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Aku bersaksi bahawa Nabi Muhammad ialah pesuruh Allah.',
        'Aku beriman bahawa Allah Maha Pengasih lagi Maha Penyayang.',
        'Aku memohon ampun kepada Allah yang Maha Pengampun.',
      ],
      hint: 'لَا إِلَهَ إِلَّا اللَّهُ ialah pengakuan tentang keesaan Allah.',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 7,
    title: 'Peti Kesaksian Kerasulan',
    category: 'tasyahhud',
    arabic: 'وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    meaning: 'Dan aku bersaksi bahawa Nabi Muhammad ialah pesuruh Allah.',
    explanation:
      'Ini ialah syahadah kerasulan. رَسُولُ اللَّهِ bermaksud "pesuruh Allah". Bezakan dengan Unit 6 yang menyatakan keesaan Allah.',
    lafaz: {
      blanks: [
        {
          tokens: [2],
          distractors: ['مُحَمَّدٌ', 'مُحَمَّدٍ', 'أَحْمَدَ'],
          hint: 'Nama Nabi di sini berbaris dua di atas (ـًا) kerana selepas أَنَّ.',
        },
        {
          tokens: [3],
          distractors: ['عَبْدُ', 'نَبِيُّ', 'رُسُلُ'],
          hint: 'Perkataan ini bermaksud "pesuruh" (seorang).',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Aku bersaksi bahawa tiada Tuhan yang berhak disembah melainkan Allah.',
        'Dan aku bersaksi bahawa Nabi Muhammad ialah hamba Allah yang soleh.',
        'Dan aku beriman bahawa Nabi Muhammad ialah penghulu kami.',
      ],
      hint: 'رَسُولُ اللَّهِ = pesuruh Allah.',
    },
    audioUrl: '',
    audioVerified: false,
  },
  {
    id: 8,
    title: 'Peti Selawat',
    category: 'selawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ',
    meaning: 'Ya Allah, limpahkanlah selawat ke atas penghulu kami Nabi Muhammad.',
    explanation:
      'Unit ini ialah selawat ke atas Nabi ﷺ yang dibaca selepas tasyahhud dalam tahiyat awal, mengikut panduan pengajaran mazhab Syafi‘i. Ia bukan sebahagian daripada lafaz tasyahhud itu sendiri. صَلِّ = limpahkanlah selawat, سَيِّدِنَا = penghulu kami.',
    lafaz: {
      blanks: [
        {
          tokens: [1],
          distractors: ['سَلِّمْ', 'بَارِكْ', 'صَلَّى'],
          hint: 'Perkataan ini bermaksud "limpahkanlah selawat" — satu permintaan kepada Allah.',
        },
        {
          tokens: [3],
          distractors: ['نَبِيِّنَا', 'حَبِيبِنَا', 'سَيِّدِي'],
          hint: 'Perkataan ini bermaksud "penghulu kami" — berakhir dengan ـنَا.',
        },
      ],
    },
    meaningQ: {
      distractors: [
        'Ya Allah, limpahkanlah rahmat ke atas kami dan keluarga kami.',
        'Ya Allah, berilah keberkatan kepada hamba-hamba-Mu yang soleh.',
        'Salam sejahtera ke atasmu, wahai Nabi Muhammad.',
      ],
      hint: 'اللَّهُمَّ = Ya Allah, صَلِّ = limpahkanlah selawat.',
    },
    audioUrl: '',
    audioVerified: false,
  },
];

export const CATEGORY_LABEL: Record<UnitContent['category'], string> = {
  tasyahhud: 'Lafaz Tasyahhud',
  selawat: 'Tambahan Selawat (amalan mazhab Syafi‘i)',
};
