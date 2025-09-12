// app/orders/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/** ----------------------------
 * Types & Mock Data (replace later)
 * ----------------------------- */
type OrderType = "Property" | "VOI" | "AML" | "Company";
type OrderStatus = "In Progress" | "Completed" | "Needs Attention";

interface Order {
  id: string;              // e.g. #LS-1024
  reference?: string;      // external reference if you have one
  type: OrderType;
  status: OrderStatus;
  customer?: string;
  addressOrSubject?: string;
  createdAt: string;       // ISO or yyyy-mm-dd
  updatedAt: string;       // ISO or yyyy-mm-dd
}

const MOCK_ORDERS: Order[] = [
  {
    id: "#LS-1024",
    reference: "VOI-1757",
    type: "Property",
    status: "In Progress",
    customer: "John Smith",
    addressOrSubject: "123 Maple Street, Anytown",
    createdAt: "2025-03-10",
    updatedAt: "2025-03-10",
  },
  {
    id: "#LS-1023",
    reference: "COMP-1444",
    type: "Company",
    status: "Completed",
    customer: "Acme Corp",
    addressOrSubject: "Director report",
    createdAt: "2025-03-09",
    updatedAt: "2025-03-09",
  },
  {
    id: "#LS-1022",
    reference: "VOI-1756",
    type: "VOI",
    status: "Needs Attention",
    customer: "Jane Doe",
    addressOrSubject: "VOI + AML",
    createdAt: "2025-03-08",
    updatedAt: "2025-03-08",
  },
  {
    id: "#LS-1021",
    reference: "AML-2231",
    type: "AML",
    status: "Completed",
    customer: "Peter Parker",
    addressOrSubject: "PEP/Sanctions screen",
    createdAt: "2025-03-07",
    updatedAt: "2025-03-07",
  },
  {
    id: "#LS-1020",
    reference: "PROP-8832",
    type: "Property",
    status: "Completed",
    customer: "Wayne Enterprises",
    addressOrSubject: "10 Queen St",
    createdAt: "2025-03-05",
    updatedAt: "2025-03-05",
  },
];

/** Utilities */
const TYPES: OrderType[] = ["Property", "VOI", "AML", "Company"];
const STATUSES: OrderStatus[] = ["In Progress", "Completed", "Needs Attention"];

function chipCls(status: OrderStatus) {
  if (status === "Completed") return "bg-green-100 text-green-800";
  if (status === "Needs Attention") return "bg-yellow-100 text-yellow-900";
  return "bg-blue-100 text-blue-800";
}

export default function OrdersPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"All" | OrderType>("All");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [sort, setSort] = useState<"updated-desc" | "updated-asc" | "created-desc" | "created-asc">(
    "updated-desc"
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const rows = useMemo(() => {
    let r = [...MOCK_ORDERS];

    // text search across a few fields
    const needle = q.trim().toLowerCase();
    if (needle) {
      r = r.filter((o) =>
        [o.id, o.reference, o.customer, o.addressOrSubject]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }

    if (type !== "All") r = r.filter((o) => o.type === type);
    if (status !== "All") r = r.filter((o) => o.status === status);

    // sort
    r.sort((a, b) => {
      const au = new Date(a.updatedAt).getTime();
      const bu = new Date(b.updatedAt).getTime();
      const ac = new Date(a.createdAt).getTime();
      const bc = new Date(b.createdAt).getTime();

      switch (sort) {
        case "updated-desc":
          return bu - au;
        case "updated-asc":
          return au - bu;
        case "created-desc":
          return bc - ac;
        case "created-asc":
          return ac - bc;
      }
    });

    return r;
  }, [q, type, status, sort]);

  // pagination
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  // keep page in range when filters change
  if (page > pages) setPage(1);

  return (
    <div className="space-y-4">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border px-3 py-2 hover:bg-neutral-50">
            + New Property Search
          </Link>
          <Link href="/voi" className="btn-primary">
            + Start VOI / AML
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search orders (ID, ref, customer, subject)…"
          className="w-full rounded-lg border px-3 py-2"
        />

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as any);
            setPage(1);
          }}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option>All</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as any);
            setPage(1);
          }}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="updated-desc">Sort: Updated (newest)</option>
          <option value="updated-asc">Sort: Updated (oldest)</option>
          <option value="created-desc">Sort: Created (newest)</option>
          <option value="created-asc">Sort: Created (oldest)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="px-3 py-2">Order ID</th>
              <th className="px-3 py-2">Reference</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-neutral-500">
                  No orders match your filters.
                </td>
              </tr>
            )}

            {pageRows.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-3 font-medium">{o.id}</td>
                <td className="px-3 py-3">{o.reference ?? "—"}</td>
                <td className="px-3 py-3">{o.type}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${chipCls(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-3">{o.customer ?? "—"}</td>
                <td className="px-3 py-3 truncate">{o.addressOrSubject ?? "—"}</td>
                <td className="px-3 py-3">{o.createdAt}</td>
                <td className="px-3 py-3">{o.updatedAt}</td>
                <td className="px-3 py-3 text-right">
                  {/* For now just link to the relevant area. Later you can add /orders/[id] details. */}
                  <Link href={destForType(o.type)} className="text-[#cc3369] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Showing <b>{pageRows.length}</b> of <b>{total}</b> orders
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm">
            Page <b>{page}</b> / <b>{pages}</b>
          </span>
          <button
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function destForType(t: OrderType) {
  if (t === "Property") return "/";
  if (t === "Company") return "/company";
  return "/voi"; // VOI or AML
}