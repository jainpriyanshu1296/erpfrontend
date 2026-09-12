'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Sales Quotations" description="Prepare and track customer quotations." endpoint="/sales/quotations" columns={['quotation_number','customer_id','status','total_amount','created_at']} fields={[{key:'quotation_number',label:'Quotation number',required:true},{key:'customer_id',label:'Customer',required:true},{key:'total_amount',label:'Total amount',type:'number'}]} />; }
