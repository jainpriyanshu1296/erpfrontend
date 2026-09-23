'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Production Orders" description="Plan manufacturing quantities from BOMs and connect production to sales demand." endpoint="/production/orders" columns={['production_number','item_id','bom_id','planned_qty','status','created_at']} detailPath="/production/orders" create={{ fields: [{ key: 'bom_id', label: 'BOM', required: true }, { key: 'item_id', label: 'Finished item', required: true }, { key: 'planned_qty', label: 'Planned quantity', type: 'number', required: true }, { key: 'so_id', label: 'Sales order' }] }} />;
}
