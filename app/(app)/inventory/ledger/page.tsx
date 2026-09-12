'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Stock Ledger" description="Review every stock movement by item and warehouse." endpoint="/inventory/ledger" columns={['transaction_date','transaction_type','item_id','warehouse_id','qty_in','qty_out','balance_qty','rate']} fields={[]} />; }
