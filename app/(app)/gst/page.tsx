'use client';
import { DomainOverview } from '@/components/domain-overview';
export default function Page() {
  return <DomainOverview title="GST & Tax" description="Calculate GST and review tax-related invoice records for the active organization." endpoint="/finance/gst" amountFields={['total_amount', 'tax_amount', 'gst_amount']} columns={['invoice_number', 'customer_id', 'total_amount', 'status', 'created_at']} links={[
    { label: 'GST masters', href: '/gst/masters', description: 'Maintain tax codes and filing inputs.' },
    { label: 'GST calculator', href: '/gst/calculation', description: 'Calculate CGST, SGST, and IGST for a line item.' },
    { label: 'E-invoice', href: '/gst/einvoice', description: 'Review e-invoice generation and IRN workflows.' },
    { label: 'E-way bill', href: '/gst/ewaybill', description: 'Review dispatch compliance records.' },
    { label: 'GST reports', href: '/gst/reports', description: 'Review tax records for filing and reconciliation.' },
    { label: 'Sales invoices', href: '/sales/invoices', description: 'Review invoice tax values and filing inputs.' },
    { label: 'Finance ledger', href: '/finance/ledger', description: 'Trace tax postings in financial activity.' },
  ]} />;
}
