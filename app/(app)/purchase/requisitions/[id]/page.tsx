'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RecordDetail title="Purchase Requisition" endpoint={`/purchase/requisitions/${id}`} backHref="/purchase/requisitions" fields={[{ key: 'pr_number', label: 'PR number' }, { key: 'status', label: 'Status' }, { key: 'requested_by', label: 'Requested by' }, { key: 'needed_by', label: 'Needed by' }, { key: 'notes', label: 'Notes' }, { key: 'created_at', label: 'Created' }]} />;
}
