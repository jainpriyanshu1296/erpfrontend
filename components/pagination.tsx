'use client';

export function positiveInteger(value: unknown, fallback: number, max = 1000000) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, max) : fallback;
}

export function Pagination({ page, limit, total, busy = false, onPage, onLimit }: {
  page: number; limit: number; total: number; busy?: boolean;
  onPage: (page: number) => void; onLimit: (limit: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 text-sm">
    <span>{total} records · Page {page} of {pages}</span>
    <div className="flex items-center gap-2">
      <label>Rows <select aria-label="Rows per page" value={limit} disabled={busy} onChange={event => onLimit(Number(event.target.value))} className="rounded border p-2">{[10,20,50,100].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
      <button type="button" disabled={busy || page <= 1} onClick={() => onPage(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button>
      <button type="button" disabled={busy || page >= pages} onClick={() => onPage(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button>
    </div>
  </nav>;
}
