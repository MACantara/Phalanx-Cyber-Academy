import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-6 flex items-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
      <Link to="/admin" className="flex min-h-[44px] items-center hover:text-ink">
        <Home className="mr-1 h-4 w-4" /> Admin
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="mx-2 h-4 w-4" />
          {item.to ? (
            <Link to={item.to} className="flex min-h-[44px] items-center hover:text-ink">{item.label}</Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
