import { FileSearch, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitePromptProps {
  evidenceTitle: string;
  citing: boolean;
  done: boolean;
  onArm: () => void;
}

/* Cite-before-choose prompt on a locked case choice. First tap arms cite
   mode (switches focus to the exhibit); marking the proving line inside
   the viewer completes the citation. */
export function CitePrompt({ evidenceTitle, citing, done, onArm }: CitePromptProps) {
  if (done) {
    return (
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-confirm">
        <FileSearch className="h-3.5 w-3.5" /> Cited
      </span>
    );
  }
  return (
    <button
      onClick={onArm}
      className={cn(
        'flex min-h-[44px] items-center gap-2 border border-dashed px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors',
        citing
          ? 'border-seal-ink bg-seal text-seal-ink'
          : 'border-ink-soft text-ink-soft hover:border-ink hover:text-ink'
      )}
    >
      {citing ? <FileSearch className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
      {citing ? `Mark the proving line in ${evidenceTitle}` : `Requires citation — ${evidenceTitle}`}
    </button>
  );
}
