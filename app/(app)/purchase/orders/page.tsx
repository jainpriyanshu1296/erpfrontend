'use client';
import { useState } from 'react';
import { Pagination } from '@/components/pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, CheckCircle } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Vendor { id: string; vendor_code: string; company_name: string; }
interface Item { id: string; item_code: string; item_name: string; standard_cost: number; }
interface Warehouse { id: string; warehouse_name: string; name: string; }
interface PO { id: string; po_number: string; vendor_id: string; company_name: string; status: string; total_amount: number; delivery_date: string; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', approved: 'bg-green-100 text-green-700',
  sent: 'bg-blue-100 text-blue-700', part_received: 'bg-yellow-100 text-yellow-700',
  received: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
};

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([{ item_id: '', quantity: '1', rate: '0', discount_percent: '0', tax_percent: '18' }]);

  const vendorsQuery = useQuery({ queryKey: ['vendors-master'], queryFn: async () => { const r = await api.get<Vendor[]>('/masters/vendors'); return r.data || []; } });
  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const warehousesQuery = useQuery({ queryKey: ['warehouses-master'], queryFn: async () => { const r = await api.get<Warehouse[]>('/masters/warehouses'); return r.data || []; } });
  const query = useQuery({
    queryKey: ['purchase-orders', search, page, limit],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      const r = await recordsApi('/purchase/orders').list(params);
      return { rows: (r.data || []) as PO[], total: Number(r.meta?.total || 0) };
    },
  });

  const total = lines.reduce((s, l) => {
    const amt = Number(l.quantity) * Number(l.rate) * (1 - Number(l.discount_percent) / 100);
    return s + amt + amt * Number(l.tax_percent) / 100;
  }, 0);

  const createMutation = useMutation({
    mutationFn: () => api.post('/purchase/orders', {
      vendor_id: vendorId, warehouse_id: warehouseId, delivery_date: deliveryDate,
      payment_terms: Number(paymentTerms), notes,
      items: lines.filter(l => l.item_id).map(l => ({
        item_id: l.item_id, quantity: Number(l.quantity), rate: Number(l.rate),
        discount_percent: Number(l.discount_percent), tax_percent: Number(l.tax_percent),
      })),
    }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['purchase-orders'] });
      showToast('Purchase order created', 'success');
      setOpen(false); setVendorId(''); setWarehouseId(''); setDeliveryDate(''); setNotes('');
      setLines([{ item_id: '', quantity: '1', rate: '0', discount_percent: '0', tax_percent: '18' }]);
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/purchase/orders/${id}/approve`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['purchase-orders'] }); showToast('PO approved', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/purchase/orders/${id}/cancel`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['purchase-orders'] }); showToast('PO cancelled', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const vendors = vendorsQuery.data || [];
  const items = itemsQuery.data || [];
  const warehouses = warehousesQuery.data || [];
  const rows = query.data?.rows || [];
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Purchase</p>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Issue purchase orders to vendors and track delivery.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New PO
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search purchase orders…" className="w-full outline-none text-sm" />
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">New Purchase Order</h2>
            <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-medium text-slate-700">Vendor *
              <select className={`mt-1 ${inp}`} value={vendorId} onChange={e => setVendorId(e.target.value)}>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_code} — {v.company_name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Warehouse
              <select className={`mt-1 ${inp}`} value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name || w.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Delivery Date
              <input type="date" className={`mt-1 ${inp}`} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-slate-700">Payment Terms (days)
              <input type="number" className={`mt-1 ${inp}`} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Notes
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
                    setLines(ls => ls.map((ll, j) => j === i ? { ...ll, item_id: e.target.value, rate: String(it?.standard_cost || ll.rate) } : ll));
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
                <label className="block text-xs font-medium text-slate-700">Tax %
                  <input type="number" className={`mt-1 ${inp}`} value={l.tax_percent} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, tax_percent: e.target.value } : ll))} />
                </label>
                <div className="flex items-end">
                  <button disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} className="rounded-lg border p-2 text-red-500 disabled:opacity-30 mb-0.5"><X size={14} /></button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => setLines(ls => [...ls, { item_id: '', quantity: '1', rate: '0', discount_percent: '0', tax_percent: '18' }])} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600"><Plus size={13} className="inline mr-1" />Add line</button>
              <p className="text-sm font-bold text-indigo-700">Total: ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button disabled={createMutation.isPending || !vendorId || !lines.some(l => l.item_id)} onClick={() => createMutation.mutate()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create PO'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No purchase orders" description="Create a PO directly or convert an approved requisition." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['PO Number', 'Vendor', 'Total (₹)', 'Delivery', 'Status', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">
                      <a href={`/purchase/orders/${row.id}`} className="hover:underline">{row.po_number}</a>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.company_name || row.vendor_id}</td>
                    <td className="px-4 py-3 font-semibold">₹{Number(row.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.delivery_date ? String(row.delivery_date).slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status] || 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {row.status === 'draft' && (
                          <button onClick={() => approveMutation.mutate(row.id)} disabled={approveMutation.isPending}
                            className="flex items-center gap-1 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50">
                            <CheckCircle size={12} /> Approve
                          </button>
                        )}
                        {['draft', 'approved'].includes(row.status) && (
                          <button onClick={() => cancelMutation.mutate(row.id)} disabled={cancelMutation.isPending}
                            className="rounded bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">
                            Cancel
                          </button>
                        )}
                        {row.status === 'approved' && (
                          <a href="/purchase/grn" className="rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                            Create GRN
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {query.isSuccess && <Pagination page={page} limit={limit} total={query.data.total} busy={query.isFetching} onPage={setPage} onLimit={value => { setLimit(value); setPage(1); }} />}
    </div>
  );
}
