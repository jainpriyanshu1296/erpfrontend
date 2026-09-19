'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Payroll assignments' description='Add employee gross and deduction items to a payroll run from its detail workflow.' endpoint='/hr/payroll' columns={['run_number','period_start','period_end','status','total_amount']} fields={[]} detailPath="/payroll/runs" />; }
