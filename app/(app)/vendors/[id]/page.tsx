'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RecordDetail title="Vendor" endpoint={`/vendors/${id}`} backHref="/vendors" fields={[{ key: 'vendor_code', label: 'Vendor code' }, { key: 'company_name', label: 'Company name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'gstin', label: 'GSTIN' }, { key: 'address', label: 'Address' }, { key: 'is_active', label: 'Active' }]} />;
}
