'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

type Props = {
  title: string;
  endpoint: string;
  statuses?: string[];
  statusEndpoint?: string;
  action?: { label: string; endpoint: string; body?: unknown; prompt?: string };
};

export function Batch2Detail({ title, endpoint, statuses = [], statusEndpoint, action }: Props) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const { showToast } = useToast();
  const query = useQuery({ queryKey: ['batch2-detail', endpoint, id], queryFn: () => api.get<Record<string, unknown>>(`${endpoint}/${id}`) });
  const transition = useMutation({
    mutationFn: (status: string) => api.put(`${statusEndpoint}/${id}/status`, { status }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['batch2-detail', endpoint, id] });
      showToast('Status updated successfully', 'success');
    },
    onError: error => showToast(error.message, 'error')
  });
  const actionMutation = useMutation({
    mutationFn: (body: unknown) => api.post(action!.endpoint.replace(':id', id), body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['batch2-detail', endpoint, id] }); showToast(`${action?.label} completed`, 'success'); },
    onError: error => showToast(error.message, 'error')
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const record = query.data.data;
  if (!record) return <EmptyState title="Record not found" description="This record may have been removed or you may not have access." />;
  const entries = Object.entries(record).filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key));
  const currentStatus = String(record.status || '');

  return <section className="mx-auto max-w-5xl space-y-5">
    <button onClick={() => router.back()} className="text-sm font-medium text-indigo-600"><ArrowLeft size={15} className="mr-1 inline" />Back to {title}</button>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Record detail</p><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-slate-500">Live data from your organization workspace.</p></div>
      <div className="flex flex-wrap gap-2">{statuses.length > 0 && statusEndpoint && statuses.map(status => <button key={status} disabled={transition.isPending || status === currentStatus} onClick={() => transition.mutate(status)} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${status === currentStatus ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`}>{transition.isPending && status !== currentStatus ? <Loader2 size={14} className="mr-1 inline animate-spin" /> : <CheckCircle2 size={14} className="mr-1 inline" />}{status.replaceAll('_', ' ')}</button>)}{action && <button disabled={actionMutation.isPending} onClick={() => { const value = action.prompt ? window.prompt(action.prompt) : null; if (action.prompt && !value) return; actionMutation.mutate(action.prompt ? { ...(action.body as Record<string, unknown> || {}), warehouse_id: value } : action.body || {}); }} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{actionMutation.isPending ? 'Working...' : action.label}</button>}</div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{entries.map(([key, value]) => <div key={key} className="rounded-xl border bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{key.replaceAll('_', ' ')}</p><p className="mt-2 break-words text-sm font-medium text-slate-800">{String(value ?? '-')}</p></div>)}</div>
  </section>;
}
