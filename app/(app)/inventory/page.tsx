'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Package, Warehouse, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/shared';

export default function InventoryDashboard() {
  const router = useRouter();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn: async () => {
      const [itemRes, warehouseRes, stockRes, reorderRes] = await Promise.all([
        api.get<any>('/inventory/items?limit=1'),
        api.get<any>('/inventory/warehouses'),
        api.get<any>('/inventory/stock?limit=1'),
        api.get<any>('/inventory/reorder')
      ]);

      return {
        total_items: (itemRes.data as any)?.meta?.total || 0,
        total_warehouses: (warehouseRes.data as any)?.length || 0,
        total_stock_value: 0,
        low_stock_items: (stockRes.data as any) || [],
        reorder_recommendations: (reorderRes.data as any) || []
      };
    }
  });

  if (isLoading) return <div className="space-y-6 p-6"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Manage stock, items, and warehouses</p>
        </div>
        <button
          onClick={() => router.push('/inventory/items')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Item
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={<Package className="text-blue-600" size={24} />} label="Total Items" value={metrics?.total_items || 0} href="/inventory/items" />
        <MetricCard icon={<Warehouse className="text-green-600" size={24} />} label="Warehouses" value={metrics?.total_warehouses || 0} href="/inventory/warehouses" />
        <MetricCard icon={<BarChart3 className="text-purple-600" size={24} />} label="Stock Value" value={`₹${(metrics?.total_stock_value || 0).toLocaleString()}`} href="/inventory/stock" />
        <MetricCard icon={<AlertTriangle className="text-orange-600" size={24} />} label="Low Stock" value={metrics?.reorder_recommendations?.length || 0} href="/inventory/reorder" />
        <MetricCard icon={<TrendingDown className="text-slate-600" size={24} />} label="Reorder Items" value={metrics?.reorder_recommendations?.length || 0} href="/inventory/reorder" />
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ActionButton label="New Item" href="/inventory/items" />
          <ActionButton label="Stock Transfer" href="/inventory/transfers" />
          <ActionButton label="Adjustment" href="/inventory/stock-adjustment" />
          <ActionButton label="View Stock" href="/inventory/stock" />
        </div>
      </div>

      {metrics?.reorder_recommendations && metrics.reorder_recommendations.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Reorder Recommendations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Code</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Item Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Stock</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Reorder Level</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Suggested Qty</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.reorder_recommendations.slice(0, 5).map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-600">{item.item_code}</td>
                    <td className="px-6 py-3 text-slate-900">{item.item_name}</td>
                    <td className="px-6 py-3 text-slate-600">{item.total_stock}</td>
                    <td className="px-6 py-3 text-slate-600">{item.reorder_level}</td>
                    <td className="px-6 py-3 text-slate-600">{item.reorder_qty}</td>
                    <td className="px-6 py-3"><Link href="/purchase/requisitions" className="text-indigo-600 hover:underline">Create PR</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, href }: any) {
  return (
    <Link href={href}>
      <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">{icon}</div>
        </div>
      </div>
    </Link>
  );
}

function ActionButton({ label, href }: any) {
  return (
    <Link href={href}>
      <button className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300">
        {label}
      </button>
    </Link>
  );
}
