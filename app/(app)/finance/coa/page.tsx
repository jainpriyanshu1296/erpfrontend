'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Chart of accounts' description='Maintain finance account masters for journal postings.' endpoint='/finance/accounts' columns={['account_code', 'name', 'account_type', 'is_active']} fields={[{key:'account_code',label:'Account code',type:'text',required:true},{key:'name',label:'Account name',type:'text',required:true},{key:'account_type',label:'Account type',type:'select',required:true}]} />; }
