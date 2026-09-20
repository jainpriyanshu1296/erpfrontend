'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Quality Settings" description="Configure inspection, sampling and disposition controls." endpoint="/quality/settings" columns={['setting_key','setting_value','updated_at']} fields={[{key:'setting_key',label:'Control',type:'select',options:['incoming_qc_required','in_process_qc_required','final_qc_required','auto_ncr_on_failure','default_quarantine_warehouse'],required:true},{key:'setting_value',label:'Value',required:true}]} />; }
