import { createContext, useContext } from 'react';
import type {
  AppId,
  FormFactor,
  LevelData,
  LevelEnvironment,
  OpenWindow,
  ScoringEvent,
  ShellMode,
  WorldEvent,
  WorldNotification,
} from '../types';
import type { ContentIssue } from '../lib/schemas';

export interface LessonBreakdown {
  verdict_acc: number;
  evidence_acc?: number;
}

export interface SimulatedPCContextValue {
  level: LevelData;
  content?: LevelData['content'];
  environment?: LevelEnvironment;
  sessionId: string | null;
  score: number;
  windows: OpenWindow[];
  activeWindow: string | null;
  openWindow: (id: string, title: string, icon: string, appId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  formFactor: FormFactor;
  shellMode: ShellMode;
  cycleShellMode: () => void;
  addScoringEvent: (event: ScoringEvent) => void;
  emit: (event: WorldEvent) => void;
  unlocked: ReadonlySet<string>;
  objectivesDone: ReadonlySet<string>;
  notifications: WorldNotification[];
  dismissNotification: (id: number) => void;
  browserUrl: string | null;
  contentErrors: Record<AppId, ContentIssue[]>;
  completeSession: (finalScore?: number) => void;
  startShutdown: () => void;
  startReplay: () => void;
  completed: boolean;
  /** Session checkpoint state from the resume anchor (session.state). */
  resumeState: Record<string, unknown> | null;
  /** Bank a finished lesson: XP award + checkpoint write. Best-effort. */
  bankLesson: (
    appId: string,
    lessonIndex: number,
    lessonsTotal: number,
    results: { correct: boolean; evidenceAcc?: number }[]
  ) => void;
}

export const SimulatedPCContext = createContext<SimulatedPCContextValue | null>(null);

export function useSimulatedPC() {
  const ctx = useContext(SimulatedPCContext);
  if (!ctx) throw new Error('useSimulatedPC must be used within SimulatedPC');
  return ctx;
}
