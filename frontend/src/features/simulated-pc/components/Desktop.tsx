import { useEffect, useRef, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { getLevelComponent } from '../levels';
import { AppContent, appRegistry } from '../apps';
import { Taskbar } from './Taskbar';
import { Window } from './Window';
import { DialogueOverlay } from './DialogueOverlay';

interface IconPos {
  x: number;
  y: number;
}

export function Desktop() {
  const { windows, level, content, completed, startShutdown } = useSimulatedPC();
  const LevelComponent = getLevelComponent(level.id);

  const [dialoguePhase, setDialoguePhase] = useState<'briefing' | 'completion' | null>('briefing');
  const dialogue = dialoguePhase && content?.dialogues?.[dialoguePhase];

  useEffect(() => {
    if (completed) setDialoguePhase('completion');
  }, [completed]);

  const { openWindow } = useSimulatedPC();
  const requiredApps = (content?.config?.requiredApps as string[]) ?? Object.keys(appRegistry);

  const storageKey = `phalanx-desktop-icons-${level.id}`;
  const justDragged = useRef<Record<string, boolean>>({});

  const [positions, setPositions] = useState<Record<string, IconPos>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const defaults: Record<string, IconPos> = {};
    requiredApps.forEach((appId, index) => {
      defaults[appId] = { x: 16, y: 16 + index * 80 };
    });
    return defaults;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(positions));
    } catch {
      // ignore
    }
  }, [positions, storageKey]);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, appId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.dataTransfer.setData('application/json', JSON.stringify({ appId, offset }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    try {
      const { appId, offset } = JSON.parse(data) as { appId: string; offset: IconPos };
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;
      setPositions((prev) => ({ ...prev, [appId]: { x, y } }));
    } catch {
      // ignore malformed drag data
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = (appId: string) => {
    if (justDragged.current[appId]) {
      delete justDragged.current[appId];
      return;
    }
    const app = appRegistry[appId];
    if (app) openWindow(appId, app.title, '', appId);
  };

  const onDialogueComplete = () => {
    if (dialoguePhase === 'completion') {
      startShutdown();
      return;
    }
    setDialoguePhase(null);
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        background:
          'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,255,0,0.05) 0%, transparent 50%), linear-gradient(to bottom right, #1e40af, #1e3a8a, #312e81)',
      }}
    >
      <div className="h-full overflow-hidden p-6 pb-20">
        <LevelComponent />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[100]">
        {requiredApps.map((appId) => {
          const app = appRegistry[appId];
          if (!app) return null;
          const Icon = app.icon;
          const pos = positions[appId] ?? { x: 16, y: 16 };
          return (
            <button
              key={appId}
              draggable
              onDragStart={(e) => handleDragStart(e, appId)}
              onDragEnd={() => {
                justDragged.current[appId] = true;
              }}
              onClick={() => handleClick(appId)}
              className="pointer-events-auto absolute flex w-20 flex-col items-center gap-1 rounded border border-transparent p-2 text-white transition-colors hover:border-gray-500 hover:bg-gray-700/50"
              style={{ left: pos.x, top: pos.y }}
            >
              <Icon className="h-8 w-8" />
              <span className="w-full truncate text-center text-[10px] font-medium leading-tight">{app.title}</span>
            </button>
          );
        })}
      </div>

      {windows.map((w) => (
        <Window key={w.id} id={w.id} title={w.title}>
          <AppContent appId={w.appId} />
        </Window>
      ))}

      <Taskbar />

      {dialogue && dialoguePhase && (
        <DialogueOverlay
          character={dialogue.character}
          messages={dialogue.messages}
          onComplete={onDialogueComplete}
          storageKey={`level-${level.id}-${dialoguePhase}`}
        />
      )}
    </div>
  );
}
