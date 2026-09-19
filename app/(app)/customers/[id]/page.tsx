'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
type Timeline = { created_at: string; event_type: string; reference_id: string; description: string };
export default function Customer360Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const query = useQuery({ queryKey: ['customer-360', id], queryFn: () => api.get<{ customer: Record<string, unknown>; summary: Record<string, unknown>; timeline: Timeline[] }>(`/sales/customers/${id}/360`) });
  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const data = query.data.data;
  if (!data) return <EmptyState title="Customer not found" description="This customer may have been removed or you may not have access." />;
  return <section className="mx-auto max-w-6xl space-y-5"><button onClick={() => router.back()} className="text-sm font-medium text-indigo-600"><ArrowLeft size={15} className="mr-1 inline" />Back to customers</button><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Sales · Customer 360</p><h1 className="text-2xl font-bold">{String(data.customer.company_name || 'Customer')}</h1><p className="mt-1 text-sm text-slate-500">{String(data.customer.contact_person || '')} {String(data.customer.email || '')}</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{Object.entries(data.summary || {}).map(([key, value]) => <div key={key} className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs capitalize text-slate-500">{key.replaceAll('_', ' ')}</p><p className="mt-1 text-xl font-bold text-slate-800">{String(value ?? 0)}</p></div>)}</div><div className="rounded-xl border bg-white p-5"><h2 className="mb-4 font-semibold">Customer timeline</h2>{data.timeline?.length ? <div className="space-y-3">{data.timeline.map((event, index) => <div key={`${event.reference_id}-${index}`} className="flex gap-3 border-b pb-3 last:border-0"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" /><div><p className="text-sm font-medium capitalize">{event.description}</p><p className="text-xs text-slate-500">{event.event_type} · {String(event.created_at).slice(0, 16)}</p></div></div>)}</div> : <EmptyState title="No activity yet" description="Quotations, orders and invoices will appear here." />}</div></section>;
}
