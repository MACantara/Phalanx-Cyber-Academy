import { useSimulatedPC } from '../context/SimulatedPCContext';
import { resolveSpeaker } from '../lib/characters';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';

/* Persona plate — shared by scenes, the briefing plate, notifications, and
   report surfaces. Resolved speakers get avatar + name + role tag; unknown
   keys fall back to the bare label so free-text speakers still display. */
export function SpeakerChip({ speaker }: { speaker?: string }) {
  const { environment } = useSimulatedPC();
  const reducedMotion = usePrefersReducedMotion();
  if (!speaker) return null;

  const resolved = resolveSpeaker(speaker, environment);
  if (!resolved) {
    return <p className="register !text-seal-ink">{speaker}</p>;
  }

  const src =
    reducedMotion && resolved.avatarStatic ? resolved.avatarStatic : resolved.avatar;

  return (
    <div className="flex items-center gap-2.5">
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="h-9 w-9 shrink-0 border border-hairline bg-stock-drift object-cover"
        />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight text-ink">{resolved.name}</p>
        {resolved.role && (
          <p className="register mt-0.5 !text-[9px] !text-seal-ink">{resolved.role}</p>
        )}
      </div>
    </div>
  );
}
