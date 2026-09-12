'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Job Work Orders" description="Track material sent to external processors and expected returns." endpoint="/jobwork/orders" columns={['jw_number','vendor_id','process_name','expected_return_date','status']} fields={[{key:'jw_number',label:'JW number',required:true},{key:'vendor_id',label:'Vendor',required:true},{key:'process_name',label:'Process',required:true},{key:'expected_return_date',label:'Expected return',type:'date'}]} />; }
