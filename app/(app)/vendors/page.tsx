'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() {
  return <ModuleWorkspace title="Vendors" description="Manage supplier records, contacts and purchasing relationships." endpoint="/vendors" detailPath="/vendors" statusOptions={['active', 'inactive']} statusParam="is_active" columns={['vendor_code', 'company_name', 'email', 'phone', 'is_active']} fields={[{ key: 'vendor_code', label: 'Vendor code', required: true }, { key: 'company_name', label: 'Company name', required: true }, { key: 'email', label: 'Email', type: 'text' }, { key: 'phone', label: 'Phone', type: 'text' }]} />;
}
