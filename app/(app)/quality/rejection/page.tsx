'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Quality Rejections" description="Review failed inspections and open the record to apply stock disposition." endpoint="/quality/rejections" detailPath="/quality/inspections" columns={['inspection_number','source_type','source_id','item_id','rejected_qty','result','status']} fields={[]} />; }
