'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Stock Reservations" description="Reserve available stock for orders and release active reservations when demand changes." endpoint="/inventory/reservations" columns={['item_id','warehouse_id','quantity','reference_type','reference_id','status','created_at']} detailPath="/inventory/reservations" action={{ label: 'Release', path: '/inventory/reservations/:id/release' }} create={{ fields: [{ key: 'item_id', label: 'Item', required: true }, { key: 'warehouse_id', label: 'Warehouse', required: true }, { key: 'quantity', label: 'Quantity', type: 'number', required: true }, { key: 'reference_id', label: 'Reference' }] }} />;
}
