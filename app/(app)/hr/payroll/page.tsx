'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Payroll Runs" description="Review payroll periods and payroll processing status." endpoint="/hr/payroll" columns={['period','status','total_amount','created_at']} fields={[{key:'period',label:'Payroll period',required:true},{key:'status',label:'Status',type:'select',options:['draft','processing','approved','paid']}]} />; }
