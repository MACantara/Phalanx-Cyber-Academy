import { useState } from 'react';
import { ChevronLeft, Circle, Power, Radio, Square } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { getApp } from '../apps';
import { AppContent } from './AppContent';
import { requiredObjectives } from '../lib/scenario';
import { useAppLauncher } from '../lib/useAppLauncher';
import { NotificationStack } from './NotificationStack';
import { SessionReport } from './SessionReport';
import { BriefingPlate } from './BriefingPlate';

/* Handset shell — the "found phone" grammar: status bar, home-screen app
   grid, one app full-screen at a time, bottom nav (Back/Home/Switcher/Power).
   Boots to the home screen rather than straight into an app. */
export function HandsetShell() {
  const {
    environment,
    windows,
    activeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    objectivesDone,
    score,
    completed,
    shellMode,
    cycleShellMode,
    startShutdown,
  } = useSimulatedPC();
  const { apps, launchApp } = useAppLauncher();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(true);

  const objectives = environment?.scenario?.objectives ?? [];
  const required = requiredObjectives(environment);
  const doneCount = objectives.filter((o) => objectivesDone.has(o.id)).length;

  if (!environment) {
    return (
      <div className="flex h-full items-center justify-center bg-stock text-ink">
        <span className="register">No environment loaded</span>
      </div>
    );
  }

  const visibleWindow = windows.find((w) => w.id === activeWindow && !w.minimized);
  const runningWindows = windows;

  const goHome = () => {
    setSwitcherOpen(false);
    if (visibleWindow) minimizeWindow(visibleWindow.id);
  };

  const goBack = () => {
    if (switcherOpen) return setSwitcherOpen(false);
    if (visibleWindow) minimizeWindow(visibleWindow.id);
  };

  return (
    <div className="flex h-full flex-col bg-stock text-ink">
      {/* status bar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-hairline bg-stock px-3">
        <span className="register !text-[9px]">PHALANX · MOBILE</span>
        <div className="register flex items-center gap-2 !text-[9px]">
          {required.length > 0 && <span>OBJ {doneCount}/{objectives.length}</span>}
          <span>MRK {String(score).padStart(3, '0')}</span>
          <button
            onClick={cycleShellMode}
            className="min-h-[24px] border border-hairline px-1.5 font-mono uppercase tracking-[0.14em] text-ink-soft"
            title="Cycle shell mode (auto / phone / desk)"
          >
            {shellMode === 'auto' ? 'AUTO' : shellMode === 'handset' ? 'PHONE' : 'DESK'}
          </button>
        </div>
      </div>

      {/* content */}
      <div className="relative flex-1 overflow-hidden">
        {!visibleWindow && (
          <div className="flex h-full flex-col overflow-auto p-4">
            <div className="mb-4">
              <span className="register">Plate register</span>
              <p className="mt-1 text-sm text-ink-soft">{environment.briefing ?? environment.title}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {apps.map((install, i) => {
                const meta = getApp(install.appId);
                const Icon = meta?.icon;
                const running = windows.some((w) => w.appId === install.appId);
                return (
                  <button
                    key={install.appId}
                    onClick={() => launchApp(install.appId)}
                    className="relative flex min-h-[96px] flex-col items-center justify-center gap-2 border border-hairline bg-stock px-2 py-4 transition-colors hover:border-ink hover:bg-stock-green"
                  >
                    {Icon && <Icon className="h-7 w-7 text-ink" />}
                    <span className="text-xs font-semibold">{install.label ?? meta?.name ?? install.appId}</span>
                    <span className="font-mono text-[8px] tracking-[0.18em] text-ink-soft">
                      APP-{String(i + 1).padStart(2, '0')}
                    </span>
                    {running && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-confirm" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
            {required.length > 0 && (
              <div className="mt-4 border border-hairline p-3">
                <span className="register">Objectives</span>
                <ul className="mt-2 space-y-1.5">
                  {objectives.map((o) => {
                    const done = objectivesDone.has(o.id);
                    return (
                      <li key={o.id} className="flex items-center gap-2 text-xs">
                        <span className={`h-1.5 w-1.5 shrink-0 ${done ? 'bg-confirm' : 'border border-hairline'}`} />
                        <span className={done ? 'text-ink' : 'text-ink-soft'}>{o.description}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {windows.map((w) => (
          <div key={w.id} className={w.id === visibleWindow?.id ? 'absolute inset-0' : 'hidden'}>
            <AppContent appId={w.appId} />
          </div>
        ))}

        <NotificationStack />
        <BriefingPlate open={briefingOpen} onClose={() => setBriefingOpen(false)} />
        {completed && <SessionReport />}

        {/* recents sheet */}
        {switcherOpen && (
          <div className="absolute inset-x-0 bottom-0 z-[4500] border-t border-ink bg-stock p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="register">Running plates</span>
              <button
                onClick={() => setSwitcherOpen(false)}
                className="register min-h-[32px] px-2 text-ink-soft hover:text-ink"
              >
                Close
              </button>
            </div>
            {environment.scenario?.briefing && (
              <button
                onClick={() => {
                  setSwitcherOpen(false);
                  setBriefingOpen(true);
                }}
                className="mb-1.5 flex min-h-[48px] w-full items-center gap-3 border border-hairline bg-stock px-3 text-left text-ink hover:bg-stock-green"
              >
                <Radio className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-sm font-semibold">Mission briefing</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">Comms</span>
              </button>
            )}
            {runningWindows.length === 0 ? (
              <p className="py-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                No running apps
              </p>
            ) : (
              <ul className="space-y-1.5">
                {runningWindows.map((w) => {
                  const meta = getApp(w.appId);
                  const Icon = meta?.icon;
                  return (
                    <li key={w.id}>
                      <button
                        onClick={() => {
                          setSwitcherOpen(false);
                          if (w.minimized) restoreWindow(w.id);
                          else focusWindow(w.id);
                        }}
                        className={`flex min-h-[48px] w-full items-center gap-3 border px-3 text-left ${
                          w.id === activeWindow && !w.minimized
                            ? 'border-ink bg-ink text-stock'
                            : 'border-hairline bg-stock text-ink hover:bg-stock-green'
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span className="flex-1 truncate text-sm font-semibold">{w.title}</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
                          {w.minimized ? 'Min' : 'Open'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* bottom nav */}
      <nav className="flex h-14 shrink-0 items-stretch border-t border-ink bg-stock">
        <button
          onClick={goBack}
          aria-label="Back"
          className="flex min-w-[64px] flex-1 items-center justify-center text-ink transition-colors hover:bg-stock-green"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goHome}
          aria-label="Home"
          className="flex min-w-[64px] flex-1 items-center justify-center text-ink transition-colors hover:bg-stock-green"
        >
          <Circle className="h-4 w-4" />
        </button>
        <button
          onClick={() => setSwitcherOpen((s) => !s)}
          aria-label="Recents"
          className={`flex min-w-[64px] flex-1 items-center justify-center transition-colors ${
            switcherOpen ? 'bg-ink text-stock' : 'text-ink hover:bg-stock-green'
          }`}
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          onClick={startShutdown}
          aria-label="Power off"
          className="flex min-w-[64px] flex-1 items-center justify-center text-ink transition-colors hover:text-strike"
        >
          <Power className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
