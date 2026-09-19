'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Leave management' description='Review leave applications and approval status.' endpoint='/hr/leaves' columns={['employee_id','from_date','to_date','days','status']} fields={[{key:'employee_id',label:'Employee ID',type:'text',required:true},{key:'from_date',label:'From',type:'date',required:true},{key:'to_date',label:'To',type:'date',required:true}]} statusOptions={['pending','approved','rejected']} detailPath="/hr/leave" />; }
