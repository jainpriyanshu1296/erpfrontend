'use client';
import { useParams } from 'next/navigation';
import { RecordDetail } from '@/components/record-detail';
export default function Page() { const { id } = useParams<{ id: string }>(); return <RecordDetail title="Leave request" endpoint={`/hr/leaves/${id}`} backHref="/hr/leave" fields={[{key:'employee_id',label:'Employee ID'},{key:'from_date',label:'From'},{key:'to_date',label:'To'},{key:'days',label:'Days'},{key:'status',label:'Status'}]} />; }
