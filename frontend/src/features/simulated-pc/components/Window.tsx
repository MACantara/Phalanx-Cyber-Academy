import { useSimulatedPC } from '../context/SimulatedPCContext';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function Window({ id, title, children }: WindowProps) {
  const { closeWindow, focusWindow, minimizeWindow, restoreWindow, windows } = useSimulatedPC();
  const windowState = windows.find((w) => w.id === id);
  const minimized = windowState?.minimized;

  const toggleMinimize = () => {
    if (minimized) {
      restoreWindow(id);
    } else {
      minimizeWindow(id);
    }
  };

  return (
    <div
      onClick={() => focusWindow(id)}
      className={`absolute left-1/2 ${minimized ? 'top-auto bottom-14' : 'top-1/2 -translate-y-1/2'} w-11/12 max-w-3xl -translate-x-1/2 transform overflow-hidden rounded border border-gray-600 bg-gray-800 shadow-2xl`}
      style={{ zIndex: windowState?.zIndex ?? 1000 }}
    >
      <div className="flex items-center justify-between border-b border-gray-600 bg-gray-700 px-3 py-2">
        <span className="text-sm font-semibold text-white">{title}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
            className="rounded bg-gray-600 px-2 py-0.5 text-xs text-white hover:bg-gray-500"
            title={minimized ? 'Restore' : 'Minimize'}
          >
            {minimized ? '□' : '—'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(id);
            }}
            className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      {!minimized && <div className="h-96 overflow-auto p-4">{children}</div>}
    </div>
  );
}
