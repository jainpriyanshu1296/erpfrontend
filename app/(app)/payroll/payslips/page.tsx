'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Payslips' description='Review generated payslips and payroll item totals.' endpoint='/hr/payroll' columns={['period', 'employee_id', 'gross_amount', 'deductions', 'net_amount']} fields={[]} />; }
