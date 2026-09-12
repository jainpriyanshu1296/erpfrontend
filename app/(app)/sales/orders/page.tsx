'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Sales Orders" description="Confirm customer orders and track fulfillment." endpoint="/sales/orders" columns={['so_number','customer_id','status','total_amount','created_at']} fields={[{key:'so_number',label:'SO number',required:true},{key:'customer_id',label:'Customer',required:true},{key:'total_amount',label:'Order value',type:'number'}]} />; }
