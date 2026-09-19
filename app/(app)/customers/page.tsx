'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function CustomersPage() {
  return <ModuleWorkspace title="Customers" description="Maintain customer contacts, tax details, credit terms, and account status." endpoint="/sales/customers" detailPath="/customers" columns={['customer_code','company_name','contact_person','phone','email','gstin','state','is_active']} fields={[{ key: 'company_name', label: 'Company name', required: true }, { key: 'customer_code', label: 'Customer code' }, { key: 'contact_person', label: 'Contact person' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'gstin', label: 'GSTIN' }, { key: 'state', label: 'State' }, { key: 'payment_terms', label: 'Payment terms (days)', type: 'number' }]} statusOptions={['active', 'inactive']} statusParam="is_active" />;
}
