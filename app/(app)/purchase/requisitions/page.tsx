'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Purchase Requisitions" description="Raise, review and track material requisitions." endpoint="/purchase/requisitions" columns={['pr_number','requested_by','required_by','status','created_at']} fields={[{key:'pr_number',label:'PR number',required:true},{key:'required_by',label:'Required by',type:'date'},{key:'department_id',label:'Department'},{key:'notes',label:'Notes'}]} />; }
