'use client';
import { Batch2Detail } from '@/components/batch2-detail';
export default function WorkOrderDetailPage() { return <Batch2Detail title="Production Work Order" endpoint="/production/work-orders" statusEndpoint="/production/work-orders" statuses={['draft', 'released', 'in_progress', 'completed']} action={{ label: 'Issue materials', endpoint: '/production/work-orders/:id/material-issue', prompt: 'Enter issuing warehouse ID' }} />; }
