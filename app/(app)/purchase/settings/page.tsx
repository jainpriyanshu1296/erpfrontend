'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Purchase Settings" description="Configure validated purchasing approval and matching controls." endpoint="/purchase/settings" columns={['setting_key','setting_value','updated_at']} fields={[{key:'setting_key',label:'Control',type:'select',options:['approval_required','over_receipt_tolerance','invoice_match_tolerance','default_payment_terms'],required:true},{key:'setting_value',label:'Value',required:true}]} />; }
