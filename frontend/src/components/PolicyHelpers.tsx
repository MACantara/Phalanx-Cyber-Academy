import type { ReactNode } from 'react';

const CALLOUT: Record<string, { box: string; title: string; text: string }> = {
  blue: {
    box: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-800 dark:text-blue-200',
  },
  green: {
    box: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
    title: 'text-green-900 dark:text-green-100',
    text: 'text-green-800 dark:text-green-200',
  },
  orange: {
    box: 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800',
    title: 'text-orange-900 dark:text-orange-100',
    text: 'text-orange-800 dark:text-orange-200',
  },
  red: {
    box: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-800 dark:text-red-200',
  },
  purple: {
    box: 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800',
    title: 'text-purple-900 dark:text-purple-100',
    text: 'text-purple-800 dark:text-purple-200',
  },
  yellow: {
    box: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
    title: 'text-yellow-900 dark:text-yellow-100',
    text: 'text-yellow-800 dark:text-yellow-200',
  },
  gray: {
    box: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
    title: 'text-gray-900 dark:text-gray-100',
    text: 'text-gray-800 dark:text-gray-200',
  },
};

const CARD: Record<string, { box: string; title: string; text: string; iconBox: string }> = {
  blue: {
    box: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-800 dark:text-blue-200',
    iconBox: 'bg-blue-600',
  },
  green: {
    box: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
    title: 'text-green-900 dark:text-green-100',
    text: 'text-green-800 dark:text-green-200',
    iconBox: 'bg-green-600',
  },
  orange: {
    box: 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800',
    title: 'text-orange-900 dark:text-orange-100',
    text: 'text-orange-800 dark:text-orange-200',
    iconBox: 'bg-orange-600',
  },
  red: {
    box: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-800 dark:text-red-200',
    iconBox: 'bg-red-600',
  },
  purple: {
    box: 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800',
    title: 'text-purple-900 dark:text-purple-100',
    text: 'text-purple-800 dark:text-purple-200',
    iconBox: 'bg-purple-600',
  },
  gray: {
    box: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
    title: 'text-gray-900 dark:text-gray-100',
    text: 'text-gray-800 dark:text-gray-200',
    iconBox: 'bg-gray-600',
  },
};

const BADGE: Record<string, string> = {
  essential: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  functional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  analytics: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface SectionProps { title: string; children: ReactNode; }
export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

interface SubSectionProps { title: string; children: ReactNode; }
export function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface PProps { children: ReactNode; className?: string; }
export function P({ children, className = '' }: PProps) {
  return <p className={`text-gray-700 dark:text-gray-300 mb-6 ${className}`.trim()}>{children}</p>;
}

interface ListProps { children: ReactNode; className?: string; }
export function Ul({ children, className = '' }: ListProps) {
  return <ul className={`list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-1 ${className}`.trim()}>{children}</ul>;
}

export function Li({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

interface GridProps { cols?: 2 | 3 | 4; children: ReactNode; className?: string; }
export function Grid({ cols = 2, children, className = '' }: GridProps) {
  const colsClass = cols === 3 ? 'md:grid-cols-3' : cols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2';
  return <div className={`grid gap-6 ${colsClass} mb-6 ${className}`.trim()}>{children}</div>;
}

interface CalloutProps { color: keyof typeof CALLOUT; title?: string | ReactNode; icon?: ReactNode; children: ReactNode; }
export function Callout({ color, title, icon, children }: CalloutProps) {
  const c = CALLOUT[color];
  return (
    <div className={`rounded-xl p-6 mb-6 ${c.box}`}>
      {title && (
        <h4 className={`font-semibold mb-3 flex items-center ${c.title}`}>
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h4>
      )}
      <div className={`text-sm ${c.text}`}>{children}</div>
    </div>
  );
}

interface CardProps { color: keyof typeof CARD; title?: string | ReactNode; icon?: ReactNode; children: ReactNode; }
export function Card({ color, title, icon, children }: CardProps) {
  const c = CARD[color];
  return (
    <div className={`rounded-xl p-6 ${c.box}`}>
      {title && (
        <div className="flex items-center mb-4">
          {icon && (
            <div className={`mr-3 h-10 w-10 rounded-lg flex items-center justify-center text-white ${c.iconBox}`}>
              {icon}
            </div>
          )}
          <h3 className={`text-lg font-semibold ${c.title}`}>{title}</h3>
        </div>
      )}
      <div className={`text-sm ${c.text}`}>{children}</div>
    </div>
  );
}

interface TableProps { headers: string[]; rows: (string | ReactNode)[][]; }
export function Table({ headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ type, children }: { type: keyof typeof BADGE; children: ReactNode }) {
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${BADGE[type]}`}>{children}</span>;
}
