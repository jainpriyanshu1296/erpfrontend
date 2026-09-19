'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Quality dashboard' description='Review inspection volumes, outcomes, and open quality actions.' endpoint='/quality/inspections' columns={['inspection_type', 'overall_result', 'status', 'created_at']} fields={[]} />; }
