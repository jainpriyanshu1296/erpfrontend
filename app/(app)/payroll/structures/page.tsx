'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Payroll run setup' description='Create payroll runs using the backend payroll-run contract. Salary structures are applied by payroll services.' endpoint='/hr/payroll' columns={['run_number','period_start','period_end','status','total_amount']} fields={[{key:'run_number',label:'Run number',required:true},{key:'period_start',label:'Period start',type:'date',required:true},{key:'period_end',label:'Period end',type:'date',required:true}]} detailPath="/payroll/runs" />; }
