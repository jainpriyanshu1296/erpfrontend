'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';
import { Pagination } from '@/components/pagination';

interface Warehouse { id: string; warehouse_code: string; warehouse_name: string; address: string; city: string; is_default: number; is_active: number; }

export default function Page() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [page,setPage]=useState(1);
  const [limit,setLimit]=useState(20);
  const [sort,setSort]=useState('warehouse_name');
  const [active,setActive]=useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [warehouseCode, setWarehouseCode] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive,setIsActive]=useState(true);

  const query = useQuery({
    queryKey: ['inventory-warehouses',search,page,limit,sort,active],
    queryFn: async () => { const params=new URLSearchParams({search,page:String(page),limit:String(limit),sort});if(active) params.set('is_active',active);const r = await api.get<Warehouse[]>(`/inventory/warehouses?${params}`); return {rows:r.data || [],total:Number(r.meta?.total || 0)}; },
  });

  const resetForm = () => { setWarehouseCode(''); setWarehouseName(''); setAddress(''); setCity(''); setIsDefault(false); setEditing(null); setOpen(false); };

  const openEdit = (w: Warehouse) => {
    setEditing(w); setWarehouseCode(w.warehouse_code || ''); setWarehouseName(w.warehouse_name || '');
    setAddress(w.address || ''); setCity(w.city || ''); setIsDefault(Boolean(w.is_default)); setIsActive(Boolean(w.is_active)); setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: () => api.post('/inventory/warehouses', { warehouse_code: warehouseCode, warehouse_name: warehouseName, address, city, is_default: isDefault }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['inventory-warehouses'] }); showToast('Warehouse created', 'success'); resetForm(); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/inventory/warehouses/${editing!.id}`, { warehouse_code: warehouseCode, warehouse_name: warehouseName, address, city, is_default: isDefault ? 1 : 0,is_active:isActive?1:0 }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['inventory-warehouses'] }); showToast('Warehouse updated', 'success'); resetForm(); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const rows = query.data?.rows || [];
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
          <h1 className="text-2xl font-bold text-slate-800">Warehouses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage storage locations used for stock movements.</p>
        </div>
        <button onClick={() => { resetForm(); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Warehouse
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => {setSearch(e.target.value);setPage(1);}} placeholder="Search warehouses…" className="w-full outline-none text-sm" />
        <select aria-label="Active state" value={active} onChange={e=>{setActive(e.target.value);setPage(1);}}><option value="">All states</option><option value="1">Active</option><option value="0">Inactive</option></select>
        <select aria-label="Sort warehouses" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="warehouse_name">Name</option><option value="warehouse_code">Code</option><option value="city">City</option></select>
      </div>

      {open && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">{editing ? 'Edit Warehouse' : 'New Warehouse'}</h2>
            <button onClick={resetForm}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">Warehouse Code
              <input className={`mt-1 ${inp}`} value={warehouseCode} onChange={e => setWarehouseCode(e.target.value)} placeholder="e.g. WH-01" />
            </label>
            <label className="block text-xs font-medium text-slate-700">Warehouse Name *
              <input className={`mt-1 ${inp}`} value={warehouseName} onChange={e => setWarehouseName(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-slate-700">Address
              <input className={`mt-1 ${inp}`} value={address} onChange={e => setAddress(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-slate-700">City
              <input className={`mt-1 ${inp}`} value={city} onChange={e => setCity(e.target.value)} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded" />
            Set as default warehouse
          </label>
          {editing && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} />Active warehouse</label>}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={resetForm} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button
              disabled={(editing ? updateMutation.isPending : createMutation.isPending) || !warehouseName}
              onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {(editing ? updateMutation.isPending : createMutation.isPending) ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {query.isPending ? <Skeleton className="h-48" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No warehouses" description="Create a warehouse to start tracking stock locations." /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>{['Code', 'Name', 'City', 'Address', 'Default', 'Active', ''].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.warehouse_code || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.warehouse_name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.city || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{row.address || '—'}</td>
                    <td className="px-4 py-3">{row.is_default ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Yes</span> : '—'}</td>
                    <td className="px-4 py-3">{row.is_active ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Active</span> : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Inactive</span>}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(row)} className="flex items-center gap-1 rounded bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                        <Pencil size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {query.isSuccess && <Pagination page={page} limit={limit} total={query.data.total} busy={query.isFetching} onPage={setPage} onLimit={value=>{setLimit(value);setPage(1);}} />}
    </div>
  );
}
