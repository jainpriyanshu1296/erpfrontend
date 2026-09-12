'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
export default function Page() {
  const query = useQuery({ queryKey:['billing'], queryFn: () => api.get<{plan:string;trial_ends_at?:string;pricing:Record<string,unknown>[]}>('/billing/info') });
  if (query.isPending) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const data = query.data.data;
  return <div className="space-y-5"><div><h1 className="text-2xl font-bold">Billing & Subscription</h1><p className="text-sm text-slate-500">Current plan and subscription pricing from the backend.</p></div><div className="rounded-xl border bg-white p-6"><p className="text-sm text-slate-500">Current plan</p><p className="text-3xl font-bold capitalize">{data.plan}</p>{data.trial_ends_at && <p className="mt-2 text-sm">Trial ends: {data.trial_ends_at}</p>}</div>{data.pricing?.length ? <div className="grid gap-4 md:grid-cols-3">{(data.pricing as Record<string, unknown>[]).map((plan, index) => <div key={String(plan.id || index)} className="rounded-xl border bg-white p-5"><h2 className="font-semibold capitalize">{String(plan.plan)}</h2><p className="mt-2 text-2xl font-bold">₹{String(plan.amount)}</p><p className="text-sm text-slate-500">{String(plan.duration_months)} months</p><button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Choose plan</button></div>)}</div> : <EmptyState title="No pricing available" description="Pricing plans will appear when configured by an administrator." />}</div>;
}
