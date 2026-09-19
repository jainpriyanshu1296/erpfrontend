import { OperationalWorkspace } from '@/components/operational-workspace';
export default function PurchaseReturnsPage() {
  return <OperationalWorkspace title="Purchase Returns" description="Create and track supplier returns with live stock and credit workflows." endpoint="/closure/purchase-returns" columns={['return_number','supplier_id','warehouse_id','status','total_amount','created_at']} statusEndpoint="/closure/purchase-returns" statuses={['cancelled']} action={{ label: 'Post', path: '/closure/purchase-returns/:id/post' }} workflow />;
}
