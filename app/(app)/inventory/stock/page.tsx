'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Stock Overview" description="Monitor quantities, valuation and warehouse balances." endpoint="/inventory/stock" columns={['item_id','warehouse_id','current_qty','avg_rate','total_value','last_updated']} fields={[]} />; }
