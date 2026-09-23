import type { ReactNode } from 'react';
import { ModuleSidebar } from '@/components/module-sidebar';
const items = [['Dashboard','/production/dashboard'],['BOM','/production/bom'],['Production Orders','/production/orders'],['Work Orders','/production/work-orders'],['Job Cards','/production/job-cards'],['Material Issue','/production/material-issue'],['Output','/production/output'],['Scrap / Rejection','/production/scrap'],['WIP / MRP','/production/mrp'],['Reports','/production/reports'],['Settings','/production/settings']].map(([label,href])=>({label,href}));
export default function Layout({children}:{children:ReactNode}) { return <ModuleSidebar title="Production" items={items}>{children}</ModuleSidebar>; }
