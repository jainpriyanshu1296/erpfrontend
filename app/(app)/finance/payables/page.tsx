'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Accounts Payable" description="Monitor vendor commitments and payable balances." endpoint="/finance/payables" columns={['po_number','vendor_id','delivery_date','status','total_amount']} fields={[]} />; }
