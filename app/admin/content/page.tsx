'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import type { LandingContent, LandingDocument } from '@/lib/landing-content';

export default function Page() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-landing'], queryFn: () => adminApi.get<LandingDocument>('/admin/content/landing') });
  const [draft, setDraft] = useState<LandingContent | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const mutation = useMutation({ mutationFn: (publish: boolean) => adminApi.put('/admin/content/landing', { content: draft || query.data?.data.content, revision: revision ?? query.data?.data.revision, publish }), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin-landing'] }); await client.invalidateQueries({ queryKey: ['public-landing'] }); setDraft(null); setRevision(null); } });
  if (query.isPending) return <p>Loading CMS…</p>;
  if (query.isError) return <div role="alert"><p>{query.error.message}</p><button onClick={() => query.refetch()}>Retry</button></div>;
  const content = draft || query.data.data.content;
  const change = (key: keyof LandingContent, value: string | string[]) => { setRevision(revision ?? query.data.data.revision); setDraft({ ...content, [key]: value }); mutation.reset(); };
  return <section className="max-w-4xl space-y-6"><h1 className="text-2xl font-bold">Public landing content</h1><p>Save draft keeps the public page unchanged. Publish makes the current revision public.</p><p className="text-sm text-slate-400">Published: {query.data.data.published_at || 'Not yet published — safe initial content is shown'}</p>
    <form className="space-y-4" onSubmit={event => { event.preventDefault(); mutation.mutate(false); }}>
      {(Object.keys(content) as Array<keyof LandingContent>).map(key => <label key={key} className="block text-sm capitalize">{key.replaceAll('_', ' ')}{Array.isArray(content[key]) && <span className="ml-2 text-slate-400">(one entry per line)</span>}<textarea disabled={mutation.isPending} rows={Array.isArray(content[key]) ? 6 : 2} value={Array.isArray(content[key]) ? (content[key] as string[]).join('\n') : content[key] as string} onChange={event => change(key, Array.isArray(content[key]) ? event.target.value.split('\n') : event.target.value)} className="mt-2 w-full rounded border border-slate-600 bg-slate-800 p-3" /></label>)}
      {mutation.isError && <p role="alert" className="text-red-300">{mutation.error.message}</p>}{mutation.isSuccess && <p role="status" className="text-green-300">Content saved.</p>}
      <div className="flex gap-3"><button disabled={mutation.isPending} className="rounded border px-4 py-2 disabled:opacity-50">Save draft</button><button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate(true)} className="rounded bg-indigo-600 px-4 py-2 disabled:opacity-50">Publish</button></div>
    </form>
  </section>;
}
