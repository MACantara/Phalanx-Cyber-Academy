import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  headerGradient: string;
  subtitleColor: string;
  dateBarBg: string;
  dateBarBorder: string;
  dateText: string;
  updated: string;
  effective: string;
  children: ReactNode;
}

export function PolicyLayout({
  title,
  subtitle,
  icon: Icon,
  headerGradient,
  subtitleColor,
  dateBarBg,
  dateBarBorder,
  dateText,
  updated,
  effective,
  children,
}: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 transition-colors dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl opacity-0 animate-fade-in-up dark:bg-gray-800">
          <div className={`bg-gradient-to-r ${headerGradient} px-8 py-12`}>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white">{title}</h1>
              <p className={`text-lg ${subtitleColor}`}>{subtitle}</p>
            </div>
          </div>
          <div className={`px-8 py-6 ${dateBarBg} ${dateBarBorder}`}>
            <div className={`flex items-center justify-between text-sm ${dateText}`}>
              <span><strong>Last Updated:</strong> {updated}</span>
              <span><strong>Effective Date:</strong> {effective}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white p-8 shadow-xl opacity-0 animate-fade-in-up dark:bg-gray-800 sm:p-10" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
