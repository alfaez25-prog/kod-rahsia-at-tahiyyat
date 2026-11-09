import { describe, expect, it } from 'vitest';
import { isRegistrationValid, KEYS, loadProgress, loadSession, saveProgress, startSession, validateRegistration } from '../lib/storage.ts';
import { CLASSROOM_URL, SETTINGS, safeUrl } from '../lib/settings.ts';

describe('Pendaftaran', () => {
  it('nama kosong / ruang sahaja tidak boleh mula', () => {
    expect(isRegistrationValid('', '4 Bestari')).toBe(false);
    expect(isRegistrationValid('    ', '4 Bestari')).toBe(false);
    expect(validateRegistration('   ', '4A').name).toBeTruthy();
  });
  it('kelas kosong tidak boleh mula', () => {
    expect(isRegistrationValid('Ali bin Abu', '')).toBe(false);
    expect(isRegistrationValid('Ali bin Abu', '   ')).toBe(false);
    expect(validateRegistration('Ali bin Abu', '').className).toBeTruthy();
  });
  it('nama & kelas sah boleh mula', () => {
    expect(isRegistrationValid('Nur Aisyah binti Ahmad', '4 Bestari')).toBe(true);
  });
});

describe('Penyimpanan setempat', () => {
  it('menyimpan nama & kelas dalam localStorage', () => {
    startSession({ name: '  Ali   bin Abu ', className: '4 Amanah', avatar: 2 });
    const s = loadSession()!;
    expect(s.name).toBe('Ali bin Abu');
    expect(s.className).toBe('4 Amanah');
    expect(JSON.parse(localStorage.getItem(KEYS.session)!).name).toBe('Ali bin Abu');
  });
  it('tukar nama memulakan sesi baharu — kemajuan tidak bercampur antara murid', () => {
    const a = startSession({ name: 'Murid Satu', className: '4A', avatar: 0 });
    a.progress.units[1].lafaz = { attempts: 1, done: true, points: 50 };
    saveProgress(a.progress);
    expect(loadProgress(a.session).units[1].lafaz.points).toBe(50);

    const b = startSession({ name: 'Murid Dua', className: '4A', avatar: 1 });
    expect(b.session.sessionId).not.toBe(a.session.sessionId);
    const pb = loadProgress(b.session);
    expect(pb.units[1].lafaz.points).toBe(0);
    expect(pb.studentKey).toBe(b.session.studentKey);
    // kemajuan murid lama telah dibuang daripada peranti
    expect(localStorage.getItem(KEYS.progress(a.session.sessionId))).toBeNull();
  });
  it('kemajuan milik sesi lain ditolak walaupun kunci dimanipulasi', () => {
    const a = startSession({ name: 'Murid Satu', className: '4A', avatar: 0 });
    const fake = { ...a.progress, studentKey: 'ORANG LAIN|4B' };
    localStorage.setItem(KEYS.progress(a.session.sessionId), JSON.stringify(fake));
    expect(loadProgress(a.session).studentKey).toBe(a.session.studentKey);
  });
  it('localStorage rosak tidak menyebabkan ralat', () => {
    localStorage.setItem(KEYS.session, '{rosak');
    expect(loadSession()).toBeNull();
  });
});

describe('Tetapan permainan', () => {
  it('pautan Google Classroom kelas betul', () => {
    expect(CLASSROOM_URL).toBe('https://classroom.google.com/');
    expect(SETTINGS.classroomUrl).toBe('https://classroom.google.com/c/Nzg4MTkwMzYyNjg4?cjc=s4ii5xii');
    expect(safeUrl(SETTINGS.classroomUrl)).toBe(SETTINGS.classroomUrl);
  });
  it('hanya pautan http(s) diterima', () => {
    expect(safeUrl('javascript:alert(1)')).toBe(CLASSROOM_URL);
    expect(safeUrl('https://classroom.google.com/c/abc')).toBe('https://classroom.google.com/c/abc');
  });
});
