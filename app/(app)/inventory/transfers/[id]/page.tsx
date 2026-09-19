'use client';
import { Batch2Detail } from '@/components/batch2-detail';
export default function Page() { return <Batch2Detail title="Inventory Transfer" endpoint="/inventory/transfers" statusEndpoint="/inventory/transfers" statuses={['requested','approved','in_transit','received','cancelled']} />; }
