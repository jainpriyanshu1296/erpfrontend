'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Requests for Quotation" description="Compare supplier sourcing requests and progress RFQs through their real workflow." endpoint="/purchase/rfqs" columns={['rfq_number','status','requested_by','created_at']} detailPath="/purchase/rfqs" statusEndpoint="/purchase/rfqs" statuses={['draft','requested','quoted','compared','selected','approved','cancelled']} />;
}
