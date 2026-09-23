'use client';
import {useParams} from 'next/navigation';
import { Batch2Detail } from '@/components/batch2-detail';
import {WorkflowAction} from '@/components/workflow-action';
export default function Page() { const {id}=useParams<{id:string}>(); return <div className="space-y-6"><Batch2Detail title="Production Order" endpoint="/production/orders" /><WorkflowAction title="Release production order" endpoint={`/production/orders/${id}/release`} submitLabel="Create work order and job card" fields={[]} /></div>; }
