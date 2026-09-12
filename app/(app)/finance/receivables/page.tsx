'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Accounts Receivable" description="Monitor outstanding customer invoices and collections." endpoint="/finance/receivables" columns={['invoice_number','customer_id','total_amount','balance_amount','status']} fields={[]} />; }
