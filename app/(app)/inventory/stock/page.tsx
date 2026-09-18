'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';

interface StockRow {
  item_id: string; warehouse_id: string; current_qty: number; avg_rate: number;
  total_value: number; last_updated: string; item_code: string; item_name: string;
  warehouse_name: string; uom_id: string;
}

export default function StockPage() {
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['inventory-stock'],
    queryFn: async () => { const r = await api.get<StockRow[]>('/inventory/stock', { limit: '200' }); return r.data || []; },
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rows = (query.data || []).filter(r =>
    !search || r.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.item_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.warehouse_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = rows.reduce((s, r) => s + Number(r.total_value || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
        <h1 className="text-2xl font-bold text-slate-800">Stock Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Live stock quantities, valuation and warehouse balances.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total SKUs</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{rows.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Inventory Value</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500">Low Stock Items</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{rows.filter(r => Number(r.current_qty) <= 0).length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by item name, code or warehouse..." className="w-full outline-none text-sm" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No stock records" description="Stock is updated automatically when GRNs are posted or stock adjustments are made." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs text-slate-500">
              <tr>
                {['Item Code', 'Item Name', 'Warehouse', 'Qty', 'Avg Rate (₹)', 'Value (₹)', 'Last Updated'].map(h => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b last:border-0 hover:bg-indigo-50/40 ${Number(row.current_qty) <= 0 ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.item_code || '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.item_name || row.item_id}</td>
                  <td className="px-4 py-3 text-slate-600">{row.warehouse_name || row.warehouse_id}</td>
                  <td className={`px-4 py-3 font-semibold ${Number(row.current_qty) <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {Number(row.current_qty).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{Number(row.avg_rate).toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">
                    ₹{Number(row.total_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{String(row.last_updated || '').slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
