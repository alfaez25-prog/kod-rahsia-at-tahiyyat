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
| Tetapan guru | `src/lib/settings.ts`, `src/screens/TeacherScreen.tsx` |
| Skrin permainan | `src/screens/*` |

## Markah
- Lafaz: 50 / 25 / 10 / 0 (percubaan 1 / 2 / 3 / 4+) × 8
- Maksud: 50 / 25 / 10 / 0 × 8
- Susunan: 200 / 150 / 100 / 50, tolak 25 setiap petunjuk (min 25)
- Maksimum 1000. Peratus penguasaan = item betul percubaan pertama ÷ 17 (berasingan daripada XP).

## Mod Guru
Pautan "Mod Guru" di bawah skrin utama. PIN lalai **1234** (sila tukar). Tetapan disimpan dalam localStorage pelayar itu sahaja; gunakan Eksport/Import JSON untuk memindahkannya. Ini bukan sistem keselamatan atau pangkalan data berpusat.

## Memerlukan input guru
- Semak lafaz, harakat, maksud dan distraktor setiap unit; tandakan "Telah disemak guru".
- Rakaman bacaan (pilihan): masukkan pautan audio dan tandakan "Rakaman disahkan". Tanpa itu, tiada audio bacaan dimainkan (tiada TTS).
- Logo sekolah, senarai kelas, pautan tugasan Google Classroom khusus, PIN guru, tahap kelayakan sijil.
