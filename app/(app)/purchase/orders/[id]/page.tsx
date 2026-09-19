'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RecordDetail title="Purchase Order" endpoint={`/purchase/orders/${id}`} backHref="/purchase/orders" fields={[{ key: 'po_number', label: 'PO number' }, { key: 'vendor_id', label: 'Vendor' }, { key: 'status', label: 'Status' }, { key: 'warehouse_id', label: 'Warehouse' }, { key: 'delivery_date', label: 'Delivery date' }, { key: 'total_amount', label: 'Total amount' }, { key: 'created_at', label: 'Created' }]} />;
}
