import { BellRing, X } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { SpeakerChip } from './SpeakerChip';

export function NotificationStack() {
  const { notifications, dismissNotification } = useSimulatedPC();
  if (notifications.length === 0) return null;

  // z above floating windows (~1000+) so notices stay visible
  return (
    <div
      className="pointer-events-none absolute right-2 top-2 flex w-72 max-w-[calc(100%-1rem)] flex-col gap-2"
      style={{ zIndex: 4000 }}
    >
      {notifications.map((n) => (
        <div key={n.id} className="plate pointer-events-auto flex items-start gap-2 border-ink p-2">
          {n.speaker ? (
            <SpeakerChip speaker={n.speaker} />
          ) : (
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-seal-ink" />
          )}
          <p className="mt-1 flex-1 font-mono text-[10px] leading-snug text-ink">{n.message}</p>
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
  );
}
