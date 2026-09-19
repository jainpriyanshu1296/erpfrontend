'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Physical Counts" description="Review physical stock counts and post approved variances to inventory." endpoint="/closure/physical-counts" columns={['count_number','warehouse_id','status','opened_at','posted_at','created_at']} action={{ label: 'Post count', path: '/closure/physical-counts/:id/post' }} />;
}
