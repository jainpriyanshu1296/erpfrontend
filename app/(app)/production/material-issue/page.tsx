import { WorkflowAction } from '@/components/workflow-action';
export default function Page() { return <WorkflowAction title="Issue Production Materials" endpoint="/production/work-orders/{work_order_id}/material-issue" submitLabel="Issue BOM materials" fields={[{key:'work_order_id',label:'Work order',required:true},{key:'warehouse_id',label:'Warehouse',required:true}]} />; }
