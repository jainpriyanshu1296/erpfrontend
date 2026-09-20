'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Receivables" description="Track outstanding sales invoices and customer balances." endpoint="/sales/receivables" columns={['invoice_number','customer_id','invoice_date','due_date','total_amount','paid_amount','balance_amount','status']} fields={[]} />; }
