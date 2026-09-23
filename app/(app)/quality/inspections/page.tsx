'use client';
import { DomainPage } from '@/components/domain-page';
export default function Page() { return <DomainPage title='Inspections' description='Track incoming, in-process, and final quality inspections. Create them from the dedicated Incoming, In-Process, or Final QC pages so their source is validated.' endpoint='/quality/inspections' columns={['inspection_number','source_type','source_id','status','result']} detailPath="/quality/inspections" />; }
