'use client';
import { Batch2Detail } from '@/components/batch2-detail';
export default function Page() { return <Batch2Detail title="Request for Quotation" endpoint="/purchase/rfqs" statusEndpoint="/purchase/rfqs" statuses={['requested','quoted','compared','selected','approved','cancelled']} />; }
