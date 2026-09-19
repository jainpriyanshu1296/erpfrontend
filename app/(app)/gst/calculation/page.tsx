'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='GST calculation' description='Calculate CGST, SGST, and IGST for a transaction.' endpoint='/finance/gst' columns={['invoice_number', 'total_amount', 'tax_amount', 'status', 'created_at']} fields={[]} />; }
