'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { return <div className="space-y-6"><ModuleWorkspace title="Non-conformance reports" description="Review quality non-conformances and their lifecycle." endpoint="/quality/ncrs" columns={['ncr_number','inspection_id','severity','description','status','owner_id']} fields={[]} /><WorkflowAction title="Create NCR" endpoint="/quality/ncrs" submitLabel="Create NCR" fields={[{key:'ncr_number',label:'NCR number',required:true},{key:'inspection_id',label:'Inspection ID'},{key:'severity',label:'Severity',required:true},{key:'description',label:'Description',required:true}]} /></div>; }
