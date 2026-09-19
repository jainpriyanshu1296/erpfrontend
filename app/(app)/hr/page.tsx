'use client';
import { DomainOverview } from '@/components/domain-overview';
export default function Page() {
  return <DomainOverview title="HR & People" description="Manage employee records, attendance, leave, and payroll operations in one workspace." endpoint="/hr/employees" amountFields={['basic_salary']} columns={['employee_code', 'name', 'designation', 'salary_type', 'is_active']} links={[
    { label: 'HR masters', href: '/hr/masters', description: 'Manage departments, designations, and employee settings.' },
    { label: 'Employees', href: '/hr/employees', description: 'Maintain employee master data and compensation inputs.' },
    { label: 'Attendance', href: '/hr/attendance', description: 'Review attendance and working-day records.' },
    { label: 'Leave requests', href: '/hr/leave', description: 'Track leave applications and approvals.' },
    { label: 'Employee 360', href: '/hr/360', description: 'Open a complete employee profile view.' },
    { label: 'Payroll structures', href: '/payroll/structures', description: 'Configure salary components and rules.' },
    { label: 'Payroll assignments', href: '/payroll/assignments', description: 'Review employee payroll assignments.' },
    { label: 'Payroll runs', href: '/payroll/runs', description: 'Process payroll periods and approvals.' },
    { label: 'Payslips', href: '/payroll/payslips', description: 'Review generated salary slips.' },
  ]} />;
}
