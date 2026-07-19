import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-slate-300">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center rounded-xl bg-slate-800 px-4 py-2 text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center rounded-xl bg-slate-800 px-4 py-2 text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next <ChevronRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
}
