'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const sources: Record<string,{path:string;label:string}> = {
  item_id:{path:'/masters/items',label:'item_name'},finished_item_id:{path:'/masters/items',label:'item_name'},
  warehouse_id:{path:'/masters/warehouses',label:'warehouse_name'},from_warehouse_id:{path:'/masters/warehouses',label:'warehouse_name'},to_warehouse_id:{path:'/masters/warehouses',label:'warehouse_name'},
  vendor_id:{path:'/masters/vendors',label:'company_name'},customer_id:{path:'/masters/customers',label:'company_name'},
  bom_id:{path:'/production/bom',label:'bom_code'},work_order_id:{path:'/production/work-orders',label:'wo_number'},
  so_id:{path:'/sales/orders',label:'so_number'},production_order_id:{path:'/production/orders',label:'production_number'},
  count_id:{path:'/closure/physical-counts',label:'count_number'},requisition_id:{path:'/purchase/requisitions',label:'pr_number'},
  rfq_id:{path:'/purchase/rfqs',label:'rfq_number'},supplier_id:{path:'/masters/vendors',label:'company_name'},rfq_supplier_id:{path:'/closure/rfq/suppliers',label:'supplier_id'},
  ncr_id:{path:'/quality/ncrs',label:'ncr_number'},inspection_id:{path:'/quality/inspections',label:'inspection_number'},
};
export const hasMasterSource = (key:string) => Boolean(sources[key]);
export function MasterSelect({field,value,onChange,required,className}:{field:string;value:string;onChange:(value:string)=>void;required?:boolean;className?:string}) {
  const [search,setSearch] = useState('');
  const source = sources[field];
  const query = useQuery({queryKey:['master-select',source.path,search],queryFn:()=>api.get<Array<Record<string,unknown>>>(source.path,{search,limit:'100',page:'1'})});
  const rows = query.data?.data || [];
  return <span className="block space-y-1"><input aria-label={`Search ${field.replaceAll('_',' ')}`} placeholder="Search options" value={search} onChange={event=>setSearch(event.target.value)} className={className} />
    <select aria-label={field.replaceAll('_',' ')} required={required} value={value} onChange={event=>onChange(event.target.value)} className={className} disabled={query.isPending || query.isError}>
      <option value="">{query.isPending?'Loading…':'Select a record'}</option>
      {value && !rows.some(row=>String(row.id)===value) && <option value={value}>{value}</option>}
      {rows.map(row=><option key={String(row.id)} value={String(row.id)}>{String(row[source.label] || row.id)}</option>)}
    </select>
    {query.isError && <span role="alert" className="text-red-700">Unable to load options. <button type="button" onClick={()=>query.refetch()}>Retry</button></span>}
    {query.isSuccess && !rows.length && <span className="text-slate-500">No matching records</span>}
  </span>;
}
