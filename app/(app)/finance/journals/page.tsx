'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
import { JournalForm } from '@/components/journal-form';
export default function Page() { return <div className="space-y-6"><ModuleWorkspace title="Journal entries" description="Review ledger activity and prepare auditable journal postings." endpoint="/finance/ledger" columns={['module','action','reference_type','reference_id','created_at']} fields={[]} /><JournalForm /></div>; }
