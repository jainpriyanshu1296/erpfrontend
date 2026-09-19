'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BarChart3, CircleDollarSign, ListChecks, RefreshCw } from 'lucide-react';
import { recordsApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

type Row = Record<string, unknown>;

export type DomainLink = { label: string; href: string; description: string };

type Props = {
  title: string;
  description: string;
  endpoint: string;
  links: DomainLink[];
  amountFields?: string[];
  columns?: string[];
};

const displayValue = (value: unknown) => value === null || value === undefined || value === '' ? '-' : String(value);

export function DomainOverview({ title, description, endpoint, links, amountFields = [], columns = [] }: Props) {
  const query = useQuery({
    queryKey: ['domain-overview', endpoint],
    queryFn: () => recordsApi(endpoint).list({ page: '1', limit: '20' }),
  });
  const rows = (query.data?.data || []) as Row[];
  const visibleColumns = columns.length ? columns : rows[0] ? Object.keys(rows[0]).filter(key => key !== 'id').slice(0, 5) : [];
  const amount = rows.reduce((sum, row) => sum + amountFields.reduce((inner, field) => inner + (Number(row[field]) || 0), 0), 0);
  const statuses = rows.reduce<Record<string, number>>((result, row) => {
    const status = String(row.status || '').trim();
    if (status) result[status] = (result[status] || 0) + 1;
    return result;
  }, {});

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">ERP domain</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500"><ListChecks size={16} /> Recent records</div>
          {query.isPending ? <Skeleton className="mt-3 h-8 w-20" /> : <p className="mt-2 text-2xl font-bold">{rows.length}</p>}
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500"><BarChart3 size={16} /> Status breakdown</div>
          {query.isPending ? <Skeleton className="mt-3 h-8 w-28" /> : <p className="mt-2 truncate text-sm font-semibold">{Object.entries(statuses).map(([key, value]) => `${key}: ${value}`).join(' · ') || 'No statuses yet'}</p>}
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500"><CircleDollarSign size={16} /> Amount in view</div>
          {query.isPending ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 text-2xl font-bold">₹{amount.toLocaleString('en-IN')}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map(link => <Link key={link.href} href={link.href} className="group rounded-xl border bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm">
          <div className="flex items-center justify-between font-semibold">{link.label}<ArrowRight size={17} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" /></div>
          <p className="mt-2 text-sm text-slate-500">{link.description}</p>
        </Link>)}
      </div>

      {query.isPending ? <Skeleton className="h-56" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> : rows.length === 0 ? <EmptyState title={`No ${title.toLowerCase()} records yet`} description="Create a record from one of the workspaces above to see it here." /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Recent activity</h2><button onClick={() => query.refetch()} className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50" aria-label="Refresh records"><RefreshCw size={15} /></button></div>
          <table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{visibleColumns.map(column => <th key={column} className="whitespace-nowrap p-3 font-semibold">{column.replaceAll('_', ' ')}</th>)}</tr></thead>
            <tbody>{rows.slice(0, 10).map((row, index) => <tr key={String(row.id || index)} className="border-b last:border-0">{visibleColumns.map(column => <td key={column} className="whitespace-nowrap p-3">{displayValue(row[column])}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
