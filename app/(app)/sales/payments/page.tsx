import { OperationalWorkspace } from '@/components/operational-workspace';
export default function SalesPaymentsPage() {
  return <OperationalWorkspace title="Payment Allocations" description="Allocate customer receipts against invoices without allowing overpayment." endpoint="/closure/payment-allocations" columns={['payment_id','invoice_id','allocated_amount','created_at']} create={{ fields: [{ key: 'payment_id', label: 'Payment', required: true }, { key: 'invoice_id', label: 'Invoice', required: true }, { key: 'allocated_amount', label: 'Amount', type: 'number', required: true }] }} />;
}
