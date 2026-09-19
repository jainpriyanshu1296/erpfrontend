'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { return <div className="space-y-6"><ModuleWorkspace title="E-invoice source invoices" description="Select an invoice before requesting e-invoice integration." endpoint="/sales/invoices" columns={['invoice_number','customer_id','total_amount','status','created_at']} fields={[]} /><WorkflowAction title="Request e-invoice" endpoint="/gst/einvoice/{sourceId}" fields={[{key:'sourceId',label:'Invoice ID',required:true}]} submitLabel="Create e-invoice request" /></div>; }
