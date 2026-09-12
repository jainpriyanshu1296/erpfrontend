'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Finance Ledger" description="Review financial activity and audit entries." endpoint="/finance/ledger" columns={['module','action','reference_type','reference_id','created_at']} fields={[]} />; }
