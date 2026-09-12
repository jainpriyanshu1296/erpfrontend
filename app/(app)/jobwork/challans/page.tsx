'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck, Clock, Plus, CheckCircle, FileText, X } from 'lucide-react';
import { api, recordsApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

interface AgingChallan {
  id: string;
  jw_number: string;
  vendor_name?: string;
  process_name: string;
  dispatch_date_calc: string;
  days_elapsed: number;
  days_remaining: number;
  status: string;
  compliance_risk: 'compliant' | 'warning_aging' | 'overdue_deemed_supply';
}

export default function JobWorkCompliancePage() {
  const client = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [newJw, setNewJw] = useState({
    jw_number: '',
    vendor_id: '',
    process_name: '',
    dispatch_date: new Date().toISOString().slice(0, 10),
    expected_return_date: ''
  });

  const query = useQuery({
    queryKey: ['jobwork-compliance-aging'],
    queryFn: async () => {
      const res = await api.get<AgingChallan[]>('/jobwork/compliance/aging');
      return res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await recordsApi('/jobwork/orders').create({
        ...newJw,
        status: 'sent',
        challan_type: 'inputs'
      });
    },
    onSuccess: () => {
      setOpenCreate(false);
      setNewJw({
        jw_number: '',
        vendor_id: '',
        process_name: '',
        dispatch_date: new Date().toISOString().slice(0, 10),
        expected_return_date: ''
      });
      client.invalidateQueries({ queryKey: ['jobwork-compliance-aging'] });
    }
  });

  const markReturnedMutation = useMutation({
    mutationFn: async (id: string) => {
      await recordsApi('/jobwork/orders').update(id, { status: 'completed' });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['jobwork-compliance-aging'] });
    }
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const challans = query.data || [];
  const critical = challans.filter(c => c.compliance_risk === 'overdue_deemed_supply' && c.status !== 'completed');
  const warnings = challans.filter(c => c.compliance_risk === 'warning_aging' && c.status !== 'completed');
  const safe = challans.filter(c => c.compliance_risk === 'compliant' && c.status !== 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Statutory GST Tracking</p>
          <h1 className="text-2xl font-bold text-slate-800">57F4 Job Work & Section 143 Compliance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor outward material challans against the strict 365-day statutory return limit under CGST Rule 143 / ITC-04.
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
        >
          <Plus size={16} /> New 57F4 Challan
        </button>
      </div>

      {/* Compliance Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Within Limit (&lt;180 Days)</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{safe.length}</p>
          <p className="text-xs text-emerald-700">Fully compliant challans</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">Aging Notice (300+ Days)</span>
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-900">{warnings.length}</p>
          <p className="text-xs text-amber-700">Approaching 1-year deadline</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-red-800">Sec 143 Deemed Supply Risk</span>
            <ShieldAlert size={20} className="text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-900">{critical.length}</p>
          <p className="text-xs text-red-700">Exceeded 365 days (GST & interest due)</p>
        </div>
      </div>

      {/* Challan Table */}
      {challans.length === 0 ? (
        <EmptyState
          title="No Job Work Challans"
          description="Create your first 57F4 delivery challan for outside processes like powder coating, heat treatment, or turning."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-3">Challan #</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Process</th>
                <th className="p-3">Dispatched</th>
                <th className="p-3">Days Elapsed</th>
                <th className="p-3">Days Remaining</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {challans.map(item => {
                const isOverdue = item.compliance_risk === 'overdue_deemed_supply' && item.status !== 'completed';
                const isWarning = item.compliance_risk === 'warning_aging' && item.status !== 'completed';

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{item.jw_number}</td>
                    <td className="p-3">{item.vendor_name || 'Job Worker'}</td>
                    <td className="p-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {item.process_name}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{item.dispatch_date_calc}</td>
                    <td className="p-3 font-medium">
                      <span className={isOverdue ? 'text-red-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : ''}>
                        {item.days_elapsed} days
                      </span>
                    </td>
                    <td className="p-3">
                      {item.status === 'completed' ? (
                        <span className="text-xs text-emerald-600 font-medium">Material Returned</span>
                      ) : isOverdue ? (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          OVERDUE (DEEMED SUPPLY)
                        </span>
                      ) : (
                        <span className={`text-xs font-semibold ${isWarning ? 'text-amber-700' : 'text-slate-600'}`}>
                          {item.days_remaining} days left
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {item.status !== 'completed' && (
                        <button
                          onClick={() => markReturnedMutation.mutate(item.id)}
                          disabled={markReturnedMutation.isPending}
                          className="rounded-lg border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Record Return
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

      {/* Modal for Creating New Outward Challan */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={e => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Issue 57F4 Outward Job Work Challan</h2>
              <button type="button" onClick={() => setOpenCreate(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700">Challan Number</label>
                <input
                  required
                  value={newJw.jw_number}
                  onChange={e => setNewJw({ ...newJw, jw_number: e.target.value })}
                  placeholder="e.g. JW-2026-001"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Vendor ID / Name</label>
                <input
                  required
                  value={newJw.vendor_id}
                  onChange={e => setNewJw({ ...newJw, vendor_id: e.target.value })}
                  placeholder="Vendor UUID or code"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Job Work Process Name</label>
                <input
                  required
                  value={newJw.process_name}
                  onChange={e => setNewJw({ ...newJw, process_name: e.target.value })}
                  placeholder="e.g. Powder Coating, Heat Treatment, CNC Machining"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Dispatch Date</label>
                  <input
                    type="date"
                    required
                    value={newJw.dispatch_date}
                    onChange={e => setNewJw({ ...newJw, dispatch_date: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Expected Return</label>
                  <input
                    type="date"
                    value={newJw.expected_return_date}
                    onChange={e => setNewJw({ ...newJw, expected_return_date: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Issuing...' : 'Issue Challan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
