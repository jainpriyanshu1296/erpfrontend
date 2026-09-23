"use client";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Printer, Search, X } from "lucide-react";
import { api, recordsApi } from "@/lib/api";
import { EmptyState, ErrorState, Skeleton } from "@/components/shared";
import { useToast } from "@/components/toast";
import { z } from "zod";
import { Pagination, positiveInteger } from "@/components/pagination";
import {MasterSelect,hasMasterSource} from '@/components/master-select';

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "password";
  required?: boolean;
  options?: Array<string | { value: string; label: string }>;
};
type Props = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  columns: string[];
  actionEndpoint?: string;
  transitionEndpoint?: string;
  detailPath?: string;
  statusOptions?: string[];
  statusParam?: string;
  exportEndpoint?: string | false;
  editable?: boolean;
};

export function ModuleWorkspace({
  title,
  description,
  endpoint,
  fields,
  columns,
  actionEndpoint,
  transitionEndpoint,
  detailPath,
  statusOptions = [],
  statusParam = "status",
  exportEndpoint = false,
  editable = false,
}: Props) {
  const client = useQueryClient();
  const resource = recordsApi(endpoint);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.get("search") || "";
  const page = positiveInteger(params.get("page"), 1);
  const limit = positiveInteger(params.get("limit"), 20, 100);
  const status = params.get("status") || "";
  const itemType = endpoint === '/inventory/items' ? params.get('item_type') || '' : '';
  const sort = params.get('sort') || '';
  const direction = params.get('direction') || 'asc';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateQuery = (next: Record<string, string>) => {
    const query = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) =>
      value ? query.set(key, value) : query.delete(key),
    );
    if (!("page" in next)) query.set("page", "1");
    router.replace(`${pathname}?${query.toString()}`);
  };
  const { showToast } = useToast();
  const query = useQuery({
    queryKey: ["workspace", endpoint, page, limit, search, status,itemType,sort,direction],
    queryFn: () =>
      resource.list({
        page: String(page),
        limit: String(limit),
        ...(itemType ? {item_type:itemType} : {}),
        ...(sort ? {sort,direction} : {}),
        ...(search ? { search } : {}),
        ...(status
          ? {
              [statusParam]:
                statusParam === "is_active"
                  ? status === "active"
                    ? "1"
                    : "0"
                  : status,
            }
          : {}),
      }),
  });
  const rows = (query.data?.data || []) as Record<string, unknown>[];
  const mutation = useMutation({
    mutationFn: () => {
      const schema = z.object(
        Object.fromEntries(
          fields.map((field) => [
            field.key,
            field.required
              ? z.string().trim().min(1, `${field.label} is required`)
              : z.string().optional(),
          ]),
        ) as z.ZodRawShape,
      );
      const parsed = schema.safeParse(form);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues[0]?.message || "Please review the form",
        );
      const body = Object.fromEntries(fields.map(field => [field.key,
        field.type === "number" && parsed.data[field.key] !== "" && parsed.data[field.key] !== undefined
          ? Number(parsed.data[field.key]) : parsed.data[field.key]]));
      return editingId ? resource.update(editingId, body) : resource.create(body);
    },
    onSuccess: () => {
      setForm({});
      setOpen(false);
      client.invalidateQueries({ queryKey: ["workspace", endpoint] });
      setEditingId(null);
      showToast(`${title} saved successfully`, "success");
    },
    onError: (error) => showToast(error.message, "error"),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      transitionEndpoint
        ? api.post(`${transitionEndpoint}/${id}/transition`, { status: value })
        : actionEndpoint
          ? api.put(`${actionEndpoint}/${id}/status`, { status: value })
          : resource.update(id, { status: value }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["workspace", endpoint] });
      showToast("Status updated successfully", "success");
    },
    onError: (error) => showToast(error.message, "error"),
  });
  const exportFile = async (type: "xlsx" | "pdf") => {
    const base =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const target = exportEndpoint || `/reports/${endpoint.split("/").filter(Boolean).pop()}/export.${type}`;
    const response = await fetch(
      `${base}${target}`,
      { credentials: "include" },
    );
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.replaceAll(" ", "_")}.${type}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const visibleColumns = useMemo(
    () =>
      columns.length
        ? columns
        : rows[0]
          ? Object.keys(rows[0]).slice(0, 8)
          : [],
    [columns, rows],
  );
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            ERP module
          </p>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <Printer size={15} className="mr-2 inline" />
            Print
          </button>
          {exportEndpoint !== false && <button
            onClick={() => exportFile("xlsx")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <Download size={15} className="mr-2 inline" />
            Excel
          </button>}
          {fields.length > 0 && <button
              onClick={() => { setEditingId(null); setForm({}); setOpen(true); }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={15} className="mr-2 inline" />
              Create
            </button>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <Search size={18} className="text-slate-400" />
        <input
          defaultValue={search}
          onKeyDown={(event) => {
            if (event.key === "Enter")
              updateQuery({ search: event.currentTarget.value });
          }}
          placeholder={`Search ${title.toLowerCase()}...`}
          className="min-w-0 flex-1 outline-none"
        />
        {statusOptions.length > 0 && (
          <select
            value={status}
            onChange={(event) => updateQuery({ status: event.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        )}
        {endpoint === '/inventory/items' && <select aria-label="Item type" value={itemType} onChange={event=>updateQuery({item_type:event.target.value})} className="rounded-lg border px-3 py-2 text-sm"><option value="">All item types</option>{['raw_material','finished_good','semi_finished','consumable','service'].map(type=><option key={type} value={type}>{type.replaceAll('_',' ')}</option>)}</select>}
        <select aria-label="Sort by" value={sort} onChange={event=>updateQuery({sort:event.target.value})} className="rounded-lg border px-3 py-2 text-sm"><option value="">Default order</option>{columns.map(column=><option key={column} value={column}>{column.replaceAll('_',' ')}</option>)}</select>
        <select aria-label="Sort direction" value={direction} onChange={event=>updateQuery({direction:event.target.value})} className="rounded-lg border px-3 py-2 text-sm"><option value="asc">Ascending</option><option value="desc">Descending</option></select>
      </div>
      {open && fields.length > 0 && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit" : "Create"} {title}</h2>
            <button type="button" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <label key={field.key} className="text-sm font-medium">
                {field.label}
                {hasMasterSource(field.key) && field.type !== 'select' ? <MasterSelect field={field.key} required={field.required} value={form[field.key] || ''} onChange={value=>setForm({...form,[field.key]:value})} className="mt-1 w-full rounded-lg border px-3 py-2" /> : field.type === "select" ? (
                  <select
                    required={field.required}
                    value={form[field.key] || ""}
                    onChange={(event) =>
                      setForm({ ...form, [field.key]: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>{typeof option === "string" ? option : option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required={field.required}
                    type={field.type || "text"}
                    value={form[field.key] || ""}
                    onChange={(event) =>
                      setForm({ ...form, [field.key]: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>
            <button
              disabled={mutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save record"}
            </button>
          </div>
          {mutation.isError && (
            <p className="mt-3 text-sm text-red-600">
              {mutation.error.message}
            </p>
          )}
        </form>
      )}
      {query.isPending ? (
        <Skeleton className="h-72" />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          retry={() => query.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} found`}
          description="Try changing the search or status filter, or create the first record."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap p-3 font-semibold"
                    >
                      {column.replaceAll("_", " ")}
                    </th>
                  ))}
                  {(actionEndpoint || editable) && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={String(row.id || index)}
                    onClick={() =>
                      detailPath &&
                      row.id &&
                      router.push(`${detailPath}/${row.id}`)
                    }
                    className={`border-b last:border-0 hover:bg-indigo-50/40 ${detailPath ? "cursor-pointer" : ""}`}
                  >
                    {visibleColumns.map((column) => (
                      <td key={column} className="whitespace-nowrap p-3">
                        {String(row[column] ?? "-")}
                      </td>
                    ))}
                    {(actionEndpoint || editable) && Boolean(row.id) && (
                      <td className="p-3">
                        <div className="flex gap-1">
                          {editable && <button type="button" className="rounded border px-2 py-1" onClick={event => {
                            event.stopPropagation(); setEditingId(String(row.id));
                            setForm(Object.fromEntries(fields.map(field => [field.key, String(row[field.key] ?? "")]))); setOpen(true);
                          }}>Edit</button>}
                          {actionEndpoint && statusOptions.map((option) => (
                            <button
                              key={option}
                              disabled={
                                String(row.status) === option ||
                                statusMutation.isPending
                              }
                              onClick={(event) => {
                                event.stopPropagation();
                                statusMutation.mutate({
                                  id: String(row.id),
                                  value: option,
                                });
                              }}
                              className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700 disabled:opacity-40"
                            >
                              {option.replaceAll("_", " ")}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {query.isSuccess && <Pagination page={page} limit={limit} total={Number(query.data?.meta?.total || 0)} busy={query.isFetching} onPage={value => updateQuery({ page: String(value) })} onLimit={value => updateQuery({ limit: String(value), page: "1" })} />}
    </section>
  );
}
