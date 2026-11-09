# KOD RAHSIA AT-TAHIYYAT — Misi Tahiyat Awal

Permainan pendidikan Pendidikan Islam Tahun 4, SK BUKIT MINYAK (Web HTML5, komputer & telefon).

## Menjalankan
```bash
npm install
npm run dev        # pembangunan: http://localhost:5173
npm run build      # production build → folder dist/
npm run preview    # pratonton build
npm test           # ujian unit (Vitest)
npm run test:e2e   # ujian pelayar Playwright (perlu `npm run build` dahulu)
```
Folder `dist/` ialah laman statik (`base: './'`) — boleh dimuat naik ke mana-mana hos statik (GitHub Pages, Netlify, Google Sites embed, dsb.).

## Struktur
| Bahagian | Fail |
|---|---|
| Data bacaan (8 unit) | `src/data/tahiyat.ts` |
| Bank soalan & penyemakan ID | `src/data/questionBank.ts` |
| Sistem markah & penguasaan | `src/lib/scoring.ts` |
| Penyimpanan localStorage | `src/lib/storage.ts` |
| Penjanaan sijil PDF/PNG | `src/lib/certificate.ts`, `src/components/Certificate.tsx` |
| Tetapan permainan (sekolah, kelas, pautan Classroom) | `src/lib/settings.ts` |
| Skrin permainan | `src/screens/*` |

## Markah
- Lafaz: 50 / 25 / 10 / 0 (percubaan 1 / 2 / 3 / 4+) × 8
- Maksud: 50 / 25 / 10 / 0 × 8
- Susunan: 200 / 150 / 100 / 50, tolak 25 setiap petunjuk (min 25)
- Maksimum 1000. Peratus penguasaan = item betul percubaan pertama ÷ 17 (berasingan daripada XP).

## Menukar tetapan
Tiada Mod Guru dalam aplikasi. Untuk menukar nama sekolah, logo, senarai kelas, pautan Classroom, arahan penghantaran atau tahap kelayakan sijil, sunting `src/lib/settings.ts`. Untuk menukar lafaz, maksud, distraktor, petunjuk atau rakaman audio, sunting `src/data/tahiyat.ts`. Kemudian jalankan `npm test` dan `npm run build` (Netlify akan build semula secara automatik selepas push ke GitHub).

## Memerlukan input guru
- Semak lafaz, harakat, maksud dan distraktor setiap unit dalam `src/data/tahiyat.ts`.
- Rakaman bacaan (pilihan): isi `audioUrl` dan tetapkan `audioVerified: true` dalam `src/data/tahiyat.ts`. Tanpa itu, tiada audio bacaan dimainkan (tiada TTS).
- Logo sekolah, senarai kelas, pautan tugasan Google Classroom khusus, tahap kelayakan sijil (`src/lib/settings.ts`).
