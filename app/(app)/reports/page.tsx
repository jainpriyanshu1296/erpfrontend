'use client';
import { DomainOverview } from '@/components/domain-overview';
export default function Page() {
  return <DomainOverview title="Reports & Analytics" description="Turn operational records into searchable, exportable insight for your organization." endpoint="/reports/records" columns={['module', 'action', 'reference_type', 'reference_id', 'created_at']} links={[
    { label: 'Activity records', href: '/reports/records', description: 'Search audit and operational activity.' },
    { label: 'Smart reports', href: '/reports/smart', description: 'Ask questions across available ERP datasets.' },
    { label: 'Forecasting', href: '/reports/forecasting', description: 'Review demand and planning projections.' },
    { label: 'Import / export', href: '/reports/import-export', description: 'Move data securely using supported templates.' },
  ]} />;
}
