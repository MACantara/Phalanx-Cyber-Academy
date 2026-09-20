import { cn } from '@/lib/utils';

export type CueRating = 'strong' | 'weak' | 'mixed';
export type CueKey = 'source' | 'author' | 'evidence' | 'recency';

const DIMS: { key: CueKey; label: string }[] = [
  { key: 'source', label: 'Source' },
  { key: 'author', label: 'Author' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'recency', label: 'Recency' },
];
const RATINGS: { value: CueRating; label: string }[] = [
  { value: 'strong', label: 'Strong' },
  { value: 'weak', label: 'Weak' },
  { value: 'mixed', label: 'Mixed' },
];

interface CueRatingsProps {
  values: Partial<Record<CueKey, CueRating>>;
  onRate: (dim: CueKey, rating: CueRating) => void;
  disabled?: boolean;
  /** Authored expected ratings — revealed after verdict for feedback. */
  reveal?: Partial<Record<CueKey, CueRating>>;
}

/* Source-triage grid: rate each credibility dimension before the verdict. */
export function CueRatings({ values, onRate, disabled, reveal }: CueRatingsProps) {
  return (
    <div>
      <p className="register mb-2">Rate the cues</p>
      <div className="space-y-1.5">
        {DIMS.map((d) => (
          <div key={d.key} className="flex items-stretch border border-hairline">
            <span className="register flex w-20 shrink-0 items-center border-r border-hairline px-2 sm:w-24 sm:px-3">
              {d.label}
            </span>
            {RATINGS.map((r) => {
              const on = values[d.key] === r.value;
              const expected = reveal?.[d.key] === r.value;
              return (
                <button
                  key={r.value}
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => onRate(d.key, r.value)}
                  className={cn(
                    'min-h-[44px] flex-1 px-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors sm:text-[11px]',
                    on
                      ? 'bg-ink text-stock'
                      : expected
                        ? 'bg-seal/50 text-seal-ink'
                        : 'text-ink-soft hover:bg-stock-green hover:text-ink',
                    disabled && 'opacity-60'
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Fraction of rated dimensions matching the authored cue set. */
export function cueAccuracy(
  expected: Partial<Record<CueKey, CueRating>> | undefined,
  values: Partial<Record<CueKey, CueRating>>
): number | undefined {
  if (!expected) return undefined;
  const dims = DIMS.map((d) => d.key).filter((k) => expected[k] !== undefined);
  if (dims.length === 0) return undefined;
  const hits = dims.filter((k) => values[k] === expected[k]).length;
  return hits / dims.length;
}
