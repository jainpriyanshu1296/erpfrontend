'use client';
import { DomainOverview } from '@/components/domain-overview';
export default function Page() {
  return <DomainOverview title="Finance & Accounting" description="Monitor receivables, payables, ledger activity, and statutory finance operations." endpoint="/finance/ledger" columns={['module', 'action', 'reference_type', 'reference_id', 'created_at']} links={[
    { label: 'Chart of accounts', href: '/finance/coa', description: 'Maintain account masters for reliable postings.' },
    { label: 'Journal entries', href: '/finance/journals', description: 'Review and prepare auditable journal activity.' },
    { label: 'Receivables', href: '/finance/receivables', description: 'Follow customer invoices and collections.' },
    { label: 'Payables', href: '/finance/payables', description: 'Review purchase liabilities and supplier dues.' },
    { label: 'Bank reconciliation', href: '/finance/bank', description: 'Review bank activity and reconciliation status.' },
    { label: 'Expenses', href: '/finance/expenses', description: 'Review expense postings and references.' },
    { label: 'Finance reports', href: '/finance/reports', description: 'Filter and export finance activity.' },
    { label: 'Ledger', href: '/finance/ledger', description: 'Inspect financial activity and audit entries.' },
    { label: 'GST & tax', href: '/finance/gst', description: 'Calculate and review indirect tax values.' },
    { label: 'Tally Prime sync', href: '/finance/tally', description: 'Review accounting integration activity.' },
  ]} />;
}
