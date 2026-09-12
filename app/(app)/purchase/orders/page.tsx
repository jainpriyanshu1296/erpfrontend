'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Purchase Orders" description="Manage vendor orders and delivery commitments." endpoint="/purchase/orders" columns={['po_number','vendor_id','delivery_date','status','total_amount']} fields={[{key:'po_number',label:'PO number',required:true},{key:'vendor_id',label:'Vendor',required:true},{key:'delivery_date',label:'Delivery date',type:'date'},{key:'payment_terms',label:'Payment terms',type:'number'}]} />; }
