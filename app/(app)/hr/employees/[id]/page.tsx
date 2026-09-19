'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() { const { id } = useParams<{ id: string }>(); return <RecordDetail title="Employee 360 profile" endpoint={`/hr/employees/${id}`} backHref="/hr/masters" fields={[{key:'employee_code',label:'Employee code'},{key:'name',label:'Name'},{key:'email',label:'Email'},{key:'department',label:'Department'},{key:'designation',label:'Designation'},{key:'joining_date',label:'Joining date'},{key:'status',label:'Status'},{key:'salary',label:'Salary'}]} />; }
