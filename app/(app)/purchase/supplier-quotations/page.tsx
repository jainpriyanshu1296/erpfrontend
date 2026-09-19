'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Supplier Quotations" description="Review supplier responses and commercial terms received against RFQs." endpoint="/purchase/supplier-quotations" columns={['quotation_number','rfq_id','vendor_id','status','total_amount','valid_until','created_at']} detailPath="/purchase/supplier-quotations" />;
}
