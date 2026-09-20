'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, ArrowRight } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Customer { id: string; customer_code: string; company_name: string; }
interface Item { id: string; item_code: string; item_name: string; gst_rate: number; standard_cost: number; }
interface Quotation { id: string; quotation_number: string; customer_id: string; company_name: string; status: string; total_amount: number; valid_until: string; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700', expired: 'bg-orange-100 text-orange-700',
};

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([{ item_id: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }]);

  const customersQuery = useQuery({ queryKey: ['customers-master'], queryFn: async () => { const r = await api.get<Customer[]>('/masters/customers'); return r.data || []; } });
  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const query = useQuery({
    queryKey: ['quotations', search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      const r = await recordsApi('/sales/quotations').list(params);
      return (r.data || []) as Quotation[];
    },
  });

  const total = lines.reduce((s, l) => {
    const base = Number(l.quantity) * Number(l.rate) * (1 - Number(l.discount_percent) / 100);
    return s + base + base * Number(l.gst_rate) / 100;
  }, 0);

  const createMutation = useMutation({
    mutationFn: () => api.post('/sales/quotations', {
      customer_id: customerId, valid_until: validUntil, notes,
      items: lines.filter(l => l.item_id).map(l => ({
        item_id: l.item_id, quantity: Number(l.quantity), rate: Number(l.rate),
        discount_percent: Number(l.discount_percent), gst_rate: Number(l.gst_rate),
      })),
    }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation created', 'success');
      setOpen(false); setCustomerId(''); setValidUntil(''); setNotes('');
      setLines([{ item_id: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }]);
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/sales/quotations/${id}/convert-to-order`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['quotations'] }); showToast('Converted to Sales Order', 'success'); },
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
          <h1 className="text-2xl font-bold text-slate-800">Sales Quotations</h1>
          <p className="mt-1 text-sm text-slate-500">Prepare customer quotations and convert to sales orders.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Quotation
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotations…" className="w-full outline-none text-sm" />
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">New Quotation</h2>
            <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-medium text-slate-700">Customer *
              <select className={`mt-1 ${inp}`} value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_code} — {c.company_name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Valid Until
              <input type="date" className={`mt-1 ${inp}`} value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-slate-700">Notes
              <input className={`mt-1 ${inp}`} value={notes} onChange={e => setNotes(e.target.value)} />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Line Items *</p>
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
              {createMutation.isPending ? 'Creating…' : 'Create Quotation'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No quotations" description="Create your first quotation for a customer." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['Quotation #', 'Customer', 'Total (₹)', 'Valid Until', 'Status', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{row.quotation_number}</td>
                    <td className="px-4 py-3 text-slate-600">{row.company_name || row.customer_id}</td>
                    <td className="px-4 py-3 font-semibold">₹{Number(row.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.valid_until ? String(row.valid_until).slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status] || 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td>
                    <td className="px-4 py-3">
                      {row.status === 'draft' && (
                        <button onClick={() => convertMutation.mutate(row.id)} disabled={convertMutation.isPending}
                          className="flex items-center gap-1 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50">
                          <ArrowRight size={12} /> Convert to SO
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
