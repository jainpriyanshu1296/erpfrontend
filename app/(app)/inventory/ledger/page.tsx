'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';

interface LedgerRow {
  id: string; item_id: string; item_code: string; item_name: string;
  warehouse_id: string; warehouse_name: string; transaction_type: string;
  reference_type: string; reference_id: string; qty_in: number; qty_out: number;
  balance_qty: number; rate: number; amount: number; transaction_date: string;
}
interface Item { id: string; item_code: string; item_name: string; }
interface Warehouse { id: string; warehouse_name: string; name: string; }

const TX_COLOR: Record<string, string> = {
  purchase_receipt: 'bg-green-100 text-green-700', purchase_return: 'bg-red-100 text-red-700',
  sales_dispatch: 'bg-orange-100 text-orange-700', transfer_in: 'bg-blue-100 text-blue-700',
  transfer_out: 'bg-purple-100 text-purple-700', adjustment_in: 'bg-teal-100 text-teal-700',
  adjustment_out: 'bg-yellow-100 text-yellow-700', opening_stock: 'bg-slate-100 text-slate-700',
};

export default function Page() {
  const [itemId, setItemId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [txType, setTxType] = useState('');
  const [page, setPage] = useState(1);

  const itemsQuery = useQuery({ queryKey: ['items-master'], queryFn: async () => { const r = await api.get<Item[]>('/masters/items'); return r.data || []; } });
  const warehousesQuery = useQuery({ queryKey: ['warehouses-master'], queryFn: async () => { const r = await api.get<Warehouse[]>('/masters/warehouses'); return r.data || []; } });

  const query = useQuery({
    queryKey: ['stock-ledger', itemId, warehouseId, txType, page],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50', page: String(page) };
      if (itemId) params.item_id = itemId;
      if (warehouseId) params.warehouse_id = warehouseId;
      if (txType) params.transaction_type = txType;
      const r = await api.get<LedgerRow[]>('/inventory/ledger', params);
      return r.data || [];
    },
  });

  const items = itemsQuery.data || [];
  const warehouses = warehousesQuery.data || [];
  const rows = query.data || [];
  const sel = 'rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
        <h1 className="text-2xl font-bold text-slate-800">Stock Ledger</h1>
        <p className="mt-1 text-sm text-slate-500">Every stock movement — receipts, dispatches, transfers, adjustments.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <select value={itemId} onChange={e => { setItemId(e.target.value); setPage(1); }} className={sel}>
          <option value="">All items</option>
          {items.map(it => <option key={it.id} value={it.id}>{it.item_code} — {it.item_name}</option>)}
        </select>
        <select value={warehouseId} onChange={e => { setWarehouseId(e.target.value); setPage(1); }} className={sel}>
          <option value="">All warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name || w.name}</option>)}
        </select>
        <select value={txType} onChange={e => { setTxType(e.target.value); setPage(1); }} className={sel}>
          <option value="">All types</option>
          {['purchase_receipt', 'purchase_return', 'sales_dispatch', 'transfer_in', 'transfer_out', 'adjustment_in', 'adjustment_out', 'opening_stock'].map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {query.isPending ? <Skeleton className="h-72" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> :
        rows.length === 0 ? <EmptyState title="No ledger entries" description="Stock movements appear here after GRNs, dispatches, transfers and adjustments are posted." /> : (
          <>
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs text-slate-500">
                  <tr>{['Date', 'Type', 'Item', 'Warehouse', 'In', 'Out', 'Balance', 'Rate (₹)'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.id || i} className="border-b last:border-0 hover:bg-indigo-50/40">
                      <td className="px-4 py-3 text-xs text-slate-500">{String(row.transaction_date || '').slice(0, 16)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TX_COLOR[row.transaction_type] || 'bg-slate-100 text-slate-600'}`}>
                          {String(row.transaction_type || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{row.item_name || row.item_id}</span>
                        {row.item_code && <span className="ml-1 text-xs text-slate-400">({row.item_code})</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.warehouse_name || row.warehouse_id}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{Number(row.qty_in || 0) > 0 ? `+${Number(row.qty_in).toFixed(2)}` : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-red-600">{Number(row.qty_out || 0) > 0 ? `-${Number(row.qty_out).toFixed(2)}` : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.balance_qty != null ? Number(row.balance_qty).toFixed(2) : '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{row.rate != null ? `₹${Number(row.rate).toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Page {page}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
                <button disabled={rows.length < 50} onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
