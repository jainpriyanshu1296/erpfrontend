'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { return <div className="space-y-6"><ModuleWorkspace title="Sales Invoices" description="Create invoices from confirmed orders and track receivables." endpoint="/sales/invoices" detailPath="/sales/invoices" columns={['invoice_number','company_name','so_id','invoice_date','due_date','total_amount','balance_amount','status']} fields={[]} /><WorkflowAction title="Invoice confirmed sales order" endpoint="/sales/invoices/from-order" submitLabel="Create invoice with order lines and accounting" fields={[{key:'so_id',label:'Confirmed sales order ID',required:true}]} /></div>; }
