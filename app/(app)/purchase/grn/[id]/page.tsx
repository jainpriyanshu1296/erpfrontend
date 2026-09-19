'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RecordDetail title="Goods Receipt Note" endpoint={`/purchase/grn/${id}`} backHref="/purchase/grn" fields={[{ key: 'grn_number', label: 'GRN number' }, { key: 'po_id', label: 'Purchase order' }, { key: 'status', label: 'Status' }, { key: 'warehouse_id', label: 'Warehouse' }, { key: 'posted_at', label: 'Posted at' }, { key: 'created_at', label: 'Created' }]} />;
}
