import { Check } from 'lucide-react';
import { TECHNIQUES } from '../../lib/techniques';
import { cn } from '@/lib/utils';

interface TechniqueChecklistProps {
  /** Technique keys to offer — the item's authored set plus decoys. */
  options: string[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  disabled?: boolean;
  label?: string;
}

export function TechniqueChecklist({
  options,
  selected,
  onToggle,
  disabled,
  label = 'Techniques in play',
}: TechniqueChecklistProps) {
  return (
    <div>
      <p className="register mb-2">{label}</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {options.map((key) => {
          const t = TECHNIQUES[key];
          const on = selected.has(key);
          return (
            <button
              key={key}
              disabled={disabled}
              onClick={() => onToggle(key)}
              aria-pressed={on}
              className={cn(
                'flex min-h-[44px] items-center gap-2 border px-3 py-2 text-left transition-colors',
                on
                  ? 'border-ink bg-seal text-seal-ink'
                  : 'border-hairline text-ink hover:bg-stock-green',
                disabled && 'opacity-60'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center border',
                  on ? 'border-seal-ink bg-seal-ink text-seal' : 'border-ink-soft'
                )}
              >
                {on && <Check className="h-3 w-3" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
                  {t?.label ?? key}
                </span>
                {t && <span className="block truncate text-[10px] opacity-70">{t.hint}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
