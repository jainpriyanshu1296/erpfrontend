'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Clock, Package, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton, EmptyState } from '@/components/shared';

export default function PurchaseDashboard() {
  const router = useRouter();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['purchase-dashboard'],
    queryFn: async () => {
      const [reqRes, poRes, grnRes, vendorRes, returnRes] = await Promise.all([
        api.get<any>('/purchase/requisitions?status=submitted&limit=1'),
        api.get<any>('/purchase/orders?status=approved&limit=1'),
        api.get<any>('/purchase/receipts?status=draft&limit=1'),
        api.get<any>('/vendors?limit=5'),
        api.get<any>('/purchase/returns?limit=1')
      ]);

      return {
        pending_requisitions: (reqRes.data as any)?.meta?.total || 0,
        open_purchase_orders: (poRes.data as any)?.meta?.total || 0,
        pending_receipts: (grnRes.data as any)?.meta?.total || 0,
        top_vendors: (vendorRes.data as any) || [],
        purchase_returns: (returnRes.data as any)?.meta?.total || 0
      };
    }
  });

  if (isLoading) return <div className="space-y-6 p-6"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchase</h1>
          <p className="mt-1 text-sm text-slate-500">Manage requisitions, orders, and receipts</p>
        </div>
        <button
          onClick={() => router.push('/purchase/requisitions')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Requisition
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={<Clock className="text-blue-600" size={24} />} label="Pending Requisitions" value={metrics?.pending_requisitions || 0} href="/purchase/requisitions?status=submitted" />
        <MetricCard icon={<Package className="text-green-600" size={24} />} label="Open POs" value={metrics?.open_purchase_orders || 0} href="/purchase/orders?status=approved" />
        <MetricCard icon={<AlertCircle className="text-orange-600" size={24} />} label="Pending GRN" value={metrics?.pending_receipts || 0} href="/purchase/grn?status=draft" />
        <MetricCard icon={<TrendingUp className="text-purple-600" size={24} />} label="Returns" value={metrics?.purchase_returns || 0} href="/purchase/returns" />
        <MetricCard icon={<CheckCircle2 className="text-slate-600" size={24} />} label="Vendors" value={metrics?.top_vendors?.length || 0} href="/vendors" />
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ActionButton label="New Requisition" href="/purchase/requisitions" />
          <ActionButton label="New PO" href="/purchase/orders" />
          <ActionButton label="New GRN" href="/purchase/grn" />
          <ActionButton label="New Return" href="/purchase/returns" />
        </div>
      </div>

      {metrics?.top_vendors && metrics.top_vendors.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Vendors</h2>
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
                {metrics.top_vendors.map((vendor: any) => (
                  <tr key={vendor.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-600">{vendor.vendor_code}</td>
                    <td className="px-6 py-3 text-slate-900">{vendor.company_name}</td>
                    <td className="px-6 py-3 text-slate-600">{vendor.contact_person || '-'}</td>
                    <td className="px-6 py-3 text-slate-600">{vendor.email || '-'}</td>
                    <td className="px-6 py-3"><Link href={`/vendors/${vendor.id}`} className="text-indigo-600 hover:underline">View</Link></td>
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
