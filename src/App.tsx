import { GameProvider, useGame, type Screen } from './state/GameContext.tsx';
import { GoldParticles } from './components/Decor.tsx';
import { Landing } from './screens/Landing.tsx';
import { Register } from './screens/Register.tsx';
import { Tutorial } from './screens/Tutorial.tsx';
import { MapScreen } from './screens/MapScreen.tsx';
import { LafazScreen } from './screens/LafazScreen.tsx';
import { MeaningScreen } from './screens/MeaningScreen.tsx';
import { FeedbackScreen } from './screens/FeedbackScreen.tsx';
import { OrderScreen } from './screens/OrderScreen.tsx';
import { ResultsScreen } from './screens/ResultsScreen.tsx';
import { CertificateScreen } from './screens/CertificateScreen.tsx';
import { TeacherScreen } from './screens/TeacherScreen.tsx';
import { allUnitsDone, gameComplete } from './lib/scoring.ts';
import type { Progress } from './lib/storage.ts';

/** Pastikan skrin yang diminta dibenarkan oleh kemajuan semasa (cth. tiada lompat ke sijil). */
export function guardScreen(s: Screen, hasSession: boolean, p: Progress | null): Screen {
  const needsSession = !['landing', 'register', 'teacher'].includes(s.name);
  if (needsSession && (!hasSession || !p)) return { name: 'register' };
  if (!p) return s;
  const unitOpen = (id: number) => id === 1 || !!p.units[id - 1]?.meaning.done;
  switch (s.name) {
    case 'lafaz':
      return unitOpen(s.unitId) ? s : { name: 'map' };
    case 'meaning':
      if (!p.units[s.unitId].lafaz.done) return { name: 'lafaz', unitId: s.unitId };
      return s;
    case 'feedback':
      return p.units[s.unitId].meaning.done ? s : { name: 'meaning', unitId: s.unitId };
    case 'order':
      return allUnitsDone(p) ? s : { name: 'map' };
    case 'results':
      return gameComplete(p) ? s : { name: 'map' };
    default:
      return s;
  }
}

function Router() {
  const { screen, session, progress } = useGame();
  const s = guardScreen(screen, !!session, progress);
  const key = 'unitId' in s ? `${s.name}-${s.unitId}-${session?.sessionId}` : `${s.name}-${session?.sessionId}`;
  let view;
  switch (s.name) {
    case 'landing': view = <Landing />; break;
    case 'register': view = <Register />; break;
    case 'tutorial': view = <Tutorial />; break;
    case 'map': view = <MapScreen />; break;
    case 'lafaz': view = <LafazScreen unitId={s.unitId} />; break;
    case 'meaning': view = <MeaningScreen unitId={s.unitId} />; break;
    case 'feedback': view = <FeedbackScreen unitId={s.unitId} />; break;
    case 'order': view = <OrderScreen />; break;
    case 'results': view = <ResultsScreen />; break;
    case 'certificate': view = <CertificateScreen />; break;
    case 'teacher': view = <TeacherScreen />; break;
  }
  return <div key={key}>{view}</div>;
}

export default function App() {
  return (
    <GameProvider>
      <GoldParticles />
      <Router />
    </GameProvider>
  );
}
