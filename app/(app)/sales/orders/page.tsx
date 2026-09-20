'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, CheckCircle, Truck } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Customer { id: string; customer_code: string; company_name: string; }
interface Item { id: string; item_code: string; item_name: string; standard_cost: number; gst_rate: number; }
interface SO { id: string; so_number: string; customer_id: string; company_name: string; status: string; total_amount: number; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', delivered: 'bg-emerald-100 text-emerald-700',
};

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([{ item_id: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }]);

  const customersQuery = useQuery({ queryKey: ['customers-master'], queryFn: async () => { const r = await api.get<Customer[]>('/masters/customers'); return r.data || []; } });
  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const query = useQuery({
    queryKey: ['sales-orders', search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      const r = await recordsApi('/sales/orders').list(params);
      return (r.data || []) as SO[];
    },
  });

  const total = lines.reduce((s, l) => {
    const base = Number(l.quantity) * Number(l.rate) * (1 - Number(l.discount_percent) / 100);
    return s + base + base * Number(l.gst_rate) / 100;
  }, 0);

  const createMutation = useMutation({
    mutationFn: () => api.post('/sales/orders', {
      customer_id: customerId, notes,
      items: lines.filter(l => l.item_id).map(l => ({
        item_id: l.item_id, quantity: Number(l.quantity), rate: Number(l.rate),
        discount_percent: Number(l.discount_percent), gst_rate: Number(l.gst_rate),
      })),
    }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['sales-orders'] });
      showToast('Sales order created', 'success');
      setOpen(false); setCustomerId(''); setNotes('');
      setLines([{ item_id: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }]);
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.post(`/sales/orders/${id}/confirm`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['sales-orders'] }); showToast('Order confirmed', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/sales/orders/${id}/cancel`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['sales-orders'] }); showToast('Order cancelled', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const customers = customersQuery.data || [];
  const items = itemsQuery.data || [];
  const rows = query.data || [];
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Sales</p>
          <h1 className="text-2xl font-bold text-slate-800">Sales Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Confirm customer orders and create delivery challans.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sales orders…" className="w-full outline-none text-sm" />
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">New Sales Order</h2>
            <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">Customer *
              <select className={`mt-1 ${inp}`} value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_code} — {c.company_name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Notes
              <input className={`mt-1 ${inp}`} value={notes} onChange={e => setNotes(e.target.value)} />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Items *</p>
            {lines.map((l, i) => (
              <div key={i} className="grid items-end gap-2 mb-2 sm:grid-cols-6">
                <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Item
                  <select className={`mt-1 ${inp}`} value={l.item_id} onChange={e => {
                    const it = items.find(x => x.id === e.target.value);
                    setLines(ls => ls.map((ll, j) => j === i ? { ...ll, item_id: e.target.value, rate: String(it?.standard_cost || ll.rate), gst_rate: String(it?.gst_rate || ll.gst_rate) } : ll));
                  }}>
                    <option value="">Select item</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.item_code} — {it.item_name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-700">Qty
                  <input type="number" min="0.001" className={`mt-1 ${inp}`} value={l.quantity} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, quantity: e.target.value } : ll))} />
                </label>
                <label className="block text-xs font-medium text-slate-700">Rate (₹)
                  <input type="number" className={`mt-1 ${inp}`} value={l.rate} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, rate: e.target.value } : ll))} />
                </label>
                <label className="block text-xs font-medium text-slate-700">GST %
                  <input type="number" className={`mt-1 ${inp}`} value={l.gst_rate} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, gst_rate: e.target.value } : ll))} />
                </label>
                <div className="flex items-end">
                  <button disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} className="rounded-lg border p-2 text-red-500 disabled:opacity-30 mb-0.5"><X size={14} /></button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => setLines(ls => [...ls, { item_id: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }])} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600"><Plus size={13} className="inline mr-1" />Add line</button>
              <p className="text-sm font-bold text-indigo-700">Total: ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button disabled={createMutation.isPending || !customerId || !lines.some(l => l.item_id)} onClick={() => createMutation.mutate()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No sales orders" description="Create a sales order or convert a quotation." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['SO Number', 'Customer', 'Total (₹)', 'Status', 'Created', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">
                      <a href={`/sales/orders/${row.id}`} className="hover:underline">{row.so_number}</a>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.company_name || row.customer_id}</td>
                    <td className="px-4 py-3 font-semibold">₹{Number(row.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status] || 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{String(row.created_at || '').slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {row.status === 'draft' && (
                          <button onClick={() => confirmMutation.mutate(row.id)} disabled={confirmMutation.isPending}
                            className="flex items-center gap-1 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50">
                            <CheckCircle size={12} /> Confirm
                          </button>
                        )}
                        {row.status === 'confirmed' && (
                          <a href="/sales/challans" className="flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                            <Truck size={12} /> Create Challan
                          </a>
                        )}
                        {['draft', 'confirmed'].includes(row.status) && (
                          <button onClick={() => cancelMutation.mutate(row.id)} disabled={cancelMutation.isPending}
                            className="rounded bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">
                            Cancel
                          </button>
                        )}
                      </div>
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
