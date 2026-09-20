import { Flag } from 'lucide-react';
import { bodyLines, regionKey } from '../../lib/evidence';
import { cn } from '@/lib/utils';

interface FlaggableBodyProps {
  body: string;
  marked: Set<string>;
  onToggle: (key: string) => void;
  disabled?: boolean;
  /** Authored-flag coverage shown after verdict (review mode): lines whose
      region hits an authored flag get a marker regardless of learner marks. */
  revealMatches?: string[];
}

/* Tap-to-flag email body: each line is a tappable block. Lines containing
   authored evidence reveal a FLAG corner after the verdict. */
export function FlaggableBody({ body, marked, onToggle, disabled, revealMatches }: FlaggableBodyProps) {
  return (
    <div className="flex-1 overflow-auto p-4 sm:p-5">
      <div className="space-y-1">
        {bodyLines(body).map((line, i) => {
          const key = regionKey.body(i);
          const on = marked.has(key);
          const authored = revealMatches?.some((m) => line.includes(m));
          return (
            <button
              key={key}
              disabled={disabled}
              onClick={() => onToggle(key)}
              aria-pressed={on}
              className={cn(
                'block w-full border px-3 py-2.5 text-left text-sm leading-relaxed transition-colors',
                on
                  ? 'border-strike bg-strike/10 text-ink'
                  : authored
                    ? 'border-dashed border-strike/60 text-ink'
                    : 'border-transparent text-ink hover:border-hairline hover:bg-stock-drift',
                disabled && 'cursor-default'
              )}
            >
              <span className="flex items-start gap-2">
                <Flag
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                    on ? 'text-strike' : authored ? 'text-strike/60' : 'text-hairline'
                  )}
                />
                <span className="whitespace-pre-wrap">{line}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
