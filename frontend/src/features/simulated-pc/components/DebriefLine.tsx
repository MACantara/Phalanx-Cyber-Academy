import { useSimulatedPC } from '../context/SimulatedPCContext';
import { SpeakerChip } from './SpeakerChip';

/* Instructor verdict line — renders scenario.debrief on report surfaces
   (SessionReport, app verdict screens). One line, diegetic, next to the chip. */
export function DebriefLine({ className }: { className?: string }) {
  const { environment } = useSimulatedPC();
  const debrief = environment?.scenario?.debrief;
  if (!debrief) return null;

  return (
    <div className={`mx-auto flex max-w-xs items-center justify-center gap-3 text-left ${className ?? ''}`}>
      <SpeakerChip speaker={debrief.speaker} />
      <p className="text-xs leading-relaxed text-ink-soft sm:text-sm">{debrief.text}</p>
    </div>
  );
}
