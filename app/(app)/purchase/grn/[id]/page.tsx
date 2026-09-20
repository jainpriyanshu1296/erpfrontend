'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton, ErrorState } from '@/components/shared';
import { useToast } from '@/components/toast';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', posted: 'bg-green-100 text-green-700',
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['grn-detail', id],
    queryFn: () => api.get<Record<string, unknown>>(`/purchase/receipts/${id}`),
  });

  const postMutation = useMutation({
    mutationFn: () => api.post(`/purchase/receipts/${id}/post`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['grn-detail', id] }); showToast('GRN posted — inventory updated', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const grn = query.data?.data as Record<string, unknown>;
  const items = (grn?.items as Record<string, unknown>[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/purchase/grn" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        <ArrowLeft size={16} /> Back to GRNs
      </Link>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Goods Receipt Note</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">{String(grn.grn_number || '')}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[String(grn.status)] || 'bg-slate-100 text-slate-600'}`}>
            {String(grn.status || '')}
          </span>
        </div>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {[
            ['Vendor', grn.company_name || grn.vendor_id], ['PO Number', grn.po_number || '—'],
            ['Warehouse', grn.warehouse_id], ['Received Date', grn.received_date ? String(grn.received_date).slice(0, 10) : '—'],
            ['Posted At', grn.posted_at ? String(grn.posted_at).slice(0, 16) : '—'], ['Notes', grn.notes],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{String(label)}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{String(val || '—')}</dd>
            </div>
          ))}
        </dl>
        {items.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Items Received</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs text-slate-500">
                  <tr>{['Item Code', 'Item Name', 'Qty', 'Rate (₹)', 'Value (₹)'].map(h => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2 font-mono text-xs">{String(item.item_code || '—')}</td>
                      <td className="px-4 py-2">{String(item.item_name || item.item_id || '—')}</td>
                      <td className="px-4 py-2 font-semibold">{String(item.quantity)}</td>
                      <td className="px-4 py-2">₹{Number(item.rate || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 font-semibold text-indigo-700">₹{(Number(item.quantity) * Number(item.rate || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-6 border-t pt-4">
          {grn.status === 'draft' ? (
            <>
              <button onClick={() => postMutation.mutate()} disabled={postMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Upload size={14} /> Post GRN to Inventory
              </button>
              <p className="mt-2 text-xs text-slate-500">Posting increases stock in the warehouse and creates ledger entries.</p>
            </>
          ) : (
            <p className="text-sm font-medium text-green-700">✓ GRN posted — inventory has been updated.</p>
          )}
        </div>
      </div>
    </div>
  );
}
