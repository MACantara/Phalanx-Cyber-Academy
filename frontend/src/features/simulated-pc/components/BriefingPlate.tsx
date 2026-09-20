import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, X } from 'lucide-react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { SpeakerChip } from './SpeakerChip';

/* Markdown-lite inline formatting salvaged from DialogueOverlay — legacy
   dialogue content uses *emphasis* and `code` spans. */
function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-${key++}`}>{text.slice(lastIndex, match.index)}</span>
      );
    }
    if (match[1] !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`} className="italic text-seal-ink">
          {match[1]}
        </em>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-${key++}`}
          className="border border-hairline bg-stock-drift px-1 font-mono text-sm text-seal-ink"
        >
          {match[2]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`${keyPrefix}-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}

function FormattedText({ text }: { text: string }): ReactNode {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {parseInline(line, `line-${i}`)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

interface BriefingPlateProps {
  open: boolean;
  onClose: () => void;
}

/* Mission briefing plate — the overlay's job done as world furniture: a
   non-modal plate anchored to the bottom edge (full-width on handset, a
   desk card on workstation). The desk stays live behind it; COMMS reopens. */
export function BriefingPlate({ open, onClose }: BriefingPlateProps) {
  const { environment } = useSimulatedPC();
  const briefing = environment?.scenario?.briefing;
  const [page, setPage] = useState(0);
  const plateRef = useRef<HTMLDivElement>(null);

  const messages = briefing?.messages ?? [];
  const current = messages[Math.min(page, messages.length - 1)];
  const isLast = page >= messages.length - 1;

  useEffect(() => {
    if (open) plateRef.current?.focus();
  }, [open]);

  if (!open || !briefing || !current) return null;

  const next = () => (isLast ? onClose() : setPage((p) => p + 1));
  const back = () => setPage((p) => Math.max(0, p - 1));

  return (
    <div
      ref={plateRef}
      role="dialog"
      aria-modal="false"
      aria-label="Mission briefing"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          back();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }}
      className="plate absolute inset-x-2 bottom-2 z-[3500] flex max-h-[60%] flex-col border-ink outline-none sm:inset-x-auto sm:left-2 sm:max-h-[70%] sm:w-[400px]"
    >
      <div className="flex items-center gap-3 border-b border-hairline px-3 py-2">
        <span className="plate-id">PLT-COM</span>
        <SpeakerChip speaker={briefing.speaker} />
        <button
          onClick={onClose}
          aria-label="Close briefing"
          className="ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center text-ink-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 text-sm leading-relaxed text-ink sm:text-base">
        <FormattedText text={current.text} />
        {current.example && (
          <div className="mt-4 border border-hairline border-l-2 border-l-seal-ink bg-stock-drift p-3">
            <div className="register mb-2 flex items-center !text-seal-ink">
              <Lightbulb className="mr-2 h-4 w-4" /> Example
            </div>
            <div className="whitespace-pre-wrap text-xs text-ink-soft sm:text-sm">
              <FormattedText text={current.example} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-hairline px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
          COM-{String(page + 1).padStart(2, '0')} · {page + 1}/{messages.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={back}
            disabled={page === 0}
            className="flex min-h-[44px] items-center justify-center border border-hairline px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Prev
          </button>
          <button
            onClick={next}
            className="flex min-h-[44px] items-center justify-center bg-ink px-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
          >
            {isLast ? 'Acknowledge' : 'Next'}
            {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
