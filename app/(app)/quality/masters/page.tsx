'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Quality masters' description='Maintain inspection templates, parameters, and acceptance criteria.' endpoint='/quality' columns={['name', 'code', 'category', 'is_active']} fields={[{key:'name',label:'Name',type:'text',required:true}]} />; }
