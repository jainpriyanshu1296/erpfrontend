'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Send, Search } from 'lucide-react';
import { api, recordsApi, workflowApi } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Item { id: string; item_code: string; item_name: string; }
interface PR { id: string; pr_number: string; status: string; required_by: string; notes: string; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', pending: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700',
  ordered: 'bg-indigo-100 text-indigo-700', rejected: 'bg-red-100 text-red-700',
};

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ required_by: '', notes: '' });
  const [lines, setLines] = useState([{ item_id: '', quantity: '1', rate: '0' }]);
  const [savedPrId, setSavedPrId] = useState<string | null>(null);

  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const query = useQuery({ queryKey: ['purchase-requisitions'], queryFn: async () => { const r = await recordsApi('/purchase/requisitions').list({ limit: '100' }); return (r.data || []) as PR[]; } });

  const createMutation = useMutation({
    mutationFn: async () => {
      const r = await recordsApi('/purchase/requisitions').create({ ...form });
      return r.data as PR;
    },
    onSuccess: async (pr) => {
      setSavedPrId((pr as PR).id);
      await workflowApi.saveRequisitionItems((pr as PR).id, lines.map(l => ({ item_id: l.item_id, quantity: Number(l.quantity), rate: Number(l.rate) })));
      client.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      showToast('Purchase Requisition created', 'success');
      setOpen(false); setForm({ required_by: '', notes: '' }); setLines([{ item_id: '', quantity: '1', rate: '0' }]);
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => workflowApi.submitRequisition(id),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['purchase-requisitions'] }); showToast('PR submitted for approval', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const items = itemsQuery.data || [];
  const rows = ((query.data || []) as PR[]).filter(r => !search || r.pr_number?.toLowerCase().includes(search.toLowerCase()) || r.status?.includes(search.toLowerCase()));
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Purchase</p>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Requisitions</h1>
          <p className="mt-1 text-sm text-slate-500">Raise material requests for approval before ordering.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Requisition
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requisitions…" className="w-full outline-none text-sm" />
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">New Purchase Requisition</h2>
            <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">Required By
              <input type="date" className={`mt-1 ${inp}`} value={form.required_by} onChange={e => setForm(f => ({ ...f, required_by: e.target.value }))} />
            </label>
            <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Notes
              <input className={`mt-1 ${inp}`} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Reason or remarks" />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Items Required</p>
            {lines.map((line, i) => (
              <div key={i} className="grid items-end gap-3 mb-2 sm:grid-cols-4">
                <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Item
                  <select className={`mt-1 ${inp}`} value={line.item_id} onChange={e => setLines(ls => ls.map((l, j) => j === i ? { ...l, item_id: e.target.value } : l))}>
                    <option value="">Select item</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.item_code} — {it.item_name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-700">Quantity
                  <input type="number" min="0.001" className={`mt-1 ${inp}`} value={line.quantity} onChange={e => setLines(ls => ls.map((l, j) => j === i ? { ...l, quantity: e.target.value } : l))} />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block flex-1 text-xs font-medium text-slate-700">Rate (₹)
                    <input type="number" className={`mt-1 ${inp}`} value={line.rate} onChange={e => setLines(ls => ls.map((l, j) => j === i ? { ...l, rate: e.target.value } : l))} />
                  </label>
                  <button disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} className="rounded-lg border p-2 text-red-500 disabled:opacity-30 mb-0.5"><X size={14} /></button>
                </div>
              </div>
            ))}
            <button onClick={() => setLines(ls => [...ls, { item_id: '', quantity: '1', rate: '0' }])} className="mt-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Plus size={13} className="inline mr-1" />Add line
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button disabled={createMutation.isPending} onClick={() => createMutation.mutate()} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create PR'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No requisitions" description="Raise a purchase requisition to begin the procurement workflow." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['PR Number', 'Required By', 'Notes', 'Status', 'Created', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{row.pr_number}</td>
                    <td className="px-4 py-3 text-slate-600">{row.required_by ? String(row.required_by).slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{row.notes || '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status] || 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{String(row.created_at).slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      {row.status === 'draft' || row.status === 'pending' ? (
                        <button onClick={() => submitMutation.mutate(row.id)} disabled={submitMutation.isPending} className="flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
                          <Send size={12} /> Submit
                        </button>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
