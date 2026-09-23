'use client';
import { useState } from 'react';
import { Pagination } from '@/components/pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Vendor { id: string; vendor_code: string; company_name: string; }
interface Item { id: string; item_code: string; item_name: string; standard_cost: number; }
interface Warehouse { id: string; warehouse_name: string; name: string; }
interface PR { id: string; pr_number: string; status: string; department: string; priority: string; required_date: string; requested_by_name: string; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('normal');
  const [requiredDate, setRequiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([{ item_id: '', quantity: '1', notes: '' }]);

  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const query = useQuery({
    queryKey: ['purchase-requisitions', search, page, limit, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const r = await recordsApi('/purchase/requisitions').list(params);
      return { rows: (r.data || []) as PR[], total: Number(r.meta?.total || 0) };
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/purchase/requisitions', {
      department, priority, required_date: requiredDate, notes,
      items: lines.filter(l => l.item_id).map(l => ({ item_id: l.item_id, quantity: Number(l.quantity), notes: l.notes })),
    }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      showToast('Requisition created', 'success');
      setOpen(false); setDepartment(''); setPriority('normal'); setRequiredDate(''); setNotes('');
      setLines([{ item_id: '', quantity: '1', notes: '' }]);
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const items = itemsQuery.data || [];
  const rows = query.data?.rows || [];
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Purchase</p>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Requisitions</h1>
          <p className="mt-1 text-sm text-slate-500">Request items for purchase approval.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Requisition
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search requisitions…" className="min-w-0 flex-1 outline-none text-sm" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {['draft', 'submitted', 'approved', 'rejected', 'converted'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">New Purchase Requisition</h2>
            <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-medium text-slate-700">Department
              <input className={`mt-1 ${inp}`} value={department} onChange={e => setDepartment(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-slate-700">Priority
              <select className={`mt-1 ${inp}`} value={priority} onChange={e => setPriority(e.target.value)}>
                {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Required Date
              <input type="date" className={`mt-1 ${inp}`} value={requiredDate} onChange={e => setRequiredDate(e.target.value)} />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Items *</p>
            {lines.map((l, i) => (
              <div key={i} className="grid items-end gap-3 mb-2 sm:grid-cols-4">
                <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Item
                  <select className={`mt-1 ${inp}`} value={l.item_id} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, item_id: e.target.value } : ll))}>
                    <option value="">Select item</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.item_code} — {it.item_name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-700">Quantity
                  <input type="number" min="0.001" className={`mt-1 ${inp}`} value={l.quantity} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, quantity: e.target.value } : ll))} />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block flex-1 text-xs font-medium text-slate-700">Notes
                    <input className={`mt-1 ${inp}`} value={l.notes} onChange={e => setLines(ls => ls.map((ll, j) => j === i ? { ...ll, notes: e.target.value } : ll))} />
                  </label>
                  <button disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} className="rounded-lg border p-2 text-red-500 disabled:opacity-30 mb-0.5"><X size={14} /></button>
                </div>
              </div>
            ))}
            <button onClick={() => setLines(ls => [...ls, { item_id: '', quantity: '1', notes: '' }])} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600">
              <Plus size={13} className="inline mr-1" />Add item
            </button>
          </div>
          <label className="block text-xs font-medium text-slate-700">Notes
            <textarea className={`mt-1 ${inp}`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button disabled={createMutation.isPending || !lines.some(l => l.item_id)} onClick={() => createMutation.mutate()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create Requisition'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No requisitions" description="Create a purchase requisition to start the procurement workflow." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['PR Number', 'Status', 'Department', 'Priority', 'Required Date', 'Requested By', ''].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{row.pr_number}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status] || 'bg-slate-100'}`}>{row.status}</span></td>
                    <td className="px-4 py-3 text-slate-600">{row.department || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.priority || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.required_date ? String(row.required_date).slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.requested_by_name || '—'}</td>
                    <td className="px-4 py-3">
                      <a href={`/purchase/requisitions/${row.id}`} className="text-indigo-600 hover:underline text-xs font-medium">View →</a>
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
