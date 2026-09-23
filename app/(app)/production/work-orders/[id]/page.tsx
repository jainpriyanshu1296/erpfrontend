'use client';
import {useParams} from 'next/navigation';
import {WorkflowAction} from '@/components/workflow-action';
import { Batch2Detail } from '@/components/batch2-detail';
export default function WorkOrderDetailPage() { const {id}=useParams<{id:string}>(); return <div className="space-y-6"><Batch2Detail title="Production Work Order" endpoint="/production/work-orders" statusEndpoint="/production/work-orders" statuses={['draft', 'released', 'in_progress']} action={{ label: 'Issue materials', endpoint: '/production/work-orders/:id/material-issue', prompt: 'Enter issuing warehouse ID' }} /><WorkflowAction title="Complete production output" endpoint={`/production/work-orders/${id}/complete`} fields={[{key:'warehouse_id',label:'Finished goods warehouse',required:true}]} /></div>; }
