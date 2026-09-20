'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Sales Settings" description="Configure order, dispatch, credit and invoice controls." endpoint="/sales/settings" columns={['setting_key','setting_value','updated_at']} fields={[{key:'setting_key',label:'Control',type:'select',options:['credit_limit_enforced','negative_stock_allowed','dispatch_requires_confirmation','default_payment_terms'],required:true},{key:'setting_value',label:'Value',required:true}]} />; }
