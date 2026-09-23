'use client';
import { ModuleWorkspace } from '@/components/module-workspace';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';
export default function Page() {
  const units = useQuery({ queryKey: ['masters', 'uom'], queryFn: () => api.get<Array<{id: string; uom_name: string; uom_code: string}>>('/masters/uom') });
  if (units.isPending) return <Skeleton className="h-64" />;
  if (units.isError) return <ErrorState message={units.error.message} retry={() => units.refetch()} />;
  return <ModuleWorkspace title="Item Master" description="Canonical items for purchase, sales, quality and production. Deactivate an item to hide it from new transaction selectors without deleting history." endpoint="/inventory/items" editable detailPath="/inventory/items" statusParam="is_active" statusOptions={['active','inactive']} columns={['item_code','item_name','item_type','category','uom_id','gst_rate','reorder_level','is_active']} fields={[
    {key:'item_code',label:'Item code',required:true},
    {key:'item_name',label:'Item name',required:true},
    {key:'item_type',label:'Item type',type:'select',options:['raw_material','finished_good','semi_finished','consumable','service'],required:true},
    {key:'category',label:'Category'},
    {key:'uom_id',label:'UOM',type:'select',options:units.data.data.map(unit=>({value:unit.id,label:unit.uom_name || unit.uom_code})),required:true},
    {key:'gst_rate',label:'GST rate',type:'number'},
    {key:'reorder_level',label:'Reorder level',type:'number'},
    {key:'standard_cost',label:'Standard cost',type:'number'},
    {key:'is_active',label:'Active',type:'select',options:[{value:'1',label:'Active'},{value:'0',label:'Inactive'}]}
  ]} />;
}
