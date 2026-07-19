import { createContext, useContext } from 'react';
import type { LevelData, OpenWindow } from '../types';

export interface SimulatedPCContextValue {
  level: LevelData;
  content?: LevelData['content'];
  sessionId: string | null;
  score: number;
  setScore: (score: number) => void;
  windows: OpenWindow[];
  activeWindow: string | null;
  openWindow: (id: string, title: string, icon: string, appId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  completeSession: (finalScore: number) => void;
  startShutdown: () => void;
  completed: boolean;
}

export const SimulatedPCContext = createContext<SimulatedPCContextValue | null>(null);

export function useSimulatedPC() {
  const ctx = useContext(SimulatedPCContext);
  if (!ctx) throw new Error('useSimulatedPC must be used within SimulatedPC');
  return ctx;
}
