'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Purchase Analytics" description="Live purchase order, receipt, return and payable reporting." endpoint="/purchase/reports" exportEndpoint="/purchase/reports/export.xlsx" columns={['report_type','record_count','total_amount','open_amount','period']} fields={[]} />; }
