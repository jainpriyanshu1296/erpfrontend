'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, RefreshCw } from 'lucide-react';
import { recordsApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

type Row = Record<string, unknown>;

/** Shared analytics view. Filters are sent to the API so large tenants are not filtered in the browser. */
export function AnalyticsDashboard({ title = 'Analytics dashboard' }: { title?: string }) {
  const [period, setPeriod] = useState('month');
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['analytics', period, search],
    queryFn: () => recordsApi('/reports/analytics').list({ page: '1', limit: '100', period, ...(search ? { search } : {}) }),
  });
  const rows = (query.data?.data || []) as Row[];
  return <section className="space-y-5">
    <div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Centralized reporting</p><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-slate-500">Organization-wide snapshots with server-side period and search filters.</p></div>
    <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-3">
      <select aria-label="Reporting period" value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="month">This month</option><option value="quarter">This quarter</option><option value="year">This year</option></select>
      <input aria-label="Search reports" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter report keys..." className="min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-sm" />
      <button onClick={() => query.refetch()} className="rounded-lg border p-2 text-slate-600" aria-label="Refresh analytics"><RefreshCw size={16} /></button>
    </div>
    {query.isPending ? <Skeleton className="h-72" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> : rows.length === 0 ? <EmptyState title="No report snapshots" description="Generated reports will appear here when available." /> :
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rows.map((row, index) => <article key={String(row.id || index)} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-indigo-600"><BarChart3 size={18} /><span className="font-semibold">{String(row.report_key || 'Report')}</span></div><p className="mt-2 text-sm text-slate-500">{String(row.period_start || '')} – {String(row.period_end || '')}</p><pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{JSON.stringify(row.result ?? row, null, 2)}</pre></article>)}</div>}
  </section>;
}
