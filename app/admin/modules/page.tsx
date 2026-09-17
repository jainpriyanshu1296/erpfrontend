'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

interface Module {
  id: string;
  module_key: string;
  module_name: string;
  min_plan: string;
  sort_order: number;
}

const PLANS = ['free', 'starter', 'growth', 'pro'];

export default function Page() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-modules'],
    queryFn: () => adminApi.get<Module[]>('/admin/modules'),
  });

  const mutation = useMutation({
    mutationFn: ({ id, min_plan }: { id: string; min_plan: string }) =>
      adminApi.put(`/admin/modules/${id}`, { min_plan }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-modules'] }),
  });

  if (query.isPending) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rows = query.data.data || [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Administration</p>
        <h1 className="text-2xl font-bold text-white">Module Management</h1>
        <p className="text-sm text-slate-400">Set minimum plan required per module.</p>
      </div>

      {!rows.length ? (
        <EmptyState title="No modules configured" description="Run master migration to seed modules." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm text-slate-200">
            <thead className="border-b border-slate-700 bg-slate-800 text-slate-400">
              <tr>
                <th className="p-3">Key</th>
                <th className="p-3">Module Name</th>
                <th className="p-3">Min Plan</th>
                <th className="p-3">Sort Order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-800/50">
                  <td className="p-3 font-mono text-xs text-slate-400">{row.module_key}</td>
                  <td className="p-3 font-medium">{row.module_name}</td>
                  <td className="p-3">
                    <select
                      value={row.min_plan}
                      onChange={e => mutation.mutate({ id: row.id, min_plan: e.target.value })}
                      disabled={mutation.isPending}
                      className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                      {PLANS.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-slate-400">{row.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
