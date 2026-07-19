import { useCallback, useEffect, useMemo, useState } from 'react';
import { BootSequence } from './components/BootSequence';
import { Desktop } from './components/Desktop';
import { ShutdownSequence } from './components/ShutdownSequence';
import { SimulatedPCContext, type SimulatedPCContextValue } from './context/SimulatedPCContext';
import type { LevelData, OpenWindow } from './types';

export interface SimulatedPCProps {
  level: LevelData;
  sessionId?: string | null;
  onComplete: (payload: { score: number; timeSpent: number }) => void;
}

type Phase = 'boot' | 'desktop' | 'shutdown';

export function SimulatedPC({ level, sessionId, onComplete }: SimulatedPCProps) {
  const [phase, setPhase] = useState<Phase>('boot');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [zCounter, setZCounter] = useState(1000);

  const openWindow = useCallback((id: string, title: string, icon: string, appId: string) => {
    setWindows((prev) => {
      if (prev.some((w) => w.id === id)) {
        setZCounter((z) => z + 1);
        setActiveWindow(id);
        return prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter + 1, minimized: false } : w));
      }
      const nextZ = zCounter + 1;
      setZCounter(nextZ);
      setActiveWindow(id);
      return [...prev, { id, title, icon, zIndex: nextZ, appId }];
    });
  }, [zCounter]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  }, [activeWindow]);

  const focusWindow = useCallback((id: string) => {
    setZCounter((z) => z + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter + 1, minimized: false } : w))
    );
    setActiveWindow(id);
  }, [zCounter]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setZCounter((z) => z + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter + 1, minimized: false } : w))
    );
    setActiveWindow(id);
  }, [zCounter]);

  const startShutdown = useCallback(() => {
    setPhase('shutdown');
  }, []);

  const completeSession = useCallback((finalScore: number) => {
    setScore(finalScore);
    setCompleted(true);
  }, []);

  const onShutdownFinished = useCallback(() => {
    const timeSpent = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    onComplete({ score, timeSpent });
  }, [onComplete, score, startTime]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhase((p) => (p === 'desktop' ? 'shutdown' : p));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const context = useMemo<SimulatedPCContextValue>(
    () => ({
      level,
      content: level.content,
      sessionId: sessionId ?? null,
      score,
      setScore,
      windows,
      activeWindow,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      completeSession,
      startShutdown,
      completed,
    }),
    [level, sessionId, score, windows, activeWindow, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, completeSession, startShutdown, completed]
  );

  return (
    <SimulatedPCContext.Provider value={context}>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black">
        {phase === 'boot' && <BootSequence onComplete={() => setPhase('desktop')} />}
        {phase === 'desktop' && <Desktop />}
        {phase === 'shutdown' && (
          <ShutdownSequence
            onComplete={onShutdownFinished}
          />
        )}
      </div>
    </SimulatedPCContext.Provider>
  );
}
