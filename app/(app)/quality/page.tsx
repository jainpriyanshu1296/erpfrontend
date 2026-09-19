'use client';
import { DomainOverview } from '@/components/domain-overview';
export default function Page() {
  return <DomainOverview title="Quality & QC" description="Control incoming, in-process, and final quality inspections with traceable outcomes." endpoint="/quality/inspections" amountFields={['inspected_qty', 'accepted_qty']} columns={['inspection_type', 'reference_id', 'inspected_qty', 'accepted_qty', 'overall_result']} links={[
    { label: 'Quality dashboard', href: '/quality/dashboard', description: 'See outcomes, trends, and open quality actions.' },
    { label: 'Quality masters', href: '/quality/masters', description: 'Configure inspection templates and acceptance criteria.' },
    { label: 'Inward QC', href: '/quality/inward', description: 'Inspect received goods before inventory posting.' },
    { label: 'In-process QC', href: '/quality/in-process', description: 'Track checks performed during production.' },
    { label: 'Final QC', href: '/quality/final', description: 'Release finished goods against quality criteria.' },
    { label: 'NCR', href: '/quality/ncr', description: 'Track non-conformances and corrective actions.' },
  ]} />;
}
