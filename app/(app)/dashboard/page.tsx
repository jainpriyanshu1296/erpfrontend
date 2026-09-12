'use client';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Users } from 'lucide-react';
import { orgApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
export default function DashboardPage() {
  const query = useQuery({ queryKey: ['summary'], queryFn: orgApi.summary });
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: orgApi.alerts });
  if (query.isPending) return <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const data = query.data.data;
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-slate-500">Live organization metrics from the ERP API</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Kpi icon={<Package />} title="Active items" value={data.items} /><Kpi icon={<Users />} title="Active vendors" value={data.vendors} /><Kpi icon={<ShoppingCart />} title="Current plan" value={data.plan} /></div><section><h2 className="mb-3 text-lg font-semibold">Alerts</h2>{alerts.isPending ? <Skeleton className="h-28" /> : alerts.isError ? <ErrorState message={alerts.error.message} retry={() => alerts.refetch()} /> : alerts.data.data.length ? <div className="space-y-2">{alerts.data.data.map(item => <div key={item.id} className="rounded-lg border bg-white p-4"><p className="font-medium">{item.title}</p><p className="text-sm text-slate-500">{item.description}</p></div>)}</div> : <EmptyState title="No alerts" description="Automation alerts will appear here when action is needed." />}</section></div>;
}
function Kpi({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) { return <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="mb-3 text-indigo-600">{icon}</div><p className="text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; }
