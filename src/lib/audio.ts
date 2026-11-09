/**
 * Kesan bunyi disintesis dengan Web Audio (tiada fail luar).
 * Bacaan Arab TIDAK dijana di sini — hanya rakaman yang disahkan guru dimainkan (lihat UnitAudio).
 */
type Sfx = 'click' | 'correct' | 'wrong' | 'chest' | 'complete';

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}
export const isMuted = () => muted;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
}

export function play(s: Sfx) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  try {
    switch (s) {
      case 'click':
        tone(c, 880, 0, 0.06, 'triangle', 0.08);
        break;
      case 'correct':
        tone(c, 659.25, 0, 0.18, 'sine', 0.18);
        tone(c, 987.77, 0.1, 0.3, 'sine', 0.16);
        break;
      case 'wrong':
        tone(c, 220, 0, 0.22, 'triangle', 0.12);
        tone(c, 196, 0.12, 0.25, 'triangle', 0.1);
        break;
      case 'chest':
        tone(c, 130.81, 0, 0.25, 'sawtooth', 0.04);
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(c, f, 0.15 + i * 0.07, 0.4, 'sine', 0.12));
        break;
      case 'complete':
        [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, i * 0.12, 0.6, 'sine', 0.14));
        break;
    }
  } catch {
    /* audio tidak penting */
  }
}
