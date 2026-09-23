import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Inventory Valuation" description="Stock quantity and value by item across warehouses." endpoint="/inventory/reports" columns={['item_code','item_name','current_qty','total_value','reorder_level']} fields={[]} />; }
