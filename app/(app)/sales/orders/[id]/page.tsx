'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton, ErrorState } from '@/components/shared';
import { useToast } from '@/components/toast';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', delivered: 'bg-emerald-100 text-emerald-700',
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['so-detail', id],
    queryFn: () => api.get<Record<string, unknown>>(`/sales/orders/${id}`),
  });

  const confirmMutation = useMutation({
    mutationFn: () => api.post(`/sales/orders/${id}/confirm`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['so-detail', id] }); showToast('Order confirmed', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/sales/orders/${id}/cancel`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['so-detail', id] }); showToast('Order cancelled', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const so = query.data?.data as Record<string, unknown>;
  const items = (so?.items as Record<string, unknown>[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/sales/orders" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        <ArrowLeft size={16} /> Back to Sales Orders
      </Link>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Sales Order</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">{String(so.so_number || '')}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[String(so.status)] || 'bg-slate-100 text-slate-600'}`}>
            {String(so.status || '')}
          </span>
        </div>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {[
            ['Customer', so.company_name || so.customer_id],
            ['Total Amount', `₹${Number(so.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
            ['Notes', so.notes],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{String(label)}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{String(val || '—')}</dd>
            </div>
          ))}
        </dl>
        {items.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Items</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs text-slate-500">
                  <tr>{['Item Code', 'Item Name', 'Qty', 'Rate (₹)', 'GST %', 'Amount (₹)'].map(h => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const base = Number(item.quantity) * Number(item.rate) * (1 - Number(item.discount_percent || 0) / 100);
                    const tax = base * Number(item.gst_rate || 0) / 100;
                    return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2 font-mono text-xs">{String(item.item_code || '—')}</td>
                        <td className="px-4 py-2">{String(item.item_name || item.item_id || '—')}</td>
                        <td className="px-4 py-2">{String(item.quantity)}</td>
                        <td className="px-4 py-2">₹{Number(item.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2">{String(item.gst_rate || 0)}%</td>
                        <td className="px-4 py-2 font-semibold">₹{(base + tax).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
          {so.status === 'draft' && (
            <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <CheckCircle size={14} /> Confirm Order
            </button>
          )}
          {so.status === 'confirmed' && (
            <Link href="/sales/challans" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              <Truck size={14} /> Create Delivery Challan
            </Link>
          )}
          {['draft', 'confirmed'].includes(String(so.status)) && (
            <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <XCircle size={14} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
