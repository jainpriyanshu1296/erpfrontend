import { OperationalWorkspace } from '@/components/operational-workspace';
export default function SalesReturnsPage() {
  return <OperationalWorkspace title="Sales Returns" description="Process customer returns, inspection outcomes and inventory credit workflows." endpoint="/closure/sales-returns" columns={['return_number','customer_id','warehouse_id','status','total_amount','created_at']} statusEndpoint="/closure/sales-returns" statuses={['cancelled']} action={{ label: 'Post', path: '/closure/sales-returns/:id/post' }} workflow />;
}
