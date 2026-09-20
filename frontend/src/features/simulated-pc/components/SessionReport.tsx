import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { DebriefLine } from './DebriefLine';

/* Environment-level session report — overlays the shell when all required
   objectives are met. Legacy single-app envs declare no objectives and keep
   their per-app report screens instead. */
export function SessionReport() {
  const { environment, objectivesDone, score, startShutdown, startReplay } = useSimulatedPC();
  const [dismissed, setDismissed] = useState(false);
  const objectives = environment?.scenario?.objectives ?? [];

  if (objectives.length === 0 || dismissed) return null;

  // z above floating windows (~1000+) so the report always covers the desk
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-stock/95 p-4"
      style={{ zIndex: 5000 }}
    >
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
        <DebriefLine className="mt-5" />
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
            onClick={() => setDismissed(true)}
            className="min-h-[44px] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
