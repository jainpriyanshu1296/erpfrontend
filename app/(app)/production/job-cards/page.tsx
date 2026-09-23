'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Production Job Cards" description="Track shop-floor execution for released production orders." endpoint="/production/job-cards" actionEndpoint="/production/job-cards" columns={['production_order_id','planned_qty','completed_qty','status']} statusOptions={['queued','started','paused','completed','cancelled']} fields={[]} />; }
