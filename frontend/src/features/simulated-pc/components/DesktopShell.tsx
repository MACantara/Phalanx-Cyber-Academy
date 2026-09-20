import { useEffect, useRef } from 'react';
import { Power } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { getApp, getAppComponent } from '../apps';
import { requiredObjectives } from '../lib/scenario';
import { useAppLauncher } from '../lib/useAppLauncher';
import { NotificationStack } from './NotificationStack';
import { SessionReport } from './SessionReport';
import { WindowFrame } from './WindowFrame';

export function DesktopShell() {
  const {
    environment,
    windows,
    activeWindow,
    objectivesDone,
    score,
    completed,
    shellMode,
    cycleShellMode,
    startShutdown,
  } = useSimulatedPC();
  const { apps, toggleApp, launchApp } = useAppLauncher();
  const boundsRef = useRef<HTMLDivElement>(null);

  const objectives = environment?.scenario?.objectives ?? [];
  const required = requiredObjectives(environment);
  const doneCount = objectives.filter((o) => objectivesDone.has(o.id)).length;
  // Single-app environments keep the legacy focused full-screen presentation;
  // multi-app environments float draggable plate windows over the desk.
  const floating = apps.length > 1;

  // Boot into the first installed app — legacy single-app envs land exactly
  // where the old full-screen renderer did.
  useEffect(() => {
    if (windows.length === 0 && apps.length > 0) {
      launchApp(apps[0].appId);
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

  return (
    <div className="flex h-full flex-col bg-stock text-ink">
      <div ref={boundsRef} className="relative flex-1 overflow-hidden">
        {!visibleWindow && (
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
                    onClick={() => launchApp(install.appId)}
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
          if (!floating) {
            return (
              <div key={w.id} className={w.id === visibleWindow?.id ? 'absolute inset-0' : 'hidden'}>
                <App />
              </div>
            );
          }
          return (
            <WindowFrame key={w.id} win={w} boundsRef={boundsRef}>
              <App />
            </WindowFrame>
          );
        })}

        <NotificationStack />
        {completed && <SessionReport />}
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
            onClick={cycleShellMode}
            className="hidden min-h-[32px] border border-hairline px-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-ink hover:text-ink lg:block"
            title="Cycle shell mode (auto / phone / desk)"
          >
            View·{shellMode === 'auto' ? 'AUTO' : shellMode === 'handset' ? 'PHONE' : 'DESK'}
          </button>
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
