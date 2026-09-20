import { ShieldAlert } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { getApp, getAppComponent } from '../apps';
import type { AppId } from '../types';

/* Renders an installed app's content slice: the app component when valid,
   a rejection plate listing schema issues when not. */
export function AppContent({ appId }: { appId?: AppId }) {
  const { contentErrors } = useSimulatedPC();
  const issues = appId ? contentErrors[appId] : undefined;
  const App = getAppComponent(appId);

  if (issues && issues.length > 0) {
    const meta = getApp(appId);
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-stock p-6 text-center">
        <ShieldAlert className="h-8 w-8 text-strike" />
        <div>
          <p className="register !text-strike">Content Rejected — {meta?.name ?? appId}</p>
          <p className="mt-1 text-sm text-ink-soft">
            This exhibit failed validation and was withheld from the register.
          </p>
        </div>
        <ul className="max-h-40 w-full max-w-md overflow-auto border border-hairline p-3 text-left font-mono text-[11px] leading-relaxed text-ink-soft">
          {issues.slice(0, 10).map((i, n) => (
            <li key={n}>
              {i.path ? `${i.path}: ` : ''}
              {i.message}
            </li>
          ))}
          {issues.length > 10 && <li>…and {issues.length - 10} more</li>}
        </ul>
      </div>
    );
  }
  return <App />;
}
