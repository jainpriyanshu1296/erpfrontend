'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Goods Receipt Notes" description="Receive, inspect and post incoming goods to inventory." endpoint="/purchase/grn" columns={['grn_number','po_id','vendor_id','received_date','status']} fields={[{key:'grn_number',label:'GRN number',required:true},{key:'po_id',label:'Purchase order'},{key:'vendor_id',label:'Vendor',required:true},{key:'received_date',label:'Received date',type:'date'}]} />; }
