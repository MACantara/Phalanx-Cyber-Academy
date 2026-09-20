import { useSimulatedPC } from '../context/SimulatedPCContext';
import { getApp } from '../apps';
import type { AppId } from '../types';

/* Shared launcher behavior for both shells: resolve install metadata, open a
   window for an app, or toggle it (open → focus → minimize) for rail/grid
   buttons. */
export function useAppLauncher() {
  const { environment, windows, activeWindow, openWindow, focusWindow, minimizeWindow, restoreWindow } =
    useSimulatedPC();
  const apps = environment?.apps ?? [];

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

  const launchApp = (appId: AppId) => {
    const w = windows.find((win) => win.appId === appId);
    if (!w) return openApp(appId);
    if (w.minimized) return restoreWindow(w.id);
    focusWindow(w.id);
  };

  return { apps, openApp, toggleApp, launchApp };
}
