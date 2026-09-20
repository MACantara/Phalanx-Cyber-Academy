import { useEffect, useState } from 'react';
import { BellRing, CheckCircle, Circle, Power, X } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { getApp, getAppComponent } from '../apps';
import { requiredObjectives } from '../lib/scenario';
import type { AppId } from '../types';

export function DesktopShell() {
  const {
    environment,
    windows,
    activeWindow,
    openWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    notifications,
    dismissNotification,
    objectivesDone,
    score,
    completed,
    startShutdown,
    startReplay,
  } = useSimulatedPC();
  const [reportDismissed, setReportDismissed] = useState(false);

  const apps = environment?.apps ?? [];
  const objectives = environment?.scenario?.objectives ?? [];
  const required = requiredObjectives(environment);
  const doneCount = objectives.filter((o) => objectivesDone.has(o.id)).length;

  const openApp = (appId: AppId) => {
    const install = apps.find((a) => a.appId === appId);
    const meta = getApp(appId);
    openWindow(`app-${appId}`, install?.label ?? meta?.name ?? appId, appId, appId);
  };

  const toggleApp = (appId: AppId) => {
    const w = windows.find((win) => win.appId === appId);
    if (!w) return openApp(appId);
    if (w.minimized) return restoreWindow(w.id);
    if (activeWindow === w.id) return minimizeWindow(w.id);
    focusWindow(w.id);
  };

  // Boot into the first installed app — legacy single-app envs land exactly
  // where the old full-screen renderer did.
  useEffect(() => {
    if (windows.length === 0 && apps.length > 0) {
      openApp(apps[0].appId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows.length, apps.length]);

  if (!environment) {
    return (
      <div className="flex h-full items-center justify-center bg-stock text-ink">
        <span className="register">No environment loaded</span>
      </div>
    );
  }

  const visibleWindow = windows.find((w) => w.id === activeWindow && !w.minimized);
  const showReport = completed && objectives.length > 0 && !reportDismissed;

  return (
    <div className="flex h-full flex-col bg-stock text-ink">
      <div className="relative flex-1 overflow-hidden">
        {!visibleWindow && !showReport && (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
            <div className="text-center">
              <span className="register">PHALANX-OS · Desktop</span>
              <p className="mt-2 max-w-sm text-sm text-ink-soft">{environment.briefing ?? environment.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {apps.map((install, i) => {
                const meta = getApp(install.appId);
                const Icon = meta?.icon;
                return (
                  <button
                    key={install.appId}
                    onClick={() => toggleApp(install.appId)}
                    className="flex min-h-[88px] w-28 flex-col items-center justify-center gap-2 border border-hairline bg-stock px-3 py-4 transition-colors hover:border-ink hover:bg-stock-green"
                  >
                    {Icon && <Icon className="h-6 w-6 text-ink" />}
                    <span className="text-xs font-semibold">{install.label ?? meta?.name ?? install.appId}</span>
                    <span className="font-mono text-[8px] tracking-[0.18em] text-ink-soft">
                      APP-{String(i + 1).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {windows.map((w) => {
          const App = getAppComponent(w.appId);
          const visible = w.id === visibleWindow?.id && !showReport;
          return (
            <div key={w.id} className={visible ? 'absolute inset-0' : 'hidden'}>
              <App />
            </div>
          );
        })}

        <div className="pointer-events-none absolute right-2 top-2 z-30 flex w-72 max-w-[calc(100%-1rem)] flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="plate pointer-events-auto flex items-start gap-2 border-ink p-2"
            >
              <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-seal-ink" />
              <p className="flex-1 font-mono text-[10px] leading-snug text-ink">{n.message}</p>
              <button
                onClick={() => dismissNotification(n.id)}
                aria-label="Dismiss notification"
                className="flex h-6 w-6 shrink-0 items-center justify-center text-ink-soft hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {showReport && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-stock/95 p-4">
            <div className="plate w-full max-w-md border-ink p-6 text-center sm:p-8">
              <span className="register">Session Report</span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Environment Complete</h2>
              <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
                {objectives.map((o) => {
                  const done = objectivesDone.has(o.id);
                  return (
                    <li key={o.id} className="flex items-start gap-2 text-sm">
                      {done ? (
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-confirm" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                      )}
                      <span className={done ? 'text-ink' : 'text-ink-soft'}>{o.description}</span>
                      <span className="ml-auto font-mono text-[10px] text-ink-soft">+{o.points}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="stamp stamp-in mx-auto my-6 flex h-28 w-28 flex-col items-center justify-center text-confirm">
                <span className="text-xl">{score}</span>
                <span className="text-[8px] tracking-[0.3em]">Marks</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  onClick={startShutdown}
                  className="min-h-[44px] bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock hover:bg-seal hover:text-seal-ink"
                >
                  Finish & Exit
                </button>
                <button
                  onClick={startReplay}
                  className="min-h-[44px] border border-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink hover:bg-stock-green"
                >
                  Replay
                </button>
                <button
                  onClick={() => setReportDismissed(true)}
                  className="min-h-[44px] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
                >
                  Keep Exploring
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="flex h-12 shrink-0 select-none items-stretch border-t border-ink bg-stock">
        <div className="register hidden items-center border-r border-hairline px-3 sm:flex">
          PHALANX-OS
        </div>
        <div className="flex min-w-0 flex-1 items-stretch">
          {apps.map((install) => {
            const meta = getApp(install.appId);
            const Icon = meta?.icon;
            const w = windows.find((win) => win.appId === install.appId);
            const isActive = w?.id === visibleWindow?.id;
            return (
              <button
                key={install.appId}
                onClick={() => toggleApp(install.appId)}
                className={`relative flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 border-r border-hairline px-3 transition-colors sm:px-4 ${
                  isActive ? 'bg-ink text-stock' : 'text-ink hover:bg-stock-green'
                }`}
                aria-label={install.label ?? meta?.name ?? install.appId}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.14em] md:inline">
                  {install.label ?? meta?.name ?? install.appId}
                </span>
                {w?.minimized && (
                  <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 bg-current opacity-60" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
        <div className="register flex items-center gap-3 border-l border-hairline px-3">
          {required.length > 0 && (
            <span>
              OBJ {doneCount}/{objectives.length}
            </span>
          )}
          <span>MRK {String(score).padStart(3, '0')}</span>
          <button
            onClick={startShutdown}
            aria-label="Shut down"
            className="flex h-8 w-8 items-center justify-center border border-hairline text-ink transition-colors hover:border-strike hover:text-strike"
          >
            <Power className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
