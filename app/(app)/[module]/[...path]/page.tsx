'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
import { recordsApi } from '@/lib/api';
import { useToast } from '@/components/toast';
import { z } from 'zod';
export default function ModulePage() {
  const params = useParams<{ module: string; path: string[] }>(); const endpoint = `/${params.module}/${params.path.join('/')}`;
  const queryClient = useQueryClient(); const [search, setSearch] = useState(''); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({}); const api = recordsApi(endpoint);
  const { showToast } = useToast();
  const query = useQuery({ queryKey: ['records', endpoint], queryFn: () => api.list({ limit: '100' }) });
  const title = `${params.module} / ${params.path.join(' / ')}`;
  const rows = (query.data?.data || []) as Record<string, unknown>[];
  const filtered = useMemo(() => rows.filter(row => !search || Object.values(row).some(v => String(v ?? '').toLowerCase().includes(search.toLowerCase()))), [rows, search]);
  const fields = useMemo(() => { const sample = rows[0]; return sample ? Object.keys(sample).filter(k => !['id','created_at','updated_at'].includes(k)).slice(0, 6) : ['name','status','notes']; }, [rows]);
  const mutation = useMutation({ mutationFn: () => {
    const schema = z.object(Object.fromEntries(fields.map(field => [field, field.includes('name') || field.includes('number') ? z.string().trim().min(1, `${field.replaceAll('_', ' ')} is required`) : z.string().optional()])) as z.ZodRawShape);
    const parsed = schema.safeParse(form);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Please review the form');
    return api.create(parsed.data);
  }, onSuccess: () => { setShowForm(false); setForm({}); queryClient.invalidateQueries({ queryKey: ['records', endpoint] }); showToast('Record created successfully', 'success'); }, onError: error => showToast(error.message, 'error') });
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold capitalize">{title.replaceAll('-', ' ')}</h1><p className="text-sm text-slate-500">Live records from your organization workspace.</p></div><button onClick={() => setShowForm(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">New record</button></div><div className="flex gap-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="w-full max-w-sm rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>{showForm && <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">{fields.map(field => <label key={field} className="text-sm font-medium capitalize">{field.replaceAll('_',' ')}<input required={field.includes('name') || field.includes('number')} value={form[field] || ''} onChange={e => setForm({...form, [field]: e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label>)}<div className="flex items-end gap-2"><button type="submit" disabled={mutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{mutation.isPending ? 'Saving…' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2">Cancel</button></div></form>}{query.isPending ? <Skeleton className="h-64" /> : query.isError ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> : filtered.length === 0 ? <EmptyState title="No records found" description={search ? 'Try a different search.' : 'Create the first record to get started.'} /> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{Object.keys(filtered[0]).slice(0, 8).map(key => <th key={key} className="p-3 capitalize">{key.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{filtered.map((row, index) => <tr key={String(row.id || index)} className="border-b last:border-0 hover:bg-slate-50">{Object.keys(filtered[0]).slice(0, 8).map(key => <td key={key} className="p-3">{String(row[key] ?? '-')}</td>)}</tr>)}</tbody></table></div>}</div>;
}
