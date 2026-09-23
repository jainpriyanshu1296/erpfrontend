'use client';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { ErrorState } from '@/components/shared';
import { Field, WorkflowCard, inputClass } from '@/components/workflow-card';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() {
  const [form, setForm] = useState({ demand:'', on_hand:'', scheduled:'', safety_stock:'' });
  const mutation = useMutation({ mutationFn: () => workflowApi.calculateMrp({ demand:Number(form.demand), on_hand:Number(form.on_hand), scheduled:Number(form.scheduled), safety_stock:Number(form.safety_stock) }) });
  return <div className="space-y-6"><ModuleWorkspace title="Work in Progress" description="Live persisted work-order quantities and execution status." endpoint="/production/work-orders" columns={['wo_number','finished_item_id','planned_qty','produced_qty','status']} fields={[]} /><WorkflowCard title="MRP Planning" description="Calculate net planned quantity from demand, stock, scheduled receipts and safety stock."><form onSubmit={(e: FormEvent) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4 md:grid-cols-2">{[['demand','Demand'],['on_hand','On hand'],['scheduled','Scheduled receipts'],['safety_stock','Safety stock']].map(([key,label]) => <Field key={key} label={label}><input required min="0" step="0.001" type="number" className={inputClass} value={form[key as keyof typeof form]} onChange={e => setForm({...form, [key]:e.target.value})} /></Field>)}<button disabled={mutation.isPending} className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white md:col-span-2">{mutation.isPending ? 'Calculating...' : 'Calculate requirements'}</button></form>{mutation.data && <div className="mt-5 rounded-lg bg-indigo-50 p-4 text-indigo-900">Planned quantity: <strong>{String(mutation.data.data.planned_quantity ?? '-')}</strong></div>}{mutation.isError && <ErrorState message={mutation.error.message} retry={() => mutation.reset()} />}</WorkflowCard></div>;
}
