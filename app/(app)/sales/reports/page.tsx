'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Sales Reports" description="Live order, dispatch, invoice, return and receivable reporting." endpoint="/sales/reports" exportEndpoint="/sales/reports/export.xlsx" columns={['report_type','record_count','total_amount','open_amount','period']} fields={[]} />; }
