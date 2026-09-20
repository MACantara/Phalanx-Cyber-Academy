import { cn } from '@/lib/utils';

export type Confidence = 'low' | 'mid' | 'high';

const OPTIONS: { value: Confidence; label: string }[] = [
  { value: 'low', label: 'Guessing' },
  { value: 'mid', label: 'Fairly sure' },
  { value: 'high', label: 'Certain' },
];

interface ConfidenceControlProps {
  value: Confidence | undefined;
  onChange: (c: Confidence) => void;
  disabled?: boolean;
}

export function ConfidenceControl({ value, onChange, disabled }: ConfidenceControlProps) {
  return (
    <div className="flex items-stretch border border-hairline" role="radiogroup" aria-label="Confidence">
      <span className="register flex items-center border-r border-hairline px-3">Confidence</span>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            'min-h-[44px] flex-1 px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
            value === o.value
              ? 'bg-ink text-stock'
              : 'text-ink-soft hover:bg-stock-green hover:text-ink',
            disabled && 'opacity-50'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
