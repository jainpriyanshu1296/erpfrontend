'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Send, XCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton, ErrorState } from '@/components/shared';
import { useToast } from '@/components/toast';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['pr-detail', id],
    queryFn: () => api.get<Record<string, unknown>>(`/purchase/requisitions/${id}`),
  });

  const action = useMutation({
    mutationFn: (act: string) => api.post(`/purchase/requisitions/${id}/${act}`, {}),
    onSuccess: (_, act) => {
      client.invalidateQueries({ queryKey: ['pr-detail', id] });
      client.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      showToast(`Requisition ${act}ted`, 'success');
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const pr = query.data?.data as Record<string, unknown>;
  const items = (pr?.items as Record<string, unknown>[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/purchase/requisitions" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        <ArrowLeft size={16} /> Back to Requisitions
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Purchase Requisition</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">{String(pr.pr_number || '')}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[String(pr.status)] || 'bg-slate-100 text-slate-600'}`}>
            {String(pr.status || '')}
          </span>
        </div>

        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {[
            ['Department', pr.department], ['Priority', pr.priority], ['Required Date', pr.required_date ? String(pr.required_date).slice(0, 10) : '—'],
            ['Requested By', pr.requested_by_name || pr.requested_by], ['Reason', pr.reason], ['Notes', pr.notes],
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
                  <tr>
                    {['Item Code', 'Item Name', 'Quantity', 'Notes'].map(h => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2 font-mono text-xs">{String(item.item_code || '—')}</td>
                      <td className="px-4 py-2">{String(item.item_name || item.item_id || '—')}</td>
                      <td className="px-4 py-2 font-semibold">{String(item.quantity || '—')}</td>
                      <td className="px-4 py-2 text-slate-500">{String(item.notes || '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
          {pr.status === 'draft' && (
            <button onClick={() => action.mutate('submit')} disabled={action.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <Send size={14} /> Submit for Approval
            </button>
          )}
          {pr.status === 'submitted' && (
            <>
              <button onClick={() => action.mutate('approve')} disabled={action.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <CheckCircle size={14} /> Approve
              </button>
              <button onClick={() => action.mutate('reject')} disabled={action.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {pr.status === 'approved' && (
            <Link href="/purchase/orders" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Create Purchase Order →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
