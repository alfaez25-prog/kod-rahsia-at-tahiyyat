import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  addHistory,
  endSession,
  loadMuted,
  loadProgress,
  loadSession,
  loadSettings,
  saveMuted,
  saveProgress,
  saveSettings,
  startSession,
  type Progress,
  type Session,
  type Student,
} from '../lib/storage.ts';
import type { TeacherSettings } from '../lib/settings.ts';
import { gameComplete, mastery, totalScore } from '../lib/scoring.ts';
import { setMuted as setAudioMuted } from '../lib/audio.ts';

export type Screen =
  | { name: 'landing' }
  | { name: 'register' }
  | { name: 'tutorial' }
  | { name: 'map' }
  | { name: 'lafaz'; unitId: number }
  | { name: 'meaning'; unitId: number }
  | { name: 'feedback'; unitId: number }
  | { name: 'order' }
  | { name: 'results' }
  | { name: 'certificate' }
  | { name: 'teacher' };

interface GameCtx {
  screen: Screen;
  go: (s: Screen) => void;
  settings: TeacherSettings;
  updateSettings: (s: TeacherSettings) => void;
  session: Session | null;
  progress: Progress | null;
  register: (s: Student) => void;
  logout: () => void;
  update: (fn: (p: Progress) => Progress) => void;
  muted: boolean;
  toggleMute: () => void;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TeacherSettings>(() => loadSettings());
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [progress, setProgress] = useState<Progress | null>(() => {
    const s = loadSession();
    return s ? loadProgress(s) : null;
  });
  const [screen, setScreen] = useState<Screen>({ name: 'landing' });
  const [muted, setMuted] = useState(() => loadMuted());

  useEffect(() => setAudioMuted(muted), [muted]);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const register = useCallback((st: Student) => {
    const { session: s, progress: p } = startSession(st);
    setSession(s);
    setProgress(p);
  }, []);

  const logout = useCallback(() => {
    endSession();
    setSession(null);
    setProgress(null);
  }, []);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress((prev) => {
        if (!prev || !session || prev.sessionId !== session.sessionId) return prev;
        let next = fn(structuredClone(prev));
        if (!next.completedAt && gameComplete(next)) {
          next = { ...next, completedAt: new Date().toISOString() };
          addHistory({
            sessionId: session.sessionId,
            name: session.name,
            className: session.className,
            score: totalScore(next),
            mastery: mastery(next).percent,
            completedAt: next.completedAt!,
          });
        }
        saveProgress(next);
        return next;
      });
    },
    [session],
  );

  const updateSettings = useCallback((s: TeacherSettings) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      saveMuted(!m);
      return !m;
    });
  }, []);

  const value = useMemo(
    () => ({ screen, go, settings, updateSettings, session, progress, register, logout, update, muted, toggleMute }),
    [screen, go, settings, updateSettings, session, progress, register, logout, update, muted, toggleMute],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useGame mesti di dalam GameProvider');
  return c;
}
