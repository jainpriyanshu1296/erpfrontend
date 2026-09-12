'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Reports & Analytics" description="Explore activity and operational records with export support." endpoint="/reports/records" columns={['module','action','reference_type','reference_id','created_at']} fields={[]} />; }
