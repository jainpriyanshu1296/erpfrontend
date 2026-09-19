'use client';

import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';

export default function PricingPage() {
  const query = useQuery({ queryKey: ['public-pricing'], queryFn: () => publicApi.pricing() });
  if (query.isPending) return <div className="p-8"><Skeleton className="h-64" /></div>;
  if (query.isError) return <div className="p-8"><ErrorState message={query.error.message} retry={() => query.refetch()} /></div>;
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl"><a href="/" className="text-sm text-indigo-600">Daanoday ERP</a><h1 className="mt-8 text-4xl font-bold">Plans and pricing</h1><p className="mt-3 text-slate-600">Current prices are served from the platform configuration.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{query.data.data.map((price, index) => <article key={`${price.plan}-${price.duration_months}-${index}`} className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold capitalize">{price.plan}</h2><p className="mt-3 text-3xl font-bold">₹{price.amount}</p><p className="text-sm text-slate-500">{price.duration_months === 12 ? 'Annual' : 'Monthly'}</p><a href="/register" className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Choose plan</a></article>)}</div></div></main>;
}
