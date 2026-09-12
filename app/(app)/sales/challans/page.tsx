'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Delivery Challans" description="Manage dispatch challans and delivery records." endpoint="/sales/challans" columns={['challan_number','customer_id','challan_date','created_at']} fields={[{key:'challan_number',label:'Challan number',required:true},{key:'customer_id',label:'Customer',required:true},{key:'challan_date',label:'Challan date',type:'date',required:true}]} />; }
