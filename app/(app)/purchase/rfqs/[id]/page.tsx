'use client';
import { Batch2Detail } from '@/components/batch2-detail';
export default function Page() { return <Batch2Detail title="Request for Quotation" endpoint="/purchase/rfqs" statusEndpoint="/purchase/rfqs" statuses={['draft','sent','quoted','awarded','cancelled']} />; }
