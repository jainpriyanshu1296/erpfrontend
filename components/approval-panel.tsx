'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Clock3, FileText, X } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';

type ApprovalPanelProps = {
  resource: string;
  resourceId: string;
  title?: string;
};

type TimelineEvent = { id?: string; event?: string; action?: string; actor_name?: string; created_at?: string; notes?: string };
type RelatedDocument = { id?: string; document_type?: string; document_number?: string; status?: string; href?: string };

/** Shared live workflow surface. Endpoints are intentionally resource-relative so it can be reused by every module. */
export function ApprovalPanel({ resource, resourceId, title = 'Workflow' }: ApprovalPanelProps) {
  const queryClient = useQueryClient();
  const base = `${resource}/${resourceId}`;
  const timeline = useQuery({ queryKey: ['workflow-timeline', base], queryFn: () => api.get<TimelineEvent[]>(`${base}/timeline`) });
  const related = useQuery({ queryKey: ['related-documents', base], queryFn: () => api.get<RelatedDocument[]>(`${base}/related-documents`) });
  const action = useMutation({
    mutationFn: (verb: 'approve' | 'reject') => api.post(`${base}/${verb}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-timeline', base] });
      queryClient.invalidateQueries({ queryKey: ['related-documents', base] });
    },
  });

  if (timeline.isPending || related.isPending) return <Skeleton className="h-48" />;
  if (timeline.isError) return <ErrorState message={timeline.error.message} retry={() => timeline.refetch()} />;
  const events = timeline.data?.data || [];
  const documents = related.data?.data || [];

  return <div className="grid gap-4 rounded-xl border bg-white p-4 lg:grid-cols-2">
    <div>
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Clock3 size={16} className="text-indigo-600" />{title} timeline</h2>
      <div className="mt-3 space-y-3">
        {events.length === 0 ? <p className="text-sm text-slate-500">No workflow events have been recorded.</p> : events.map((item, index) => <div key={item.id || index} className="relative border-l-2 border-indigo-100 pl-4 text-sm">
          <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-indigo-500" />
          <p className="font-semibold text-slate-700">{item.event || item.action || 'Workflow update'}</p>
          <p className="text-xs text-slate-500">{item.actor_name || 'System'} · {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</p>
          {item.notes && <p className="mt-1 text-xs text-slate-600">{item.notes}</p>}
        </div>)}
      </div>
      <div className="mt-4 flex gap-2">
        <button disabled={action.isPending} onClick={() => action.mutate('approve')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check size={13} className="mr-1 inline" />Approve</button>
        <button disabled={action.isPending} onClick={() => action.mutate('reject')} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"><X size={13} className="mr-1 inline" />Reject</button>
      </div>
      {action.isError && <p className="mt-2 text-xs text-red-600">{action.error.message}</p>}
    </div>
    <div>
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><FileText size={16} className="text-indigo-600" />Related documents</h2>
      <div className="mt-3 divide-y rounded-lg border">
        {documents.length === 0 ? <p className="p-3 text-sm text-slate-500">No related documents.</p> : documents.map((doc, index) => <a key={doc.id || index} href={doc.href || '#'} className="block p-3 text-sm hover:bg-slate-50">
          <span className="font-semibold text-slate-700">{doc.document_type || 'Document'}</span><span className="ml-2 text-indigo-600">{doc.document_number || doc.id || '—'}</span>
          {doc.status && <span className="float-right text-xs text-slate-500">{doc.status}</span>}
        </a>)}
      </div>
    </div>
  </div>;
}
