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
}

export const SimulatedPCContext = createContext<SimulatedPCContextValue | null>(null);

export function useSimulatedPC() {
  const ctx = useContext(SimulatedPCContext);
  if (!ctx) throw new Error('useSimulatedPC must be used within SimulatedPC');
  return ctx;
}
