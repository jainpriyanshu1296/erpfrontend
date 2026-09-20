'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ShoppingCart, Truck, RotateCcw, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/shared';

export default function SalesDashboard() {
  const router = useRouter();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['sales-dashboard'],
    queryFn: async () => {
      const [quotRes, soRes, dcRes, custRes, returnRes] = await Promise.all([
        api.get<any>('/sales/quotations?status=draft&limit=1'),
        api.get<any>('/sales/orders?status=confirmed&limit=1'),
        api.get<any>('/sales/delivery-challans?status=draft&limit=1'),
        api.get<any>('/customers?limit=5'),
        api.get<any>('/sales/returns?limit=1')
      ]);

      return {
        open_quotations: quotRes.meta?.total || 0,
        open_sales_orders: soRes.meta?.total || 0,
        pending_dispatch: dcRes.meta?.total || 0,
        top_customers: (custRes.data as any) || [],
        sales_returns: returnRes.meta?.total || 0
      };
    }
  });

  if (isLoading) return <div className="space-y-6 p-6"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales & Dispatch</h1>
          <p className="mt-1 text-sm text-slate-500">Manage quotations, orders, and dispatch</p>
        </div>
        <button
          onClick={() => router.push('/sales/quotations')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Quotation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={<FileText className="text-blue-600" size={24} />} label="Open Quotations" value={metrics?.open_quotations || 0} />
        <MetricCard icon={<ShoppingCart className="text-green-600" size={24} />} label="Sales Orders" value={metrics?.open_sales_orders || 0} />
        <MetricCard icon={<Truck className="text-orange-600" size={24} />} label="Pending Dispatch" value={metrics?.pending_dispatch || 0} />
        <MetricCard icon={<RotateCcw className="text-purple-600" size={24} />} label="Returns" value={metrics?.sales_returns || 0} />
        <MetricCard icon={<Users className="text-slate-600" size={24} />} label="Customers" value={metrics?.top_customers?.length || 0} />
      </div>

      {metrics?.top_customers && metrics.top_customers.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Customers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Code</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Company</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.top_customers.map((customer: any) => (
                  <tr key={customer.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-600">{customer.customer_code}</td>
                    <td className="px-6 py-3 text-slate-900">{customer.company_name}</td>
                    <td className="px-6 py-3 text-slate-600">{customer.contact_person || '-'}</td>
                    <td className="px-6 py-3 text-slate-600">{customer.email || '-'}</td>
                    <td className="px-6 py-3 text-slate-500">Active</td>
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

function MetricCard({ icon, label, value }: any) {
  return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">{icon}</div>
        </div>
      </div>
  );
}
