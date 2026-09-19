'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Employee 360' description='Search employee records and review the complete people profile.' endpoint='/hr/employees' columns={['employee_code', 'name', 'designation', 'department_id', 'basic_salary', 'is_active']} fields={[]} />; }
