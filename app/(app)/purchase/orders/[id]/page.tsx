'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton, ErrorState } from '@/components/shared';
import { useToast } from '@/components/toast';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', approved: 'bg-green-100 text-green-700',
  received: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['po-detail', id],
    queryFn: () => api.get<Record<string, unknown>>(`/purchase/orders/${id}`),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/purchase/orders/${id}/approve`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['po-detail', id] }); showToast('PO approved', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/purchase/orders/${id}/cancel`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['po-detail', id] }); showToast('PO cancelled', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const po = query.data?.data as Record<string, unknown>;
  const items = (po?.items as Record<string, unknown>[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/purchase/orders" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        <ArrowLeft size={16} /> Back to Purchase Orders
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Purchase Order</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">{String(po.po_number || '')}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[String(po.status)] || 'bg-slate-100 text-slate-600'}`}>
            {String(po.status || '')}
          </span>
        </div>

        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {[
            ['Vendor', po.company_name || po.vendor_id], ['Warehouse', po.warehouse_id],
            ['Delivery Date', po.delivery_date ? String(po.delivery_date).slice(0, 10) : '—'],
            ['Payment Terms', po.payment_terms ? `${po.payment_terms} days` : '—'],
            ['Total Amount', `₹${Number(po.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
            ['Notes', po.notes],
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
                  <tr>{['Item Code', 'Item Name', 'Qty', 'Rate (₹)', 'Tax %', 'Amount (₹)'].map(h => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const amt = Number(item.quantity) * Number(item.rate);
                    const tax = amt * Number(item.tax_percent || 0) / 100;
                    return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2 font-mono text-xs">{String(item.item_code || '—')}</td>
                        <td className="px-4 py-2">{String(item.item_name || item.item_id || '—')}</td>
                        <td className="px-4 py-2">{String(item.quantity)}</td>
                        <td className="px-4 py-2">₹{Number(item.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2">{String(item.tax_percent || 0)}%</td>
                        <td className="px-4 py-2 font-semibold">₹{(amt + tax).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
          {po.status === 'draft' && (
            <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <CheckCircle size={14} /> Approve PO
            </button>
          )}
          {['draft', 'approved'].includes(String(po.status)) && (
            <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <XCircle size={14} /> Cancel
            </button>
          )}
          {po.status === 'approved' && (
            <Link href="/purchase/grn" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Create GRN →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
