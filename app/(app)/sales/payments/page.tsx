import { OperationalWorkspace } from '@/components/operational-workspace';
import { WorkflowAction } from '@/components/workflow-action';
export default function SalesPaymentsPage() {
  return <div className="space-y-6"><OperationalWorkspace title="Customer Payments" description="Review idempotently posted receipts and their invoice allocation." endpoint="/sales/payments" columns={['invoice_number','company_name','amount','method','reference','created_at']} /><WorkflowAction title="Record customer payment" endpoint="/sales/invoices/{invoice_id}/payments" submitLabel="Post payment" fields={[{key:'invoice_id',label:'Invoice',required:true},{key:'amount',label:'Amount',type:'number',required:true},{key:'method',label:'Payment method',required:true},{key:'reference',label:'Reference'}]} /></div>;
}
