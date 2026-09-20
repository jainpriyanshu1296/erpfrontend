'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Upload } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Warehouse { id: string; warehouse_name: string; name: string; }
interface Item { id: string; item_code: string; item_name: string; }
interface Adjustment { id: string; adjustment_number: string; warehouse_id: string; warehouse_name: string; status: string; reason: string; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', posted: 'bg-green-100 text-green-700',
};

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [reason, setReason] = useState('');
  const [lines, setLines] = useState([{ item_id: '', quantity: '1', direction: 'increase', rate: '0' }]);

  const warehousesQuery = useQuery({ queryKey: ['warehouses-master'], queryFn: async () => { const r = await api.get<Warehouse[]>('/masters/warehouses'); return r.data || []; } });
  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const query = useQuery({
    queryKey: ['stock-adjustments'],
    queryFn: async () => {
      const r = await recordsApi('/inventory/adjustments').list({ limit: '100' });
      return (r.data || []) as Adjustment[];
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/inventory/adjustments', {
      warehouse_id: warehouseId, reason,
      items: lines.filter(l => l.item_id).map(l => ({
        item_id: l.item_id, quantity: Number(l.quantity),
        direction: l.direction, rate: Number(l.rate),
      })),
    }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['stock-adjustments'] });
      showToast('Adjustment created', 'success');
      setOpen(false); setWarehouseId(''); setReason('');
      setLines([{ item_id: '', quantity: '1', direction: 'increase', rate: '0' }]);
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => api.post(`/inventory/adjustments/${id}/post`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['stock-adjustments'] }); showToast('Adjustment posted — stock updated', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const warehouses = warehousesQuery.data || [];
  const items = itemsQuery.data || [];
  const rows = query.data || [];
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
          <h1 className="text-2xl font-bold text-slate-800">Stock Adjustments</h1>
          <p className="mt-1 text-sm text-slate-500">Post auditable stock increases or decreases with ledger entries.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Adjustment
        </button>
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">New Stock Adjustment</h2>
            <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">Warehouse *
              <select className={`mt-1 ${inp}`} value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name || w.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Reason *
              <input className={`mt-1 ${inp}`} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Physical count correction" />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Items *</p>
            {lines.map((l, i) => (
              <div key={i} className="grid items-end gap-2 mb-2 sm:grid-cols-5">
                <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Item
                  <select className={`mt-1 ${inp}`} value={l.item_id} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, item_id: e.target.value } : ll))}>
                    <option value="">Select item</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.item_code} — {it.item_name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-700">Direction
                  <select className={`mt-1 ${inp}`} value={l.direction} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, direction: e.target.value } : ll))}>
                    <option value="increase">Increase (+)</option>
                    <option value="decrease">Decrease (−)</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-700">Quantity
                  <input type="number" min="0.001" className={`mt-1 ${inp}`} value={l.quantity} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, quantity: e.target.value } : ll))} />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block flex-1 text-xs font-medium text-slate-700">Rate (₹)
                    <input type="number" className={`mt-1 ${inp}`} value={l.rate} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, rate: e.target.value } : ll))} />
                  </label>
                  <button disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} className="rounded-lg border p-2 text-red-500 disabled:opacity-30 mb-0.5"><X size={14} /></button>
                </div>
              </div>
            ))}
            <button onClick={() => setLines(ls => [...ls, { item_id: '', quantity: '1', direction: 'increase', rate: '0' }])} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600">
              <Plus size={13} className="inline mr-1" />Add item
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button disabled={createMutation.isPending || !warehouseId || !reason || !lines.some(l => l.item_id)} onClick={() => createMutation.mutate()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create Adjustment'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No adjustments" description="Create a stock adjustment to correct inventory quantities." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['Adjustment #', 'Warehouse', 'Reason', 'Status', 'Created', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{row.adjustment_number}</td>
                    <td className="px-4 py-3 text-slate-600">{row.warehouse_name || row.warehouse_id}</td>
                    <td className="px-4 py-3 text-slate-500">{row.reason || '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status] || 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{String(row.created_at || '').slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      {row.status === 'draft' && (
                        <button onClick={() => postMutation.mutate(row.id)} disabled={postMutation.isPending}
                          className="flex items-center gap-1 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50">
                          <Upload size={12} /> Post
                        </button>
                      )}
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
