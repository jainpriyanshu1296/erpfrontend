import type { ReactNode } from 'react';
import { ModuleSidebar } from '@/components/module-sidebar';

const items = [
  ['Dashboard', '/inventory'], ['Item Master', '/inventory/items'], ['Item Groups','/inventory/categories'], ['UOM','/inventory/uom'], ['Warehouses', '/inventory/warehouses'],
  ['Opening Stock / Adjustments', '/inventory/stock-adjustment'], ['Transfers', '/inventory/transfers'],
  ['Stock', '/inventory/stock'], ['Stock Ledger', '/inventory/ledger'], ['Counts', '/inventory/counts'], ['Batches','/inventory/batches'], ['Serials','/inventory/serials'], ['Reports','/inventory/reports'], ['Settings','/inventory/settings']
].map(([label, href]) => ({ label, href }));

export default function Layout({ children }: { children: ReactNode }) { return <ModuleSidebar title="Inventory" items={items}>{children}</ModuleSidebar>; }
