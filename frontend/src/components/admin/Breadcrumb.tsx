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
    <nav className="mb-6 flex items-center text-sm text-slate-400">
      <Link to="/admin" className="flex items-center hover:text-white">
        <Home className="mr-1 h-4 w-4" /> Admin
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="mx-2 h-4 w-4" />
          {item.to ? (
            <Link to={item.to} className="hover:text-white">{item.label}</Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
