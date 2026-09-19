'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='GST masters' description='Maintain GST tax master records and filing inputs.' endpoint='/gst/tax' columns={['tax_code', 'gst_rate', 'description', 'is_active']} fields={[{key:'tax_code',label:'Tax code',type:'text',required:true},{key:'gst_rate',label:'GST rate',type:'number',required:true}]} />; }
