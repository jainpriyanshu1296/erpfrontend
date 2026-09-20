import type { ReactNode } from 'react';
import { ModuleSidebar } from '@/components/module-sidebar';
const items = [
  ['Dashboard','/sales'],['Quotations','/sales/quotations'],['Sales Orders','/sales/orders'],['Delivery Challans','/sales/challans'],
  ['Dispatch','/sales/dispatch'],['Sales Invoices','/sales/invoices'],['Sales Returns','/sales/returns'],['Customers','/sales/customers'],
  ['Receivables','/sales/receivables'],['Reports','/sales/reports'],['Settings','/sales/settings'],
].map(([label,href]) => ({ label, href }));
export default function Layout({ children }: { children: ReactNode }) { return <ModuleSidebar title="Sales & Dispatch" items={items}>{children}</ModuleSidebar>; }
