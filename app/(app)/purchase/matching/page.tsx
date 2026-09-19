import { OperationalWorkspace } from '@/components/operational-workspace';
export default function PurchaseMatchingPage() {
  return <OperationalWorkspace title="Purchase Matching" description="Resolve purchase order, receipt and invoice variances before posting payables." endpoint="/purchase/matching" columns={['match_number','purchase_order_id','grn_id','invoice_id','status','variance_amount','created_at']} statusEndpoint="/purchase/matching" statuses={['pending','matched','exception','approved','rejected']} workflow />;
}
