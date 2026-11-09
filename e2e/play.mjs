// Ujian pelayar hujung-ke-hujung (Playwright). Jalankan: npm run test:e2e
// Memerlukan `npm run build` dahulu. Menghidupkan `vite preview` secara automatik.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_UNITS } from '../src/data/tahiyat.ts';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'e2e', 'output');
mkdirSync(outDir, { recursive: true });
const PORT = 4179;
const BASE = `http://localhost:${PORT}/`;

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const nfc = (s) => s.normalize('NFC').trim().replace(/\s+/g, ' ');
const words = (u) => nfc(u.arabic).split(' ');
const blankAnswer = (u, b) => b.tokens.map((t) => words(u)[t]).join(' ');

async function waitServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Pelayan preview tidak bermula');
}

async function noHorizontalScroll(page, label) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  check(`Responsif telefon: tiada skrol mendatar (${label})`, sw <= cw + 1, `scrollWidth=${sw}, clientWidth=${cw}`);
}

async function clickOption(page, testid, text) {
  const opts = page.getByTestId(testid);
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const t = nfc(await opts.nth(i).innerText());
    if (t === nfc(text) || (testid === "meaning-option" && t.endsWith(nfc(text)))) return opts.nth(i);
  }
  throw new Error(`Pilihan tidak dijumpai: ${text}`);
}

/** Main satu permainan penuh. mistakes: { lafazUnit, meaningUnit } untuk menguji percubaan semula. */
async function playGame(page, { name, className, mobile, mistakes = {}, useDrag = false }) {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /MULA PENGEMBARAAN/ }).click();
  if (mobile) await noHorizontalScroll(page, 'landing→daftar');

  // --- Pendaftaran
  const start = page.getByTestId('btn-start');
  check('Nama & kelas kosong: MULA MISI disabled', await start.isDisabled());
  await page.getByTestId('input-class').fill(className);
  await page.getByTestId('input-name').fill('    ');
  check('Nama hanya ruang: MULA MISI disabled', await start.isDisabled());
  await page.getByTestId('input-name').fill(name);
  await page.getByTestId('input-class').fill('');
  check('Kelas kosong: MULA MISI disabled', await start.isDisabled());
  await page.getByTestId('input-class').fill(className);
  check('Nama & kelas sah: MULA MISI aktif', await start.isEnabled());
  await page.getByRole('button', { name: /Maryam/ }).click();
  await start.click();

  // --- Tutorial
  await page.getByRole('button', { name: 'Langkau' }).click();
  await page.getByTestId('chest-1').waitFor();
  if (mobile) await noHorizontalScroll(page, 'peta');
  check('Sijil terkunci sebelum tamat (butang peta)', await page.getByTestId('btn-cert-map').isDisabled());
  check('Susunan akhir terkunci sebelum 8 peti', await page.getByTestId('btn-order').isDisabled());
  check('Peti 2 berkunci sebelum Peti 1 selesai', await page.getByTestId('chest-2').isDisabled());
  check('Nama dipaparkan pada dashboard', (await page.getByTestId('hud-name').innerText()) === name);

  for (const u of DEFAULT_UNITS) {
    if (u.id === 1) await page.getByTestId(`chest-${u.id}`).click();
    await page.getByTestId('btn-check-lafaz').waitFor();
    if (mobile && u.id === 1) await noHorizontalScroll(page, 'cabaran lafaz');
    // Jawapan tidak didedahkan sebelum percubaan
    const lineText = nfc(await page.getByTestId('lafaz-line').innerText());
    const hidden = u.lafaz.blanks.every((b) => !lineText.includes(blankAnswer(u, b)) || words(u).filter((w) => w === blankAnswer(u, b)).length > 1);
    if (u.id === 1 || u.id === 4) check(`Unit ${u.id}: lafaz lengkap tidak dipaparkan sebelum percubaan`, hidden);
    check(`Unit ${u.id}: soalan lafaz mempunyai 4 pilihan`, (await page.getByTestId('lafaz-option').count()) === 4);

    if (mistakes.lafazUnit === u.id) {
      // Isi dengan distraktor dahulu
      for (const b of u.lafaz.blanks) await (await clickOption(page, 'lafaz-option', b.distractors[0])).click();
      await page.getByTestId('btn-check-lafaz').click();
      const msg = await page.getByTestId('lafaz-message').innerText();
      check(`Unit ${u.id}: jawapan salah memberi maklum balas & petunjuk`, /belum tepat/i.test(msg) && (await page.getByText(/Petunjuk:/).count()) > 0, msg);
    }
    for (const [bi, b] of u.lafaz.blanks.entries()) {
      const opt = await clickOption(page, 'lafaz-option', blankAnswer(u, b));
      if (useDrag && u.id === 3 && !mobile) {
        await opt.dragTo(page.getByTestId(`blank-${bi}`));
      } else {
        await opt.click();
      }
    }
    if (useDrag && u.id === 3 && !mobile) {
      check('Seret-dan-lepas kad ke ruang jawapan berfungsi', nfc(await page.getByTestId('blank-0').innerText()) === blankAnswer(u, u.lafaz.blanks[0]));
    }
    await page.getByTestId('btn-check-lafaz').click();
    await page.getByTestId('btn-to-meaning').waitFor();
    const earned = await page.getByTestId('lafaz-earned').innerText();
    check(`Unit ${u.id}: lafaz betul diterima`, earned.includes(mistakes.lafazUnit === u.id ? '+25' : '+50'), earned);
    await page.getByTestId('btn-to-meaning').click();

    // --- Maksud
    await page.getByTestId('meaning-option').first().waitFor();
    if (mobile && u.id === 1) await noHorizontalScroll(page, 'cabaran maksud');
    check(`Unit ${u.id}: soalan maksud mempunyai 4 pilihan`, (await page.getByTestId('meaning-option').count()) === 4);
    if (mistakes.meaningUnit === u.id) {
      await (await clickOption(page, 'meaning-option', u.meaningQ.distractors[0])).click();
      check(`Unit ${u.id}: maksud salah memberi petunjuk`, await page.getByTestId('meaning-feedback').isVisible());
    }
    await (await clickOption(page, 'meaning-option', u.meaning)).click();
    await page.getByTestId('btn-to-feedback').click();
    const fm = await page.getByTestId('feedback-meaning').innerText();
    check(`Unit ${u.id}: penerangan & maksud dipaparkan`, fm.includes(u.meaning));
    if (mobile && u.id === 8) await noHorizontalScroll(page, 'maklum balas');
    await page.getByTestId('btn-next').click();
  }

  // --- Susun manuskrip
  await page.getByTestId('btn-check-order').waitFor();
  if (mobile) await noHorizontalScroll(page, 'susunan akhir');
  check('Petunjuk susunan terkunci sebelum percubaan pertama', await page.getByTestId('btn-order-hint').isDisabled());
  const textToId = new Map(DEFAULT_UNITS.map((u) => [nfc(u.arabic), u.id]));
  const readOrder = async () => {
    const cards = page.getByTestId('order-card');
    const n = await cards.count();
    const ids = [];
    for (let i = 0; i < n; i++) ids.push(textToId.get(nfc(await cards.nth(i).locator('button[dir=rtl]').innerText())));
    return ids;
  };
  let order = await readOrder();
  check('Susunan awal rawak (bukan jawapan)', order.join() !== '1,2,3,4,5,6,7,8', order.join());
  // uji butang naik/turun
  const before = order.slice();
  await page.getByTestId('order-card').nth(0).getByTestId('btn-down').click();
  await page.waitForTimeout(700);
  order = await readOrder();
  check('Butang turun menukar kedudukan kad', order[0] === before[1] && order[1] === before[0]);
  // susun dengan ketik dua kad (selection sort)
  for (let pos = 0; pos < 8; pos++) {
    order = await readOrder();
    if (order[pos] === pos + 1) continue;
    const from = order.indexOf(pos + 1);
    await page.getByTestId('order-card').nth(from).locator('button[dir=rtl]').click();
    await page.getByTestId('order-card').nth(pos).locator('button[dir=rtl]').click();
    await page.waitForTimeout(700); // tunggu animasi susun atur tamat
  }
  order = await readOrder();
  check('Ketik dua kad untuk menukar berfungsi', order.join() === '1,2,3,4,5,6,7,8', order.join());
  await page.getByTestId('btn-check-order').click();
  await page.getByTestId('btn-to-results').waitFor();
  check('Susunan akhir betul diterima (+200)', (await page.getByTestId('order-earned').innerText()).includes('+200'));
  await page.getByTestId('btn-to-results').click();

  // --- Keputusan
  const score = await page.getByTestId('result-score').innerText();
  const mastery = await page.getByTestId('result-mastery').innerText();
  return { score: score.replace(/\s/g, ''), mastery };
}

async function run() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();

    // ============ DESKTOP ============
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const NAME = 'Nur Aisyah binti Ahmad';
    const CLASS = '4 Bestari';
    const r = await playGame(page, { name: NAME, className: CLASS, mistakes: { lafazUnit: 1, meaningUnit: 2 }, useDrag: true });
    // 1000 − 25 (lafaz U1 percubaan ke-2) − 25 (maksud U2 percubaan ke-2) = 950; penguasaan 15/17 = 88%
    check('Markah dikira tepat (950/1000)', r.score.startsWith('950/1000'), r.score);
    check('Peratus penguasaan tepat (88%)', r.mastery === '88%', r.mastery);
    await page.screenshot({ path: path.join(outDir, 'desktop-keputusan.png'), fullPage: true });

    // Pautan Classroom
    const link = page.getByTestId('classroom-link');
    check('Pautan Google Classroom betul', (await link.getAttribute('href')) === 'https://classroom.google.com/' && (await link.getAttribute('target')) === '_blank');
    const reqs = [];
    ctx.on('request', (r) => reqs.push(r.url()));
    const [popup] = await Promise.all([ctx.waitForEvent('page'), link.click()]);
    await popup.waitForLoadState().catch(() => {});
    // Nota: rangkaian sandbox ujian mungkin menyekat laman Google; semak permintaan navigasi tab baharu.
    check('BUKA GOOGLE CLASSROOM membuka tab baharu ke classroom.google.com', reqs.some((u) => u.startsWith('https://classroom.google.com/')), reqs.filter((u) => u.includes('classroom')).join(', '));
    await popup.close();

    // Sijil
    await page.getByTestId('btn-certificate').click();
    await page.getByTestId('certificate').waitFor();
    const today = await page.evaluate(() => {
      const M = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
      const d = new Date();
      return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
    });
    check('Sijil: nama tepat', (await page.getByTestId('cert-name').innerText()).replace(/\u2011/g, '-') === NAME);
    check('Sijil: kelas tepat', (await page.getByTestId('cert-class').innerText()) === `Kelas ${CLASS}`);
    check('Sijil: markah tepat', (await page.getByTestId('cert-score').innerText()) === '950 / 1000');
    check('Sijil: penguasaan tepat', (await page.getByTestId('cert-mastery').innerText()) === '88%');
    check('Sijil desktop: semua teks dalam bingkai', await page.getByTestId('cert-content').evaluate((el) => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1));
    check('Sijil: tarikh tamat tepat', (await page.getByTestId('cert-date').innerText()) === today, today);
    const certText = await page.getByTestId('certificate').innerText();
    for (const t of ['SK BUKIT MINYAK', 'SIJIL PENCAPAIAN DIGITAL', 'PAKAR TAHIYAT AWAL', 'KOD RAHSIA AT-TAHIYYAT']) check(`Sijil mengandungi "${t}"`, certText.includes(t));

    const [dlPng] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.getByTestId('btn-png').click()]);
    const pngPath = path.join(outDir, dlPng.suggestedFilename());
    await dlPng.saveAs(pngPath);
    const png = readFileSync(pngPath);
    const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
    const physAt = png.indexOf('pHYs');
    const dpi = physAt > 0 ? Math.round(png.readUInt32BE(physAt + 4) * 0.0254) : null;
    check('PNG dimuat turun & sah', png.subarray(1, 4).toString() === 'PNG', dlPng.suggestedFilename());
    check('PNG 3508 × 2480 piksel @ 300 DPI', w === 3508 && h === 2480 && dpi === 300, `${w}×${h} @ ${dpi} DPI, ${(png.length / 1e6).toFixed(1)} MB`);
    check('Nama fail selamat & unik', /^Sijil_PakarTahiyatAwal_Nur_Aisyah_binti_Ahmad_4_Bestari_\d{8}-\d{6}\.png$/.test(dlPng.suggestedFilename()), dlPng.suggestedFilename());

    const [dlPdf] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.getByTestId('btn-pdf').click()]);
    const pdfPath = path.join(outDir, dlPdf.suggestedFilename());
    await dlPdf.saveAs(pdfPath);
    const pdf = readFileSync(pdfPath);
    const pdfStr = pdf.toString('latin1');
    const mb = pdfStr.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
    check('PDF dimuat turun & sah', pdfStr.startsWith('%PDF-') && pdfStr.trimEnd().endsWith('%%EOF'), `${dlPdf.suggestedFilename()} ${(pdf.length / 1e6).toFixed(1)} MB`);
    check('PDF A4 landskap (841.89 × 595.28 pt)', mb && Math.abs(+mb[1] - 841.89) < 1 && Math.abs(+mb[2] - 595.28) < 1, mb?.slice(1).join(' × '));
    // buka PDF dalam pelayar & tangkap gambar halaman PNG untuk semakan visual
    const viewer = await ctx.newPage();
    await viewer.setViewportSize({ width: 1754, height: 1240 });
    await viewer.setContent(`<img src="data:image/png;base64,${png.toString('base64')}" style="width:1754px;height:1240px">`);
    await viewer.screenshot({ path: path.join(outDir, 'sijil-pratonton.png') });
    await viewer.close();

    // Tukar nama → sesi baharu
    await page.goto(BASE);
    await page.getByRole('button', { name: /Murid lain/ }).click();
    await page.getByTestId('input-name').fill('Muhammad Hakim bin Yusof');
    await page.getByTestId('input-class').fill('4 Cemerlang');
    await page.getByTestId('btn-start').click();
    await page.getByRole('button', { name: 'Langkau' }).click();
    await page.getByTestId('chest-1').waitFor();
    check('Tukar nama: sesi baharu bermula dengan markah 0', (await page.getByTestId('hud-score').innerText()) === '0');
    check('Tukar nama: kemajuan murid lain tidak terbawa', (await page.getByTestId('map-progress').innerText()).startsWith('0 /'));
    check('Tukar nama: sijil terkunci untuk murid baharu', await page.getByTestId('btn-cert-map').isDisabled());
    await page.reload();
    await page.getByRole('button', { name: /SAMBUNG MISI/ }).click();
    check('Muat semula: sesi murid baharu dikekalkan', (await page.getByTestId('hud-name').innerText()) === 'Muhammad Hakim bin Yusof');
    check('Tiada ralat JavaScript (desktop)', errors.length === 0, errors.join(' | '));
    await ctx.close();

    // ============ TELEFON ============
    const mctx = await browser.newContext({ ...devices['iPhone 13'], acceptDownloads: true });
    const mpage = await mctx.newPage();
    const merr = [];
    mpage.on('pageerror', (e) => merr.push(e.message));
    const LONG = 'Siti Nur Aisyah Humaira binti Mohd Khairul Anuar Al-Haj';
    const mr = await playGame(mpage, { name: LONG, className: '4 Cemerlang Bestari', mobile: true });
    check('Telefon: permainan sempurna = 1000/1000', mr.score.startsWith('1000/1000'), mr.score);
    check('Telefon: penguasaan 100%', mr.mastery === '100%', mr.mastery);
    await noHorizontalScroll(mpage, 'keputusan');
    await mpage.getByTestId('btn-certificate').click();
    await mpage.getByTestId('certificate').waitFor();
    await mpage.waitForTimeout(800);
    await noHorizontalScroll(mpage, 'sijil');
    const fits = await mpage.getByTestId('cert-name').evaluate((el) => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.parentElement.clientHeight + 1);
    const dims = await mpage.getByTestId('cert-name').evaluate((el) => [el.scrollWidth, el.clientWidth, el.scrollHeight, el.parentElement.clientHeight, getComputedStyle(el).fontSize].join(','));
    check('Nama panjang muat dalam sijil (tidak terpotong)', fits, dims);
    const contentFits = await mpage.getByTestId('cert-content').evaluate((el) => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1);
    check('Semua teks sijil berada dalam bingkai (nama panjang)', contentFits);
    const [mdlPng] = await Promise.all([mpage.waitForEvent('download', { timeout: 90000 }), mpage.getByTestId('btn-png').click()]);
    await mdlPng.saveAs(path.join(outDir, 'telefon-sijil-nama-panjang.png'));
    await mpage.screenshot({ path: path.join(outDir, 'telefon-sijil.png'), fullPage: false });
    const [mdl] = await Promise.all([mpage.waitForEvent('download', { timeout: 90000 }), mpage.getByTestId('btn-pdf').click()]);
    const mpdf = path.join(outDir, `telefon-${mdl.suggestedFilename()}`);
    await mdl.saveAs(mpdf);
    check('Telefon: PDF boleh dimuat turun', readFileSync(mpdf).toString('latin1', 0, 5) === '%PDF-', mdl.suggestedFilename());
    await mpage.goto(BASE);
    await mpage.screenshot({ path: path.join(outDir, 'telefon-landing.png'), fullPage: true });
    await noHorizontalScroll(mpage, 'landing');
    check('Tiada ralat JavaScript (telefon)', merr.length === 0, merr.join(' | '));
    await mctx.close();

    // Tangkapan skrin tambahan (desktop)
    const sctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const sp = await sctx.newPage();
    await sp.goto(BASE);
    await sp.evaluate(() => localStorage.clear());
    await sp.reload();
    await sp.waitForTimeout(2200);
    await sp.screenshot({ path: path.join(outDir, 'desktop-landing.png') });
    await sp.getByRole('button', { name: /MULA PENGEMBARAAN/ }).click();
    await sp.getByTestId('input-name').fill('Ali bin Abu');
    await sp.getByTestId('input-class').fill('4A');
    await sp.getByTestId('btn-start').click();
    await sp.getByRole('button', { name: 'Langkau' }).click();
    await sp.waitForTimeout(800);
    await sp.screenshot({ path: path.join(outDir, 'desktop-peta.png') });
    await sp.getByTestId('chest-1').click();
    await sp.waitForTimeout(800);
    await sp.screenshot({ path: path.join(outDir, 'desktop-lafaz.png') });
    await sctx.close();

    await browser.close();
  } finally {
    server.kill();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} semakan lulus.`);
  if (failed.length) {
    console.log('GAGAL:', failed.map((f) => f.name).join('; '));
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
