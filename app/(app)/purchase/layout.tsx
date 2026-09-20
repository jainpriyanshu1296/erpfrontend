import type { ReactNode } from 'react';
import { ModuleSidebar } from '@/components/module-sidebar';
const items = [
  ['Dashboard','/purchase'],['Requisitions','/purchase/requisitions'],['RFQ','/purchase/rfqs'],['Vendors','/purchase/vendors'],
  ['Purchase Orders','/purchase/orders'],['Receipts / GRN','/purchase/grn'],['Purchase Returns','/purchase/returns'],
  ['Purchase Invoices','/purchase/invoices'],['Analytics / Reports','/purchase/reports'],['Settings','/purchase/settings'],
].map(([label,href]) => ({ label, href }));
export default function Layout({ children }: { children: ReactNode }) { return <ModuleSidebar title="Purchase" items={items}>{children}</ModuleSidebar>; }
