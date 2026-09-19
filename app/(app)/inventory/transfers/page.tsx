'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Inventory Transfers" description="Track warehouse-to-warehouse movement and receive in-transit stock." endpoint="/inventory/transfers" columns={['transfer_number','from_warehouse_id','to_warehouse_id','status','created_at']} detailPath="/inventory/transfers" statusEndpoint="/inventory/transfers" statuses={['requested','approved','in_transit','received','cancelled']} action={{ label: 'Receive', path: '/inventory/transfers/:id/receive' }} />;
}
