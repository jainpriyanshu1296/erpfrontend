'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Quality Reports" description="Live inspection outcomes, NCR ageing and rejection reporting." endpoint="/quality/reports" exportEndpoint="/quality/reports/export.xlsx" columns={['report_type','record_count','passed','failed','open_actions','period']} fields={[]} />; }
