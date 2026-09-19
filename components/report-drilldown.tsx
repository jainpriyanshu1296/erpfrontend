'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
export function ReportDrilldown({ reportKey, title }: { reportKey: string; title: string }) {
  const [from, setFrom] = useState(`${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const query = useQuery({ queryKey: ['report-drilldown', reportKey, from, to], queryFn: () => api.get<{ report: string; rows: Record<string, unknown>[] }>(`/reports/analytics/${reportKey}`, { from, to, limit: '500' }) });
  const rows = query.data?.data?.rows || [];
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  return <section className="space-y-5"><div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-500">Server-side date range and report drilldown.</p></div><div className="flex flex-wrap gap-3 rounded-xl border bg-white p-3"><label className="text-xs font-semibold">From<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 rounded border px-3 py-2 text-sm" /></label><label className="text-xs font-semibold">To<input type="date" value={to} onChange={e => setTo(e.target.value)} className="mt-1 rounded border px-3 py-2 text-sm" /></label></div>{query.isPending ? <Skeleton className="h-64" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> : !rows.length ? <EmptyState title="No rows in this period" description="Try a wider date range." /> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{columns.map(column => <th key={column} className="whitespace-nowrap p-3">{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-b last:border-0">{columns.map(column => <td key={column} className="whitespace-nowrap p-3">{String(row[column] ?? '—')}</td>)}</tr>)}</tbody></table></div>}</section>;
}
