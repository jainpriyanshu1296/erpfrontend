import { OperationalWorkspace } from '@/components/operational-workspace';
export default function ProductionDowntimePage() {
  return <OperationalWorkspace title="Production Downtime" description="Track machine downtime, causes and restoration for production analytics." endpoint="/closure/production-downtime" columns={['production_order_id','minutes','reason','created_at']} />;
}
