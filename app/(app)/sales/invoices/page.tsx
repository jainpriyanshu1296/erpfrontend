'use client';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, FileCheck2, QrCode } from 'lucide-react';
import { api, workflowApi } from '@/lib/api';
import { Field, WorkflowCard, inputClass } from '@/components/workflow-card';
import { useToast } from '@/components/toast';

interface EinvoiceResult {
  irn: string;
  ack_no: string;
  ack_date: string;
  signed_qr_code: string;
}

export default function Page() {
  const { showToast } = useToast();
  const [invoiceId, setInvoiceId] = useState('');
  const [orgState, setOrgState] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [lines, setLines] = useState([{ item_id: '', description: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }]);
  const [irnData, setIrnData] = useState<EinvoiceResult | null>(null);

  const totals = useMemo(() => lines.reduce((sum, line) => {
    const taxable = Number(line.quantity) * Number(line.rate) * (1 - Number(line.discount_percent) / 100);
    const tax = taxable * Number(line.gst_rate) / 100;
    return { taxable: sum.taxable + taxable, tax: sum.tax + tax, total: sum.total + taxable + tax };
  }, { taxable: 0, tax: 0, total: 0 }), [lines]);

  const mutation = useMutation({
    mutationFn: () => workflowApi.saveInvoiceLines(invoiceId, {
      org_state: orgState,
      customer_state: customerState,
      items: lines.map(line => ({
        ...line,
        quantity: Number(line.quantity),
        rate: Number(line.rate),
        discount_percent: Number(line.discount_percent),
        gst_rate: Number(line.gst_rate)
      }))
    })
  });

  const irnMutation = useMutation({
    mutationFn: async () => {
      if (!invoiceId) throw new Error('Enter or save an Invoice ID first');
      const res = await api.post<EinvoiceResult>(`/sales/invoices/${invoiceId}/generate-irn`, {});
      return res.data;
    },
    onSuccess: (data) => {
      setIrnData(data);
      showToast('E-Invoice IRN and Signed QR generated successfully', 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Failed to generate IRN', 'error');
    }
  });

  return (
    <div className="space-y-6">
      <WorkflowCard title="GST Invoice Builder & E-Invoice (IRN)" description="Build invoice line items, calculate taxable value, and generate official NIC GST E-Invoice (IRN).">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Invoice ID"><input required className={inputClass} value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="e.g. inv_uuid or INV-00001" /></Field>
          <Field label="Organization state"><input required className={inputClass} value={orgState} onChange={e => setOrgState(e.target.value)} placeholder="Madhya Pradesh" /></Field>
          <Field label="Customer state"><input required className={inputClass} value={customerState} onChange={e => setCustomerState(e.target.value)} placeholder="Maharashtra" /></Field>
        </div>

        <div className="mt-5 space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 rounded-lg border p-3 md:grid-cols-7">
              <Field label="Item ID"><input className={inputClass} value={line.item_id} onChange={e => setLines(lines.map((l, i) => i === index ? { ...l, item_id: e.target.value } : l))} placeholder="item_uuid" /></Field>
              <Field label="Description"><input className={inputClass} value={line.description} onChange={e => setLines(lines.map((l, i) => i === index ? { ...l, description: e.target.value } : l))} placeholder="Description" /></Field>
              <Field label="Qty"><input type="number" min="0.001" className={inputClass} value={line.quantity} onChange={e => setLines(lines.map((l, i) => i === index ? { ...l, quantity: e.target.value } : l))} /></Field>
              <Field label="Rate (₹)"><input type="number" min="0" className={inputClass} value={line.rate} onChange={e => setLines(lines.map((l, i) => i === index ? { ...l, rate: e.target.value } : l))} /></Field>
              <Field label="Disc %"><input type="number" className={inputClass} value={line.discount_percent} onChange={e => setLines(lines.map((l, i) => i === index ? { ...l, discount_percent: e.target.value } : l))} /></Field>
              <Field label="GST %"><input type="number" className={inputClass} value={line.gst_rate} onChange={e => setLines(lines.map((l, i) => i === index ? { ...l, gst_rate: e.target.value } : l))} /></Field>
              <div className="flex items-end">
                <button type="button" disabled={lines.length === 1} onClick={() => setLines(lines.filter((_, i) => i !== index))} className="rounded-lg border p-2 text-red-600 disabled:opacity-40"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setLines([...lines, { item_id: '', description: '', quantity: '1', rate: '0', discount_percent: '0', gst_rate: '18' }])} className="rounded-lg border px-4 py-2 text-xs font-semibold">
            <Plus size={15} className="mr-1.5 inline" />Add line
          </button>
          
          <div className="text-right text-xs">
            <p>Taxable: ₹{totals.taxable.toFixed(2)}</p>
            <p>GST: ₹{totals.tax.toFixed(2)}</p>
            <p className="text-base font-bold text-slate-900">Total: ₹{totals.total.toFixed(2)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save Lines'}
            </button>

            <button
              type="button"
              disabled={irnMutation.isPending || !invoiceId}
              onClick={() => irnMutation.mutate()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              <FileCheck2 size={14} />
              {irnMutation.isPending ? 'Generating IRN...' : 'Generate IRN (NIC)'}
            </button>
          </div>
        </div>

        {mutation.isSuccess && <p className="mt-4 text-xs text-emerald-700">Invoice lines saved successfully.</p>}
        {mutation.isError && <p className="mt-4 text-xs text-red-600">{mutation.error.message}</p>}

        {/* E-Invoice IRN Badge Display */}
        {irnData && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  <FileCheck2 size={14} /> Official NIC E-Invoice Active
                </span>
                <p className="font-mono text-xs font-semibold text-slate-800 break-all">
                  IRN: {irnData.irn}
                </p>
                <p className="text-xs text-slate-600">
                  Ack No: <span className="font-semibold">{irnData.ack_no}</span> | Date: {irnData.ack_date}
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-emerald-300 bg-white p-2 text-center">
                <QrCode size={40} className="text-slate-800" />
                <span className="mt-1 text-[9px] font-bold uppercase text-slate-500">Signed QR</span>
              </div>
            </div>
          </div>
        )}
      </WorkflowCard>
    </div>
  );
}
