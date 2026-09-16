interface PaginationFooterProps {
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (newPage: number) => void;
}

export default function PaginationFooter({
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: PaginationFooterProps) {
  return (
    <footer className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-sm text-slate-400">
      <button
        type="button"
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={!hasPreviousPage}
        className="inline-flex items-center cursor-pointer gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <span className="font-medium text-slate-300">
        Page <span className="font-semibold text-white">{pageNumber}</span> of{" "}
        <span className="font-semibold text-white">{totalPages || 1}</span>
      </span>

      <button
        type="button"
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={!hasNextPage}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </footer>
  );
}