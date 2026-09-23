import { OperationalWorkspace } from '@/components/operational-workspace';
export default function CreditNotesPage() {
  return <OperationalWorkspace title="Credit Notes" description="Issue and apply customer credit notes against receivables." endpoint="/closure/credit-notes" columns={['note_number','customer_id','invoice_id','sales_return_id','amount','status','created_at']} action={{ label: 'Issue', path: '/closure/credit-notes/:id/issue' }} workflow />;
}
