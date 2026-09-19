'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title="Leave management" description="Review leave applications and approval status." endpoint="/hr/leaves" columns={['employee_id','leave_type','from_date','to_date','status']} fields={[{key:'employee_id',label:'Employee ID',required:true},{key:'leave_type',label:'Leave type',required:true},{key:'from_date',label:'From',type:'date',required:true},{key:'to_date',label:'To',type:'date',required:true}]} statusOptions={['pending','approved','rejected']} />; }
