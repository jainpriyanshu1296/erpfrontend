'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export default function Page() {
  const client = useQueryClient();
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => adminApi.get<Org[]>('/admin/organizations'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.post(`/admin/organizations/${id}/suspend`, { reason }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin-orgs'] });
      setSuspendTarget(null);
      setSuspendReason('');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/organizations/${id}/activate`, {}),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-orgs'] }),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rows = query.data.data || [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Administration</p>
        <h1 className="text-2xl font-bold text-white">Organizations</h1>
        <p className="text-sm text-slate-400">Manage all tenant organizations.</p>
      </div>

      {!rows.length ? (
        <EmptyState title="No organizations" description="Registered organizations will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm text-slate-200">
            <thead className="border-b border-slate-700 bg-slate-800 text-slate-400">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Owner Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const suspended = Boolean(row.is_suspended);
                return (
                  <tr key={row.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-800/50">
                    <td className="p-3 font-medium">{row.company_name}</td>
                    <td className="p-3 text-slate-400">{row.slug}</td>
                    <td className="p-3">{row.owner_email}</td>
                    <td className="p-3 capitalize">{row.plan}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        suspended ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {suspended ? (
                        <button
                          disabled={activateMutation.isPending}
                          onClick={() => activateMutation.mutate(row.id)}
                          className="rounded border border-green-600 px-3 py-1 text-xs text-green-400 hover:bg-green-500/10 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspendTarget(row.id)}
                          className="rounded border border-red-700 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspend confirm modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-semibold text-white">Suspend Organization</h2>
            <p className="mt-1 text-sm text-slate-400">Provide a reason (shown to org admin).</p>
            <textarea
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="Reason for suspension..."
              className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setSuspendTarget(null); setSuspendReason(''); }}
                className="flex-1 rounded-lg border border-slate-700 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={suspendMutation.isPending}
                onClick={() => suspendMutation.mutate({ id: suspendTarget, reason: suspendReason || 'Suspended by administrator' })}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
