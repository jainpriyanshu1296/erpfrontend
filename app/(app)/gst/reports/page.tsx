'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='GST reports' description='Review GST invoice records for filing and reconciliation.' endpoint='/finance/gst' columns={['invoice_number', 'customer_id', 'total_amount', 'tax_amount', 'status']} fields={[]} />; }
