'use client';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { ErrorState } from '@/components/shared';
import { Field, WorkflowCard, inputClass } from '@/components/workflow-card';
export default function Page() {
  const [orgState, setOrgState] = useState(''); const [customerState, setCustomerState] = useState(''); const [item, setItem] = useState({ qty:'1', rate:'0', discount:'0', gst_rate:'18' });
  const mutation = useMutation({ mutationFn: () => workflowApi.calculateGst({ org_state: orgState, customer_state: customerState, items: [{ qty:Number(item.qty), rate:Number(item.rate), discount:Number(item.discount), gst_rate:Number(item.gst_rate) }] }) });
  return <WorkflowCard title="GST Calculator & Reports" description="Calculate CGST/SGST or IGST using the organization's and customer's states."><form onSubmit={(e: FormEvent) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4 md:grid-cols-2"><Field label="Organization state"><input required className={inputClass} value={orgState} onChange={e => setOrgState(e.target.value)} /></Field><Field label="Customer state"><input required className={inputClass} value={customerState} onChange={e => setCustomerState(e.target.value)} /></Field>{[['qty','Quantity'],['rate','Rate'],['discount','Discount %'],['gst_rate','GST %']].map(([key,label]) => <Field key={key} label={label}><input required type="number" step="0.01" className={inputClass} value={item[key as keyof typeof item]} onChange={e => setItem({...item, [key]:e.target.value})} /></Field>)}<button disabled={mutation.isPending} className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white md:col-span-2">{mutation.isPending ? 'Calculating...' : 'Calculate GST'}</button></form>{mutation.data && <pre className="mt-5 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-white">{JSON.stringify(mutation.data.data, null, 2)}</pre>}{mutation.isError && <ErrorState message={mutation.error.message} retry={() => mutation.reset()} />}</WorkflowCard>;
}
