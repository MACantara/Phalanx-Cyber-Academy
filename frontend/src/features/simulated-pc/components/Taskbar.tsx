import { useEffect, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { appRegistry } from '../apps';
import { ShutdownModal } from './ShutdownModal';
import { Power, Menu } from 'lucide-react';

export function Taskbar() {
  const { windows, activeWindow, focusWindow, restoreWindow, openWindow, startShutdown, content } = useSimulatedPC();
  const [time, setTime] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('en-GB');

  const availableApps = (content?.config?.requiredApps as string[]) ?? Object.keys(appRegistry);

  const launchApp = (appId: string) => {
    setShowStart(false);
    const app = appRegistry[appId];
    if (app) openWindow(appId, app.title, '', appId);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 z-[9999] flex h-12 w-full items-center border-t border-gray-600 bg-gray-800 px-2 shadow-lg">
        <button
          onClick={() => setShowStart((s) => !s)}
          className={`flex items-center rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
            showStart
              ? 'border-green-400 bg-green-400 text-black'
              : 'border-gray-600 bg-gray-700 text-white hover:bg-green-400 hover:text-black'
          }`}
        >
          <Menu className="mr-1.5 h-4 w-4" /> Start
        </button>

        <div className="ml-3 flex flex-1 items-center space-x-2 overflow-x-auto">
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => (w.minimized ? restoreWindow(w.id) : focusWindow(w.id))}
              className={`flex-shrink-0 rounded border px-2 py-1.5 text-xs transition-colors ${
                activeWindow === w.id && !w.minimized
                  ? 'border-green-400 bg-green-400 text-black'
                  : 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
              } ${w.minimized ? 'opacity-70' : ''}`}
            >
              {w.minimized ? '▫ ' : ''}{w.title}
            </button>
          ))}
        </div>

        <div className="ml-2 flex-shrink-0 text-right text-xs text-gray-300">
          <div>{timeString}</div>
          <div>{dateString}</div>
        </div>
      </div>

      {showStart && (
        <div className="fixed bottom-14 left-2 z-[9999] w-56 overflow-hidden rounded border border-gray-600 bg-gray-800 shadow-2xl">
          <div className="border-b border-gray-700 bg-gray-700 px-3 py-2 text-xs font-semibold text-white">
            Training Apps
          </div>
          {availableApps.map((appId) => {
            const app = appRegistry[appId];
            if (!app) return null;
            const Icon = app.icon;
            return (
              <button
                key={appId}
                onClick={() => launchApp(appId)}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-white hover:bg-gray-600"
              >
                <Icon className="mr-3 h-5 w-5" />
                {app.title}
              </button>
            );
          })}
          <button
            onClick={() => {
              setShowStart(false);
              setShowShutdown(true);
            }}
            className="flex w-full items-center border-t border-gray-600 px-3 py-2 text-left text-sm text-red-300 hover:bg-gray-600"
          >
            <Power className="mr-3 h-5 w-5" />
            Shutdown
          </button>
        </div>
      )}

      {showShutdown && (
        <ShutdownModal
          onCancel={() => setShowShutdown(false)}
          onConfirm={() => {
            setShowShutdown(false);
            startShutdown();
          }}
        />
      )}
    </>
  );
}
