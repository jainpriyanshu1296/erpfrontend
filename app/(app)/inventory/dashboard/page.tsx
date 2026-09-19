'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
export default function InventoryDashboardPage() {
  const query = useQuery({ queryKey: ['inventory-dashboard'], queryFn: () => api.get<Record<string, Record<string, unknown>>>('/inventory/dashboard') });
  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const data = query.data.data || {};
  const cards = Object.entries(data).flatMap(([group, values]) => Object.entries(values || {}).map(([key, value]) => ({ label: `${group} · ${key}`.replaceAll('_', ' '), value })));
  return <section className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p><h1 className="text-2xl font-bold">Inventory Control Dashboard</h1><p className="mt-1 text-sm text-slate-500">Live stock, transfer, reservation and count workload from the ERP.</p></div>{cards.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(card => <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-xs capitalize text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-bold text-slate-800">{String(card.value ?? 0)}</p></div>)}</div> : <EmptyState title="No inventory metrics" description="Inventory metrics will appear once operational records exist." />}</section>;
}
