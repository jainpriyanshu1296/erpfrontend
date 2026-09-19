'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

type Props = { title: string; endpoint: string; backHref: string; fields: Array<{ key: string; label: string }> };

export function RecordDetail({ title, endpoint, backHref, fields }: Props) {
  const query = useQuery({ queryKey: ['record-detail', endpoint], queryFn: () => api.get<Record<string, unknown>>(endpoint) });
  if (query.isPending) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const record = query.data.data;
  if (!record) return <EmptyState title="Record not found" description="This record may have been removed or you may not have access to it." />;

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"><ArrowLeft size={16} /> Back to {title}</Link>
      <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="border-b pb-5"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Record detail</p><h1 className="mt-1 text-2xl font-bold text-slate-800">{title}</h1></div>
        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {fields.map(field => <div key={field.key}><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{field.label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-800">{String(record[field.key] ?? '—')}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}
