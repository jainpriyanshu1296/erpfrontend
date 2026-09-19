'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RecordDetail title="Item Master" endpoint={`/inventory/items/${id}`} backHref="/inventory/items" fields={[{ key: 'item_code', label: 'Item code' }, { key: 'item_name', label: 'Item name' }, { key: 'category', label: 'Category' }, { key: 'uom_id', label: 'UOM' }, { key: 'gst_rate', label: 'GST rate' }, { key: 'reorder_level', label: 'Reorder level' }, { key: 'is_active', label: 'Active' }]} />;
}
