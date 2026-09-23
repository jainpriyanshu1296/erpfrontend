'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() { return <OperationalWorkspace title="Dispatch" description="Dispatch confirmed delivery challans and post inventory reduction." endpoint="/sales/delivery-challans" columns={['challan_number','so_id','customer_id','challan_date','status','dispatched_at']} action={{label:'Dispatch',path:'/sales/delivery-challans/:id/dispatch'}} />; }
