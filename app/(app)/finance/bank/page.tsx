'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Bank reconciliation' description='Review bank-related finance activity and reconciliation status.' endpoint='/finance/ledger' columns={['reference_type', 'reference_id', 'action', 'created_at']} fields={[]} />; }
