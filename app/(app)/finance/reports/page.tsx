'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Finance reports' description='Filter receivables, payables, ledger, and statutory finance records.' endpoint='/finance/ledger' columns={['module', 'action', 'reference_type', 'reference_id', 'created_at']} fields={[]} />; }
