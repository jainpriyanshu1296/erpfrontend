'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { const { id } = useParams<{ id: string }>(); return <div className="space-y-6"><RecordDetail title="Quality inspection" endpoint={`/quality/inspections/${id}`} backHref="/quality/inspections" fields={[{key:'inspection_number',label:'Inspection number'},{key:'source_type',label:'Source type'},{key:'source_id',label:'Source ID'},{key:'status',label:'Status'},{key:'result',label:'Result'},{key:'notes',label:'Notes'}]} /><WorkflowAction title="Record disposition" endpoint={`/quality/inspections/${id}/disposition`} fields={[{key:'disposition',label:'Disposition',required:true},{key:'quantity',label:'Quantity',type:'number',required:true},{key:'warehouse_id',label:'Warehouse ID'}]} submitLabel="Close inspection" /></div>; }
