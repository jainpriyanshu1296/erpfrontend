'use client';
import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { return <WorkflowAction title="Close finance period" endpoint="/finance/periods/{periodKey}/close" fields={[{key:'periodKey',label:'Period key (YYYY-MM)',required:true}]} submitLabel="Close period" />; }
