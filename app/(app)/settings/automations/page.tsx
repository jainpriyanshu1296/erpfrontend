'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Zap, ShoppingCart, Factory, PackageCheck, FileText, CheckCircle2, Power } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

interface AutomationRules {
  auto_wo_on_so: boolean;
  auto_pr_on_shortfall: boolean;
  auto_backflush_on_wo: boolean;
  auto_invoice_on_dispatch: boolean;
}

export default function AutomationRulesPage() {
  const client = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['settings-automations'],
    queryFn: async () => {
      const res = await api.get<AutomationRules>('/settings/automations');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (updatedRules: AutomationRules) => {
      await api.put('/settings/automations', updatedRules);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['settings-automations'] });
      showToast('Process automation rules updated', 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Failed to update automation rules', 'error');
    }
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rules: AutomationRules = query.data || {
    auto_wo_on_so: true,
    auto_pr_on_shortfall: true,
    auto_backflush_on_wo: true,
    auto_invoice_on_dispatch: true
  };

  const handleToggle = (key: keyof AutomationRules) => {
    mutation.mutate({
      ...rules,
      [key]: !rules[key]
    });
  };

  const automationsList = [
    {
      key: 'auto_wo_on_so' as const,
      title: 'Autonomous Work Order Generation',
      subtitle: 'Sales Order Confirmation -> Auto Work Order',
      description:
        'When a Sales Order is confirmed, the system immediately checks the product BOM and automatically drafts/releases a Work Order with shop-floor routing stages.',
      icon: Factory,
      color: 'indigo'
    },
    {
      key: 'auto_pr_on_shortfall' as const,
      title: 'BOM Explosion & Material Shortfall PR',
      subtitle: 'BOM Calculation -> Auto Purchase Requisition',
      description:
        'Calculates exact raw material requirements for confirmed orders against live warehouse inventory. If any steel, fasteners, or chemicals are short, a Purchase Requisition is automatically drafted.',
      icon: ShoppingCart,
      color: 'red'
    },
    {
      key: 'auto_backflush_on_wo' as const,
      title: 'Production Auto-Backflushing',
      subtitle: 'Work Order Complete -> Auto Stock Ledger Issue & Receipt',
      description:
        'Eliminates shop-floor data entry. When an operator marks a work order finished, the system automatically deducts raw materials using the BOM formula and credits finished goods to stock.',
      icon: PackageCheck,
      color: 'emerald'
    },
    {
      key: 'auto_invoice_on_dispatch' as const,
      title: 'Auto-Draft Tax Invoice on Dispatch',
      subtitle: 'Delivery Challan -> Auto Tax Invoice',
      description:
        'Automatically drafts the GST Tax Invoice with place-of-supply rules (CGST/SGST vs IGST) and round-offs whenever a dispatch delivery challan is recorded.',
      icon: FileText,
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Cpu size={16} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Autonomous Factory Engine</p>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Process Automation Rules</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure zero-touch automated event triggers. When enabled, business operations execute autonomously without manual clerk intervention.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {automationsList.map(item => {
          const Icon = item.icon;
          const isEnabled = rules[item.key];

          return (
            <div
              key={item.key}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                isEnabled
                  ? 'border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-500/10'
                  : 'border-dashed border-slate-300 bg-slate-50/70 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isEnabled ? <CheckCircle2 size={13} /> : <Power size={13} />}
                    {isEnabled ? 'Autonomous Active' : 'Disabled (Manual)'}
                  </span>

                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">{item.title}</h2>
                    <p className="text-xs font-semibold text-indigo-600">{item.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t pt-3 text-right">
                <span className="text-[11px] text-slate-400">
                  {isEnabled ? 'Status: Autonomous event-triggered' : 'Status: Manual user action required'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
