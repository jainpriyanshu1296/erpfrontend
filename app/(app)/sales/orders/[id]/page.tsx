'use client';
import { Batch2Detail } from '@/components/batch2-detail';
export default function SalesOrderDetailPage() { return <Batch2Detail title="Sales Order" endpoint="/sales/orders" statusEndpoint="/sales/orders" statuses={['draft', 'confirmed', 'cancelled']} />; }
