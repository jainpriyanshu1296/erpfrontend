'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
export default function ProductionDashboardPage() {
  const query = useQuery({ queryKey: ['production-dashboard'], queryFn: () => api.get<Record<string, unknown>>('/production/dashboard') });
  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const data = query.data.data || {};
  const entries = Object.entries(data);
  return <section className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Manufacturing</p><h1 className="text-2xl font-bold">Production Dashboard</h1><p className="mt-1 text-sm text-slate-500">Live work order, job card and material issue workload.</p></div>{entries.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{entries.map(([key, value]) => <div key={key} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-xs capitalize text-slate-500">{key.replaceAll('_', ' ')}</p><p className="mt-2 text-2xl font-bold text-slate-800">{String(value ?? 0)}</p></div>)}</div> : <EmptyState title="No production metrics" description="Production metrics will appear after work is scheduled." />}</section>;
}
