'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='HR masters' description='Manage people, departments, designations, and employment settings.' endpoint='/hr/employees' columns={['employee_code','name','email','department','designation','joining_date','status','salary']} fields={[{key:'employee_code',label:'Employee code',type:'text',required:true},{key:'name',label:'Full name',type:'text',required:true},{key:'designation',label:'Designation',type:'text'}]} detailPath="/hr/employees" />; }
