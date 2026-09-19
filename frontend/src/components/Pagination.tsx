import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-ink-soft">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center border border-hairline bg-stock px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Prev
      </button>
      <span className="register">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center border border-hairline bg-stock px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next <ChevronRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
}
