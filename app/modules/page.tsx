'use client';

import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';

export default function ModulesPage() {
  const query = useQuery({ queryKey: ['public-modules'], queryFn: () => publicApi.modules() });
  if (query.isPending) return <div className="p-8"><Skeleton className="h-64" /></div>;
  if (query.isError) return <div className="p-8"><ErrorState message={query.error.message} retry={() => query.refetch()} /></div>;
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl"><a href="/" className="text-sm text-indigo-600">Daanoday ERP</a><h1 className="mt-8 text-4xl font-bold">ERP modules</h1><p className="mt-3 text-slate-600">Choose the capabilities your organization needs. Availability and pricing are controlled by the platform.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{query.data.data.map(module => <article key={module.key} className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">{module.name}</h2><p className="mt-2 text-sm text-slate-500">{module.description || 'Configured ERP capability for your organization.'}</p><p className="mt-4 text-xs uppercase tracking-wide text-slate-400">{module.category || 'ERP'}</p></article>)}</div></div></main>;
}
