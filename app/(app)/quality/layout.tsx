import type { ReactNode } from 'react';
import { ModuleSidebar } from '@/components/module-sidebar';
const items = [
  ['Dashboard','/quality'],['Inspection Templates / Masters','/quality/masters'],['Incoming QC','/quality/inward'],
  ['In-process QC','/quality/in-process'],['Final QC','/quality/final'],['NCR','/quality/ncr'],
  ['Corrective Actions','/quality/corrective-actions'],['Rejection','/quality/rejection'],['Reports','/quality/reports'],['Settings','/quality/settings'],
].map(([label,href]) => ({ label, href }));
export default function Layout({ children }: { children: ReactNode }) { return <ModuleSidebar title="Quality" items={items}>{children}</ModuleSidebar>; }
