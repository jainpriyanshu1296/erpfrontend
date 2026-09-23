import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Production Reports" description="Work order progress and outstanding production quantities." endpoint="/production/reports" columns={['wo_number','finished_item_id','planned_qty','produced_qty','status']} fields={[]} />; }
