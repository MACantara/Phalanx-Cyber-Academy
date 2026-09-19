import { useCallback, useEffect, useMemo, useState } from 'react';
import { BootSequence } from './components/BootSequence';
import { ShutdownSequence } from './components/ShutdownSequence';
import { SimulatedPCContext, type SimulatedPCContextValue } from './context/SimulatedPCContext';
import { getRenderer } from './renderers';
import { applyAdaptive } from './lib/adaptive';
import type { LevelData, OpenWindow, ScoringEvent, SimulationContent } from './types';

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
  const [scoringEvents, setScoringEvents] = useState<ScoringEvent[]>([]);
  const [activeContent, setActiveContent] = useState<SimulationContent | undefined>(level.content);
  const [replayId, setReplayId] = useState(0);

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

  const addScoringEvent = useCallback((event: ScoringEvent) => {
    setScoringEvents((prev) => [...prev, event]);
  }, []);

  const completeSession = useCallback((finalScore?: number) => {
    if (finalScore !== undefined) {
      setScore(finalScore);
    }
    setCompleted(true);
  }, []);

  const startReplay = useCallback(() => {
    if (!activeContent) return;
    const mutated = applyAdaptive(activeContent);
    if (!mutated) return;
    setActiveContent(mutated);
    setScoringEvents([]);
    setCompleted(false);
    setScore(0);
    setPhase('desktop');
    setReplayId((id) => id + 1);
  }, [activeContent]);

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

  useEffect(() => {
    if (completed) return;
    if (!activeContent || !('scoring' in activeContent)) return;
    const scoring = activeContent.scoring;
    const raw = scoringEvents.reduce((sum, e) => sum + e.points, 0);
    setScore(Math.max(0, Math.min(scoring.maxScore, raw)));
  }, [activeContent, scoringEvents, completed]);

  useEffect(() => {
    setActiveContent(level.content);
    setScoringEvents([]);
    setCompleted(false);
    setScore(0);
    setPhase('boot');
    setReplayId((id) => id + 1);
  }, [level]);

  const context = useMemo<SimulatedPCContextValue>(
    () => ({
      level,
      content: activeContent,
      sessionId: sessionId ?? null,
      score,
      windows,
      activeWindow,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      addScoringEvent,
      completeSession,
      startShutdown,
      startReplay,
      completed,
    }),
    [level, activeContent, sessionId, score, windows, activeWindow, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, addScoringEvent, completeSession, startShutdown, startReplay, completed]
  );

  const contentType = activeContent?.type;
  const Renderer = getRenderer(contentType);

  return (
    <SimulatedPCContext.Provider value={context}>
      <div className="fixed inset-0 z-50 overflow-hidden bg-[#0c0c0e] p-0 sm:p-3">
        <div className="relative h-full w-full overflow-hidden bg-stock sm:border sm:border-ink">
        {phase === 'boot' && <BootSequence onComplete={() => setPhase('desktop')} />}
        {phase === 'desktop' && <Renderer key={replayId} />}
        {phase === 'shutdown' && (
          <ShutdownSequence
            onComplete={onShutdownFinished}
          />
        )}
        </div>
      </div>
    </SimulatedPCContext.Provider>
  );
}
