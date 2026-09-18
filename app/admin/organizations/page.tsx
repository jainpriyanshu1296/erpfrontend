'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

interface Org {
  id: string;
  slug: string;
  company_name: string;
  owner_email: string;
  plan: string;
  is_active: number;
  is_suspended: number;
  created_at: string;
}

interface OrgModule {
  id: number;
  module_key: string;
  module_name: string;
  min_plan: string;
  is_active: number;
}

const PLANS = ['free', 'starter', 'growth', 'pro'];

function OrgRow({ org }: { org: Org }) {
  const client = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const modulesQuery = useQuery({
    queryKey: ['admin-org-modules', org.id],
    queryFn: () => adminApi.get<OrgModule[]>(`/admin/organizations/${org.id}/modules`),
    enabled: expanded,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.post(`/admin/organizations/${id}/suspend`, { reason }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin-orgs'] });
      setConfirmSuspend(false);
      setSuspendReason('');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/organizations/${id}/activate`, {}),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-orgs'] }),
  });

  const planMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      adminApi.put(`/admin/organizations/${id}/plan`, { plan }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-orgs'] }),
  });

  const moduleToggleMutation = useMutation({
    mutationFn: ({ orgId, module_key, is_active }: { orgId: string; module_key: string; is_active: boolean }) =>
      adminApi.put(`/admin/organizations/${orgId}/modules`, { module_key, is_active }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-org-modules', org.id] }),
  });

  const suspended = Boolean(org.is_suspended);

  return (
    <div className="border-b border-slate-700 last:border-0">
      <div className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-800/40">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{org.company_name}</p>
          <p className="text-xs text-slate-400">{org.owner_email} · <span className="font-mono">{org.slug}</span></p>
        </div>

        <select
          value={org.plan}
          onChange={e => planMutation.mutate({ id: org.id, plan: e.target.value })}
          disabled={planMutation.isPending || suspended}
          className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-40"
        >
          {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>

        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${suspended ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {suspended ? 'Suspended' : 'Active'}
        </span>

        {suspended ? (
          <button onClick={() => activateMutation.mutate(org.id)} disabled={activateMutation.isPending}
            className="rounded border border-green-600 px-3 py-1 text-xs text-green-400 hover:bg-green-500/10 disabled:opacity-50">
            Activate
          </button>
        ) : (
          <button onClick={() => setConfirmSuspend(true)}
            className="rounded border border-red-700 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10">
            Suspend
          </button>
        )}

        <button onClick={() => setExpanded(e => !e)} className="rounded p-1 text-slate-400 hover:text-white">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {confirmSuspend && (
        <div className="mx-4 mb-3 rounded-lg border border-red-700/40 bg-red-500/10 p-3">
          <p className="text-xs text-red-400 mb-2">Reason for suspension:</p>
          <div className="flex gap-2">
            <input value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
              placeholder="e.g. Payment overdue"
              className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none" />
            <button onClick={() => { setConfirmSuspend(false); setSuspendReason(''); }}
              className="rounded border border-slate-600 px-3 py-1.5 text-xs text-slate-400">Cancel</button>
            <button
              onClick={() => suspendMutation.mutate({ id: org.id, reason: suspendReason || 'Suspended by administrator' })}
              disabled={suspendMutation.isPending}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
              {suspendMutation.isPending ? '…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mx-4 mb-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Module Access</p>
          {modulesQuery.isPending ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : modulesQuery.isError ? (
            <p className="text-xs text-red-400">Failed to load modules</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(modulesQuery.data?.data || []).map(mod => {
                const on = Boolean(mod.is_active);
                return (
                  <div key={mod.module_key} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-white">{mod.module_name}</p>
                      <p className="text-[10px] text-slate-500">min: {mod.min_plan}</p>
                    </div>
                    <button
                      onClick={() => moduleToggleMutation.mutate({ orgId: org.id, module_key: mod.module_key, is_active: !on })}
                      disabled={moduleToggleMutation.isPending}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const query = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => adminApi.get<Org[]>('/admin/organizations'),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rows = query.data?.data || [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Administration</p>
        <h1 className="text-2xl font-bold text-white">Organizations</h1>
        <p className="text-sm text-slate-400">Manage plans, module access, and org status.</p>
      </div>

      {!rows.length ? (
        <EmptyState title="No organizations" description="Registered organizations will appear here." />
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50">
          {rows.map(row => <OrgRow key={row.id} org={row} />)}
        </div>
      )}
    </div>
  );
}
