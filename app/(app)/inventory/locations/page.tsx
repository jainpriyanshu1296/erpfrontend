import { OperationalWorkspace } from '@/components/operational-workspace';
export default function WarehouseLocationsPage() {
  return <OperationalWorkspace title="Warehouse Locations" description="Maintain bins and storage locations used by live inventory movements." endpoint="/closure/warehouse-locations" columns={['code','name','warehouse_id','parent_id','is_active']} create={{ fields: [{ key: 'code', label: 'Code', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'warehouse_id', label: 'Warehouse', required: true }, { key: 'parent_id', label: 'Parent location' }] }} />;
}
