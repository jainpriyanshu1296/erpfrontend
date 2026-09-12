'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Clock, Play, X, Layers, AlertCircle } from 'lucide-react';
import { recordsApi, api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

interface RoutingOp {
  id: string;
  sequence_no: number;
  stage_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_qty: number;
  actual_start?: string;
  actual_end?: string;
}

export default function WorkOrderKanbanPage() {
  const client = useQueryClient();
  const [selectedWo, setSelectedWo] = useState<Record<string, unknown> | null>(null);
  const [newStageName, setNewStageName] = useState('');

  const query = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => recordsApi('/production/work-orders').list({ limit: '500' })
  });

  const woOpsQuery = useQuery({
    queryKey: ['wo-operations', selectedWo?.id],
    queryFn: async () => {
      if (!selectedWo?.id) return [];
      const res = await api.get<RoutingOp[]>(`/production/work-orders/${selectedWo.id}/operations`);
      return res.data || [];
    },
    enabled: !!selectedWo?.id
  });

  const addOpMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWo?.id || !newStageName.trim()) return;
      await api.post(`/production/work-orders/${selectedWo.id}/operations`, {
        stage_name: newStageName.trim(),
        sequence_no: (woOpsQuery.data?.length || 0) + 1
      });
    },
    onSuccess: () => {
      setNewStageName('');
      client.invalidateQueries({ queryKey: ['wo-operations', selectedWo?.id] });
    }
  });

  const updateOpMutation = useMutation({
    mutationFn: async ({ opId, status }: { opId: string; status: 'in_progress' | 'completed' }) => {
      if (!selectedWo?.id) return;
      await api.put(`/production/work-orders/${selectedWo.id}/operations/${opId}`, { status });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['wo-operations', selectedWo?.id] });
    }
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rows = (query.data.data || []) as Record<string, unknown>[];
  const statuses = ['draft', 'released', 'in_progress', 'completed'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Shop Floor Control</p>
          <h1 className="text-2xl font-bold text-slate-800">Production Work Orders & Stage Routing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track live WIP operations from Cutting, Welding to Final Assembly.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No work orders" description="Create a work order to see the live production board." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {statuses.map(status => {
            const columnOrders = rows.filter(row => String(row.status || 'draft') === status);
            return (
              <section key={status} className="flex flex-col rounded-xl bg-slate-100 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold capitalize text-slate-700">
                    {status.replace('_', ' ')}
                  </h2>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnOrders.map((row, index) => {
                    const planned = Number(row.planned_qty || 0);
                    const produced = Number(row.produced_qty || 0);
                    const pct = planned > 0 ? Math.min(100, Math.round((produced / planned) * 100)) : 0;

                    return (
                      <article
                        key={String(row.id || index)}
                        onClick={() => setSelectedWo(row)}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-400 hover:shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{String(row.wo_number || row.id)}</span>
                          <span className="flex items-center gap-1 text-xs text-indigo-600">
                            <Layers size={13} />
                            Stages
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Product: <span className="font-medium text-slate-700">{String(row.finished_item_id || '-')}</span>
                        </p>

                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Progress</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="mt-1 h-2 rounded bg-slate-200">
                            <div
                              className="h-2 rounded bg-indigo-600 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                          <span>Qty: {produced} / {planned}</span>
                          <span className="text-slate-400">{String(row.created_at || '').slice(0, 10)}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Routing Operations Modal */}
      {selectedWo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="font-bold text-slate-800">
                  Shop Floor Stages: {String(selectedWo.wo_number || selectedWo.id)}
                </h3>
                <p className="text-xs text-slate-500">
                  Track individual machine/process stations for this work order.
                </p>
              </div>
              <button
                onClick={() => setSelectedWo(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {woOpsQuery.isPending ? (
                <Skeleton className="h-40" />
              ) : woOpsQuery.data?.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                  No stages added yet. Add the manufacturing sequence below (e.g. Cutting, Bending, Welding, Assembly).
                </div>
              ) : (
                <div className="space-y-2">
                  {woOpsQuery.data?.map(op => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between rounded-lg border p-3.5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {op.sequence_no}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{op.stage_name}</p>
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              op.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : op.status === 'in_progress'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {op.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {op.status === 'pending' && (
                          <button
                            onClick={() => updateOpMutation.mutate({ opId: op.id, status: 'in_progress' })}
                            className="flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            <Play size={13} /> Start
                          </button>
                        )}
                        {op.status === 'in_progress' && (
                          <button
                            onClick={() => updateOpMutation.mutate({ opId: op.id, status: 'completed' })}
                            className="flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={13} /> Mark Done
                          </button>
                        )}
                        {op.status === 'completed' && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 size={15} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Stage Form */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="New stage name (e.g. Welding, Machining, Powder Coating)..."
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  disabled={!newStageName.trim() || addOpMutation.isPending}
                  onClick={() => addOpMutation.mutate()}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus size={16} /> Add Stage
                </button>
              </div>
            </div>

            <div className="border-t p-4 text-right">
              <button
                onClick={() => setSelectedWo(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
