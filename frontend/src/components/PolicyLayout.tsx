import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  updated: string;
  effective: string;
  children: ReactNode;
}

export function PolicyLayout({ title, subtitle, icon: Icon, updated, effective, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-stock px-4 py-12 transition-colors sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="plate plate-strong reg-corners mb-8 opacity-0 animate-fade-in-up">
          <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-seal text-seal-ink">
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
            <p className="register">{subtitle}</p>
          </div>
          <div className="border-t border-hairline bg-stock-drift px-6 py-4 sm:px-8">
            <div className="register flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span>Last updated · {updated}</span>
              <span>Effective · {effective}</span>
            </div>
          </div>
        </div>

        <div className="plate p-6 opacity-0 animate-fade-in-up sm:p-10" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
