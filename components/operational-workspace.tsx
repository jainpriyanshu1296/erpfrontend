'use client';
import { MasterSelect, hasMasterSource } from '@/components/master-select';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
import { useRouter } from 'next/navigation';
import { ApprovalPanel } from '@/components/approval-panel';
import { Pagination } from '@/components/pagination';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  columns: string[];
  detailPath?: string;
  statusEndpoint?: string;
  statusMethod?: 'put' | 'patch';
  statuses?: string[];
  /** Use :id as the row identifier. Keeping this serializable allows server pages to configure actions. */
  action?: { label: string; path: string };
  actionBody?: unknown;
  create?: { fields: Array<{ key: string; label: string; type?: string; required?: boolean }> };
  workflow?: boolean;
};

export function OperationalWorkspace({ title, description, endpoint, columns, detailPath, statusEndpoint, statusMethod = 'patch', statuses = [], action, actionBody, create, workflow = false }: Props) {
  const router = useRouter();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [form, setForm] = useState<Record<string, string>>({});
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['operational', endpoint, search, page, limit], queryFn: () => recordsApi(endpoint).list({ search, page: String(page), limit: String(limit) }) });
  const rows = (query.data?.data || []) as Record<string, unknown>[];
  const hasActions = statuses.length > 0 || Boolean(action);
  const mutation = useMutation({
    mutationFn: (input: { url: string; method: 'status' | 'action'; value?: string }) => input.method === 'status'
      ? api[statusMethod](input.url, { status: input.value })
      : api.post(input.url, actionBody || {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['operational', endpoint] }); client.invalidateQueries({ queryKey: ['operational-detail'] }); },
  });
  const createMutation = useMutation({ mutationFn: () => recordsApi(endpoint).create(form), onSuccess: () => { setForm({}); client.invalidateQueries({ queryKey: ['operational', endpoint] }); } });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  return <section className="space-y-5">
    <div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Operations</p><h1 className="text-2xl font-bold text-slate-800">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3"><Search size={18} className="text-slate-400" /><input aria-label={`Search ${title}`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={`Search ${title.toLowerCase()}...`} className="w-full text-sm outline-none" /></div>
    {create && <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      {create.fields.map(field => <label key={field.key} className="text-xs font-semibold text-slate-600">{field.label}{hasMasterSource(field.key) ? <MasterSelect field={field.key} required={field.required} value={form[field.key] || ''} onChange={value=>setForm({...form,[field.key]:value})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" /> : <input required={field.required} type={field.type || 'text'} value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" />}</label>)}
      <button disabled={createMutation.isPending} className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{createMutation.isPending ? 'Saving...' : 'Create'}</button>
      {createMutation.isError && <p className="text-sm text-red-600 sm:col-span-2">{createMutation.error.message}</p>}
    </form>}
    {rows.length === 0 ? <EmptyState title={`No ${title.toLowerCase()} found`} description="Records created by your operational workflows will appear here." /> :
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs text-slate-500"><tr>{columns.map(c => <th key={c} className="whitespace-nowrap p-3 font-semibold">{c.replaceAll('_', ' ')}</th>)}{(hasActions || workflow) && <th className="p-3">Actions</th>}</tr></thead><tbody>
        {rows.map((row, index) => { const id = String(row.id || ''); const status = String(row.status || ''); return <tr key={id || index} className="border-b last:border-0 hover:bg-indigo-50/40">
          {columns.map(column => <td key={column} onClick={() => detailPath && id && router.push(`${detailPath}/${id}`)} className={`whitespace-nowrap p-3 ${detailPath ? 'cursor-pointer' : ''}`}>{String(row[column] ?? '—')}</td>)}
          {(hasActions || workflow) && <td className="whitespace-nowrap p-3"><div className="flex flex-wrap gap-1">
            {statuses.map(next => <button key={next} disabled={!id || status === next || mutation.isPending} onClick={() => mutation.mutate({ url: `${statusEndpoint || endpoint}/${id}/status`, method: 'status', value: next })} className={`rounded px-2 py-1 text-xs font-semibold ${status === next ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} disabled:opacity-50`}>{mutation.isPending && status !== next ? <Loader2 size={11} className="mr-1 inline animate-spin" /> : null}{next.replaceAll('_', ' ')}</button>)}
            {action && id && <button disabled={mutation.isPending} onClick={() => mutation.mutate({ url: action.path.replace(':id', id), method: 'action' })} className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"><ArrowRight size={11} className="mr-1 inline" />{action.label}</button>}
            {workflow && id && <button onClick={() => setWorkflowId(workflowId === id ? null : id)} className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Workflow</button>}
          </div></td>}
        </tr>; })}
      </tbody></table></div>}
    {workflowId && <ApprovalPanel resource={endpoint} resourceId={workflowId} title={title} />}
    {mutation.isError && <p role="alert" className="text-sm text-red-700">{mutation.error.message}</p>}
    <Pagination page={page} limit={limit} total={Number(query.data?.meta?.total || 0)} busy={query.isFetching} onPage={setPage} onLimit={value => { setLimit(value); setPage(1); }} />
  </section>;
}
