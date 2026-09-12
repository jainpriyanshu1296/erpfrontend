'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
export default function Page() { return <ModuleWorkspace title="Company Settings" description="Manage organization-level settings used across documents." endpoint="/settings/company" columns={['setting_key','setting_value','updated_at']} fields={[{key:'setting_key',label:'Setting key',required:true},{key:'setting_value',label:'Setting value',required:true}]} />; }
