import type { ReactNode } from 'react';

/* Design Annual: color keys map to semantic accents — plates + left-edge marks, never fills */
const ACCENT: Record<string, string> = {
  blue: 'border-l-seal-ink',
  green: 'border-l-confirm',
  orange: 'border-l-strike',
  red: 'border-l-strike',
  purple: 'border-l-seal-ink',
  yellow: 'border-l-strike',
  gray: 'border-l-ink-soft',
};

const BADGE: Record<string, string> = {
  essential: 'text-confirm',
  functional: 'text-seal-ink',
  analytics: 'text-ink',
  security: 'text-strike',
};

interface SectionProps { title: string; children: ReactNode; }
export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 border-b border-hairline pb-3 text-2xl font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

interface SubSectionProps { title: string; children: ReactNode; }
export function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="mb-3 text-xl font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

interface PProps { children: ReactNode; className?: string; }
export function P({ children, className = '' }: PProps) {
  return <p className={`mb-6 text-ink-soft ${className}`.trim()}>{children}</p>;
}

interface ListProps { children: ReactNode; className?: string; }
export function Ul({ children, className = '' }: ListProps) {
  return <ul className={`mb-6 list-disc space-y-1 pl-6 text-ink-soft ${className}`.trim()}>{children}</ul>;
}

export function Li({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

interface GridProps { cols?: 2 | 3 | 4; children: ReactNode; className?: string; }
export function Grid({ cols = 2, children, className = '' }: GridProps) {
  const colsClass = cols === 3 ? 'md:grid-cols-3' : cols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2';
  return <div className={`mb-6 grid gap-6 ${colsClass} ${className}`.trim()}>{children}</div>;
}

interface CalloutProps { color: keyof typeof ACCENT; title?: string | ReactNode; icon?: ReactNode; children: ReactNode; }
export function Callout({ color, title, icon, children }: CalloutProps) {
  return (
    <div className={`mb-6 border border-hairline border-l-2 bg-stock p-6 ${ACCENT[color]}`}>
      {title && (
        <h4 className="mb-3 flex items-center font-semibold text-ink">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h4>
      )}
      <div className="text-sm text-ink-soft">{children}</div>
    </div>
  );
}

interface CardProps { color: keyof typeof ACCENT; title?: string | ReactNode; icon?: ReactNode; children: ReactNode; }
export function Card({ color, title, icon, children }: CardProps) {
  return (
    <div className={`border border-hairline border-l-2 bg-stock p-6 ${ACCENT[color]}`}>
      {title && (
        <div className="mb-4 flex items-center">
          {icon && (
            <div className="mr-3 flex h-10 w-10 items-center justify-center bg-seal text-seal-ink">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
        </div>
      )}
      <div className="text-sm text-ink-soft">{children}</div>
    </div>
  );
}

interface TableProps { headers: string[]; rows: (string | ReactNode)[][]; }
export function Table({ headers, rows }: TableProps) {
  return (
    <div className="mb-6 overflow-x-auto">
      <table className="min-w-full border border-ink bg-stock">
        <thead className="bg-stock-drift">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-3 text-sm text-ink-soft">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ type, children }: { type: keyof typeof BADGE; children: ReactNode }) {
  return <span className={`inline-block border border-current px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${BADGE[type]}`}>{children}</span>;
}
