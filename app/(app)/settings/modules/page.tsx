'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Check, Power, AlertCircle } from 'lucide-react';
import { api, orgApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

interface OrgModule {
  id: number;
  module_key: string;
  module_name: string;
  min_plan: string;
  sort_order: number;
  is_enabled: boolean | number;
}

export default function ModulePreferencesPage() {
  const client = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['org-modules-settings'],
    queryFn: async () => {
      const res = await api.get<OrgModule[]>('/org/modules');
      return res.data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (moduleKey: string) => {
      await api.put(`/org/modules/${moduleKey}/toggle`, {});
    },
    onSuccess: (_, moduleKey) => {
      client.invalidateQueries({ queryKey: ['org-modules-settings'] });
      client.invalidateQueries({ queryKey: ['modules'] }); // Updates AppShell sidebar in real-time
      showToast(`Module '${moduleKey}' preference updated`, 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Failed to update module', 'error');
    }
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const modules = query.data || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Workspace Customization</p>
        <h1 className="text-2xl font-bold text-slate-800">Module & Feature Toggles</h1>
        <p className="mt-1 text-sm text-slate-500">
          Turn features ON or OFF for your company. Disabled modules are hidden from the sidebar to keep your factory workflow simple and uncluttered.
        </p>
      </div>

      {modules.length === 0 ? (
        <EmptyState title="No modules found" description="No configurable modules assigned to your organization plan." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(mod => {
            const isEnabled = Boolean(mod.is_enabled);
            const isDashboard = mod.module_key === 'dashboard';

            return (
              <div
                key={mod.module_key}
                className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                  isEnabled ? 'border-slate-200 bg-white shadow-sm' : 'border-dashed border-slate-300 bg-slate-50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                      {mod.min_plan} plan
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        isEnabled ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {isEnabled ? <Check size={14} /> : <Power size={14} />}
                      {isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-800">{mod.module_name}</h3>
                  <p className="mt-1 text-xs text-slate-500">Key: <code className="text-indigo-600 font-mono">{mod.module_key}</code></p>
                </div>

                <div className="mt-5 pt-3 border-t">
                  {isDashboard ? (
                    <span className="text-xs italic text-slate-400">Core module (Cannot be disabled)</span>
                  ) : (
                    <button
                      type="button"
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(mod.module_key)}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        isEnabled
                          ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      }`}
                    >
                      <Power size={14} />
                      {isEnabled ? 'Disable Module' : 'Enable Module'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
