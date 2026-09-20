import { useSimulatedPC } from '../context/SimulatedPCContext';
import type { OpenWindow } from '../types';

interface WindowFrameProps {
  win: OpenWindow;
  boundsRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), Math.max(0, max));

/* Floating plate window — drag by the titlebar, click anywhere to raise.
   Apps are never unmounted (minimize only) so cross-app work keeps state. */
export function WindowFrame({ win, boundsRef, children }: WindowFrameProps) {
  const { focusWindow, minimizeWindow, moveWindow, activeWindow } = useSimulatedPC();
  const isActive = win.id === activeWindow;

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const bounds = boundsRef.current?.getBoundingClientRect();
    const frame = (e.currentTarget as HTMLElement).closest('.os-window') as HTMLElement | null;
    if (!bounds || !frame) return;
    e.preventDefault();
    focusWindow(win.id);
    const rect = frame.getBoundingClientRect();
    const grabX = e.clientX - rect.left;
    const grabY = e.clientY - rect.top;
    const onMove = (ev: PointerEvent) => {
      const fr = frame.getBoundingClientRect();
      moveWindow(
        win.id,
        Math.round(clamp(ev.clientX - bounds.left - grabX, bounds.width - fr.width)),
        Math.round(clamp(ev.clientY - bounds.top - grabY, bounds.height - fr.height))
      );
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={`os-window absolute flex-col border bg-stock ${
        win.minimized ? 'hidden' : 'flex'
      } ${isActive ? 'border-ink' : 'border-hairline'}`}
      style={{
        left: win.x ?? 48,
        top: win.y ?? 32,
        width: 'min(92vw, 880px)',
        height: '76%',
        zIndex: win.zIndex,
      }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div
        className="flex h-7 shrink-0 cursor-grab touch-none select-none items-center gap-2 border-b border-ink bg-stock-drift px-2 active:cursor-grabbing"
        onPointerDown={onDragStart}
      >
        <span className="plate-id">{win.id.toUpperCase()}</span>
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
          {win.title}
        </span>
        <button
          onClick={() => minimizeWindow(win.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Minimize ${win.title}`}
          className="ml-auto flex h-6 w-6 items-center justify-center hover:bg-stock-green"
        >
          <span className="block h-2.5 w-2.5 border border-ink" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
