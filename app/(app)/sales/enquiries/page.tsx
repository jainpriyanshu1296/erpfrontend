import { OperationalWorkspace } from '@/components/operational-workspace';
export default function SalesEnquiriesPage() {
  return <OperationalWorkspace title="Sales Enquiries" description="Qualify customer enquiries and convert approved opportunities into quotations." endpoint="/closure/sales-enquiries" columns={['enquiry_number','customer_id','status','expected_date','notes','created_at']} workflow />;
}
