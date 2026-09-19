'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { return <div className="space-y-6"><ModuleWorkspace title="E-way bill source invoices" description="Select an invoice before requesting e-way bill integration." endpoint="/sales/invoices" columns={['invoice_number','customer_id','total_amount','status','created_at']} fields={[]} /><WorkflowAction title="Request e-way bill" endpoint="/gst/ewaybill/{sourceId}" fields={[{key:'sourceId',label:'Invoice or dispatch ID',required:true}]} submitLabel="Create e-way bill request" /></div>; }
