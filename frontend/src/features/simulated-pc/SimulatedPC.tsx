import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BootSequence } from './components/BootSequence';
import { ShutdownSequence } from './components/ShutdownSequence';
import { DesktopShell } from './components/DesktopShell';
import { HandsetShell } from './components/HandsetShell';
import { SimulatedPCContext, type SimulatedPCContextValue } from './context/SimulatedPCContext';
import { applyAdaptive } from './lib/adaptive';
import { toEnvironment } from './lib/environment';
import { applyWorldEvent, freshWorld, requiredObjectives, type WorldState } from './lib/scenario';
import { usePrefersHandset } from './lib/usePrefersHandset';
import { validateAppContent } from './lib/schemas';
import { getApp } from './apps';
import type { LevelData, OpenWindow, ScoringEvent, SimulationContent, LevelEnvironment, ShellMode, WorldEvent, WorldNotification } from './types';

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
  const [lockedScore, setLockedScore] = useState<number | null>(null);
  const [activeContent, setActiveContent] = useState<SimulationContent | LevelEnvironment | undefined>(level.content);
  const [replayId, setReplayId] = useState(0);
  const [world, setWorld] = useState<WorldState>(freshWorld);
  const [notifications, setNotifications] = useState<WorldNotification[]>([]);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const worldRef = useRef<WorldState>(world);
  const notificationSeq = useRef(0);
  const prefersHandset = usePrefersHandset();
  const [shellMode, setShellMode] = useState<ShellMode>('auto');
  const formFactor = shellMode === 'auto' ? (prefersHandset ? 'handset' : 'workstation') : shellMode;

  const cycleShellMode = useCallback(() => {
    setShellMode((m) => (m === 'auto' ? (formFactor === 'handset' ? 'workstation' : 'handset') : 'auto'));
  }, [formFactor]);

  const environment = useMemo(() => toEnvironment(activeContent), [activeContent]);

  const contentErrors = useMemo(() => {
    const errors: SimulatedPCContextValue['contentErrors'] = {};
    for (const install of environment?.apps ?? []) {
      const issues = validateAppContent(
        environment?.content[install.appId],
        getApp(install.appId)?.schema
      );
      if (issues.length > 0) errors[install.appId] = issues;
    }
    return errors;
  }, [environment]);

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
      const i = prev.length;
      return [...prev, { id, title, icon, zIndex: nextZ, appId, x: 48 + i * 28, y: 32 + i * 28 }];
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

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const startShutdown = useCallback(() => {
    setPhase('shutdown');
  }, []);

  const addScoringEvent = useCallback((event: ScoringEvent) => {
    setScoringEvents((prev) => [...prev, event]);
  }, []);

  const resetWorld = useCallback(() => {
    const fresh = freshWorld();
    worldRef.current = fresh;
    setWorld(fresh);
    setNotifications([]);
    setBrowserUrl(null);
    setWindows([]);
    setActiveWindow(null);
  }, []);

  const completeSession = useCallback((finalScore?: number) => {
    // Environment-owned completion: app-level finishes are advisory while
    // required objectives remain. Legacy envs declare none, so their
    // per-app completion flow is unchanged.
    const required = requiredObjectives(environment);
    if (required.some((o) => !worldRef.current.objectivesDone.has(o.id))) return;
    if (finalScore !== undefined) {
      setLockedScore(finalScore);
    }
    setCompleted(true);
  }, [environment]);

  const emit = useCallback((event: WorldEvent) => {
    const { next, scoring, notifications: notes, openUrl, completedNow } =
      applyWorldEvent(environment, worldRef.current, event);
    if (next === worldRef.current) return;
    worldRef.current = next;
    setWorld(next);
    for (const s of scoring) setScoringEvents((prev) => [...prev, s]);
    if (notes.length) {
      setNotifications((prev) => [
        ...prev,
        ...notes.map((n) => ({ id: notificationSeq.current++, message: n.message, speaker: n.speaker })),
      ]);
    }
    if (openUrl) {
      setBrowserUrl(openUrl);
      openWindow('app-browser', getApp('browser')?.name ?? 'Browser', 'browser', 'browser');
    }
    if (completedNow) completeSession();
  }, [environment, openWindow, completeSession]);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const startReplay = useCallback(() => {
    if (!activeContent) return;
    const mutated = applyAdaptive(activeContent);
    if (mutated) setActiveContent(mutated);
    setScoringEvents([]);
    setLockedScore(null);
    setCompleted(false);
    setScore(0);
    resetWorld();
    setPhase('desktop');
    setReplayId((id) => id + 1);
  }, [activeContent, resetWorld]);

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
    if (lockedScore !== null) return;
    if (!activeContent || !('scoring' in activeContent)) return;
    const scoring = activeContent.scoring;
    const raw = scoringEvents.reduce((sum, e) => sum + e.points, 0);
    setScore(Math.max(0, Math.min(scoring.maxScore, raw)));
  }, [activeContent, scoringEvents, lockedScore]);

  useEffect(() => {
    setActiveContent(level.content);
    setScoringEvents([]);
    setLockedScore(null);
    setCompleted(false);
    setScore(0);
    resetWorld();
    setPhase('boot');
    setReplayId((id) => id + 1);
  }, [level, resetWorld]);

  const context = useMemo<SimulatedPCContextValue>(
    () => ({
      level,
      content: activeContent,
      environment,
      sessionId: sessionId ?? null,
      score,
      windows,
      activeWindow,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      moveWindow,
      formFactor,
      shellMode,
      cycleShellMode,
      addScoringEvent,
      emit,
      unlocked: world.unlocked,
      objectivesDone: world.objectivesDone,
      notifications,
      dismissNotification,
      browserUrl,
      contentErrors,
      completeSession,
      startShutdown,
      startReplay,
      completed,
    }),
    [level, activeContent, environment, contentErrors, sessionId, score, windows, activeWindow, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, moveWindow, formFactor, shellMode, cycleShellMode, addScoringEvent, emit, world, notifications, dismissNotification, browserUrl, completeSession, startShutdown, startReplay, completed]
  );

  return (
    <SimulatedPCContext.Provider value={context}>
      <div className="fixed inset-0 z-50 overflow-hidden bg-[#0c0c0e] p-0 sm:p-3">
        <div className="relative h-full w-full overflow-hidden bg-stock sm:border sm:border-ink">
        {phase === 'boot' && <BootSequence onComplete={() => setPhase('desktop')} />}
        {phase === 'desktop' &&
          (formFactor === 'handset' ? (
            <HandsetShell key={replayId} />
          ) : (
            <DesktopShell key={replayId} />
          ))}
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
