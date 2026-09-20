'use client';
import { OperationalWorkspace } from '@/components/operational-workspace';
export default function Page() {
  return <OperationalWorkspace title="Quality Dashboard" description="Live inspection outcomes and open quality actions." endpoint="/quality/reports" columns={['report_type','record_count','passed','failed','open_actions','period']} />;
}
